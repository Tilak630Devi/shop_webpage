require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slugify = require('slugify');
const cookieParser = require('cookie-parser');

// ------------------------------
// Utils
// ------------------------------
const ok = (data) => ({ ok: true, data });
const err = (code, message, details) => ({ ok: false, error: { code, message, details } });

const requiredEnv = (key) => {
  const val = process.env[key];
  if (!val || val.trim() === '') {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
  return val;
};

const PORT = process.env.PORT || 5000;
const MONGODB_URI = requiredEnv('MONGODB_URI');
const DB_NAME = process.env.DB_NAME || 'shopDB';
const ADMIN_JWT_SECRET = requiredEnv('ADMIN_JWT_SECRET');
const USER_JWT_SECRET = requiredEnv('USER_JWT_SECRET');
const SHOP_WHATSAPP_NUMBER = requiredEnv('SHOP_WHATSAPP_NUMBER');
const CORS_ORIGIN = process.env.CORS_ORIGIN;

// ------------------------------
// App & Security
// ------------------------------
const app = express();
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use(['/admin/login', '/auth/login', '/auth/signup'], authLimiter);

// ------------------------------
// MongoDB Connection
// ------------------------------
mongoose
  .connect(MONGODB_URI, { dbName: DB_NAME })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((e) => {
    console.error('Mongo connection error:', e);
    process.exit(1);
  });
// ------------------------------
// Schemas & Models
// ------------------------------
const userAddressSchema = new mongoose.Schema(
  {
    label: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const userCartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, default: 1, min: 1 },
    priceAtAdd: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, required: true, index: true },
    name: { type: String },
    addresses: [userAddressSchema],
    cart: [userCartItemSchema],
  },
  { timestamps: true }
);

// --- mongoose schema ---
// --- Mongoose schema ---
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },   // ✅ single string
  visible: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
}, { timestamps: true });

// --- Zod validation ---
const productSchemaZod = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),                     // ✅ auto-generated if missing
  mrp: z.coerce.number(),                          // ✅ accept "100"
  sellingPrice: z.coerce.number(),                 // ✅ accept "90"
  category: z.string().min(1),
  image: z.string().min(1),                        // ✅ plain string allowed
  visible: z.coerce.boolean().default(true),       // ✅ accept "true"/"false"
  stock: z.coerce.number().default(0),             // ✅ accept "10"
  description: z.string().optional(),
});

// Create = full object required (except slug auto-gen)
const productCreateSchema = productSchemaZod;

// Patch = partial update (all fields optional)
const productPatchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  mrp: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  category: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  visible: z.coerce.boolean().optional(),
  stock: z.coerce.number().optional(),
  description: z.string().optional(),
});


productSchema.index({ name: 'text', description: 'text' });

const commentSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true, required: true },
    userPhone: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
    rating: { type: Number, min: 1, max: 5 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);
commentSchema.index({ productId: 1, createdAt: -1 });

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    qty: Number,
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userPhone: String,
    items: [orderItemSchema],
    total: Number,
    status: { type: String, default: 'initiated' },
    whatsAppThreadId: String,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Order = mongoose.model('Order', orderSchema);

// ------------------------------
// Helpers
// ------------------------------
function toSlug(name) {
  return slugify(name, { lower: true, strict: true });
}

async function ensureUniqueSlug(base) {
  let candidate = base;
  let i = 1;
  while (await Product.exists({ slug: candidate })) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

function signAdmin(payload) {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '2d' });
}
function signUser(payload) {
  return jwt.sign(payload, USER_JWT_SECRET, { expiresIn: '7d' });
}

function authAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json(err('UNAUTHENTICATED', 'Admin token missing'));
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json(err('UNAUTHENTICATED', 'Invalid admin token'));
  }
}

function authUser(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json(err('UNAUTHENTICATED', 'User token missing'));
    const decoded = jwt.verify(token, USER_JWT_SECRET);
    req.user = decoded; // { phone }
    next();
  } catch (e) {
    return res.status(401).json(err('UNAUTHENTICATED', 'Invalid user token'));
  }
}

function encodeWhatsAppMessage(text) {
  return encodeURIComponent(text);
}

function buildWhatsAppCheckoutMessage({ user, items, totals, address }) {
  const lines = [];
  lines.push('Hi! I\'d like to order:');
  items.forEach((it, idx) => {
    lines.push(`${idx + 1}) ${it.name} x${it.qty} = ₹${it.qty * it.price}`);
  });
  lines.push(`Subtotal: ₹${totals.subtotal}`);
  if (totals.mrpTotal && totals.mrpTotal > totals.subtotal) {
    lines.push(`(MRP: ₹${totals.mrpTotal}, You save: ₹${totals.mrpTotal - totals.subtotal})`);
  }
  lines.push(`Name: ${user?.name || ''}`.trim());
  lines.push(`Phone: ${user?.phone || ''}`.trim());
  if (address) {
    const addr = [address.label, address.line1, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');
    lines.push(`Address: ${addr}`);
  }
  return lines.join('\n');
}

// ------------------------------
// Validation (zod)
// ------------------------------
const phoneSchema = z.string().regex(/^\d{10}$/i, 'Phone must be 10 digits');

const signupSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(1).max(80),
  address: z.object({
    label: z.string().default('Primary'),
    line1: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4).max(10),
  }),
});

const loginUserSchema = z.object({ phone: phoneSchema });

const commentCreateSchema = z.object({
  text: z.string().min(2).max(500),
  rating: z.number().int().min(1).max(5).optional(),
});

const addToCartSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).default(1),
});

const updateCartItemSchema = z.object({ qty: z.number().int().min(1) });

// ------------------------------
// Routes
// ------------------------------
app.get('/health', (req, res) => res.json(ok({ status: 'UP' })));

// ---- Admin Auth
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json(err('VALIDATION_ERROR', 'username & password required'));
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json(err('UNAUTHENTICATED', 'Invalid credentials'));
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json(err('UNAUTHENTICATED', 'Invalid credentials'));
    const token = signAdmin({ id: admin._id, username: admin.username });
    return res.json(ok({ token }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Something went wrong'));
  }
});

// ---- Admin: Manage products
app.post('/admin/products', authAdmin, async (req, res) => {
  try {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid product', parsed.error.issues));
    const data = parsed.data;
    if (data.sellingPrice > data.mrp) return res.status(400).json(err('VALIDATION_ERROR', 'sellingPrice cannot exceed mrp'));
    const baseSlug = toSlug(data.name);
    const slug = await ensureUniqueSlug(baseSlug);
    const product = await Product.create({ ...data, slug });
    res.status(201).json(ok(product));
  } catch (e) {
    console.error("❌ Error in /admin/products [POST]:", e.message, e.stack);
    res.status(500).json(err('SERVER_ERROR', 'Failed to create product'));
  }
});

app.patch('/admin/products/:id', authAdmin, async (req, res) => {
  try {
    const parsed = productPatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid fields', parsed.error.issues));
    const data = parsed.data;
    if (data.mrp !== undefined && data.sellingPrice !== undefined && data.sellingPrice > data.mrp) {
      return res.status(400).json(err('VALIDATION_ERROR', 'sellingPrice cannot exceed mrp'));
    }
    // If name updated, optionally update slug (only if explicitly asked via ?regenSlug=1)
    let update = { ...data };
    if (data.name && (req.query.regenSlug === '1')) {
      const newSlug = await ensureUniqueSlug(toSlug(data.name));
      update.slug = newSlug;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json(err('NOT_FOUND', 'Product not found'));
    res.json(ok(product));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to update product'));
  }
});

app.delete('/admin/products/:id', authAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json(err('NOT_FOUND', 'Product not found'));
    res.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to delete product'));
  }
});

app.get('/admin/products', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, q, category, visible } = req.query;
    const p = Math.max(parseInt(page), 1);
    const l = Math.min(Math.max(parseInt(limit), 1), 100);
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (visible === 'true') filter.visible = true;
    if (visible === 'false') filter.visible = false;

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Product.countDocuments(filter),
    ]);
    res.json(ok({ items, page: p, totalPages: Math.ceil(total / l), totalItems: total }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to list products'));
  }
});

// ---- User Auth (phone-only)
app.post('/auth/signup', async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid signup', parsed.error.issues));
    const { phone, name, address } = parsed.data;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(409).json(err('ALREADY_EXISTS', 'Phone already registered'));
    const user = await User.create({ phone, name, addresses: [address], cart: [] });
    const token = signUser({ phone: user.phone });
    res.status(201).json(ok({ token, user }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to signup'));
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const parsed = loginUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid phone', parsed.error.issues));
    const { phone } = parsed.data;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found')); // per your spec: no OTP, just existence check
    const token = signUser({ phone: user.phone });
    res.json(ok({ token, user }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to login'));
  }
});

// ---- Public Products
app.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 24, q, category, sort } = req.query;
    const p = Math.max(parseInt(page), 1);
    const l = Math.min(Math.max(parseInt(limit), 1), 100);

    const filter = { visible: true };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;

    const sortMap = {
      price_asc: { sellingPrice: 1 },
      price_desc: { sellingPrice: -1 },
      newest: { createdAt: -1 },
      popular: { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip((p - 1) * l).limit(l).lean(),
      Product.countDocuments(filter),
    ]);

    // ✅ ensure images are returned as-is (full browser links from DB)
const mappedItems = items.map(p => ({
  ...p,
  image: p.image || "",   // keep single image string
}));


    res.json(ok({
      items: mappedItems,
      page: p,
      totalPages: Math.ceil(total / l),
      totalItems: total,
    }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to list products'));
  }
});


app.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, visible: true });
    if (!product) return res.status(404).json(err('NOT_FOUND', 'Product not found'));
    res.json(ok(product));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to fetch product'));
  }
});

// ---- Comments
app.get('/products/:slug/comments', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const p = Math.max(parseInt(page), 1);
    const l = Math.min(Math.max(parseInt(limit), 1), 50);
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json(err('NOT_FOUND', 'Product not found'));
    const [items, total] = await Promise.all([
      Comment.find({ productId: product._id, visible: true })
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l),
      Comment.countDocuments({ productId: product._id, visible: true }),
    ]);
    res.json(ok({ items, page: p, totalPages: Math.ceil(total / l), totalItems: total }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to list comments'));
  }
});

app.post('/products/:slug/comments', authUser, async (req, res) => {
  try {
    const parsed = commentCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid comment', parsed.error.issues));
    const product = await Product.findOne({ slug: req.params.slug, visible: true });
    if (!product) return res.status(404).json(err('NOT_FOUND', 'Product not found'));
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    const comment = await Comment.create({
      productId: product._id,
      userPhone: user.phone,
      text: parsed.data.text,
      rating: parsed.data.rating,
      visible: true,
    });
    res.status(201).json(ok(comment));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to create comment'));
  }
});

// Admin moderation
app.patch('/admin/comments/:id', authAdmin, async (req, res) => {
  try {
    const { visible, text } = req.body || {};
    const update = {};
    if (typeof visible === 'boolean') update.visible = visible;
    if (typeof text === 'string') update.text = text;
    const comment = await Comment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!comment) return res.status(404).json(err('NOT_FOUND', 'Comment not found'));
    res.json(ok(comment));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to update comment'));
  }
});

app.delete('/admin/comments/:id', authAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json(err('NOT_FOUND', 'Comment not found'));
    res.json(ok({ deleted: true }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to delete comment'));
  }
});

// ---- Cart
app.post('/cart/add', authUser, async (req, res) => {
  try {
    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid cart item', parsed.error.issues));
    const { productId, qty } = parsed.data;
    const [user, product] = await Promise.all([
      User.findOne({ phone: req.user.phone }),
      Product.findById(productId),
    ]);
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    if (!product || !product.visible) return res.status(404).json(err('NOT_FOUND', 'Product not found'));

    const existing = user.cart.find((c) => c.productId.toString() === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      user.cart.push({ productId: product._id, qty, priceAtAdd: product.sellingPrice });
    }
    await user.save();
    res.status(201).json(ok(user.cart));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to add to cart'));
  }
});

app.get('/cart', authUser, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.productId');
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    const items = user.cart.map((c) => ({
      productId: c.productId._id,
      name: c.productId.name,
      qty: c.qty,
      price: c.priceAtAdd,
      mrp: c.productId.mrp,
      slug: c.productId.slug,
    }));
    const totals = items.reduce(
      (acc, it) => {
        acc.subtotal += it.qty * it.price;
        acc.mrpTotal += it.qty * it.mrp;
        return acc;
      },
      { subtotal: 0, mrpTotal: 0 }
    );
    res.json(ok({ items, totals }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to fetch cart'));
  }
});

app.patch('/cart/item/:productId', authUser, async (req, res) => {
  try {
    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid qty', parsed.error.issues));
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    const item = user.cart.find((c) => c.productId.toString() === req.params.productId);
    if (!item) return res.status(404).json(err('NOT_FOUND', 'Cart item not found'));
    item.qty = parsed.data.qty;
    await user.save();
    res.json(ok(user.cart));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to update cart item'));
  }
});

app.delete('/cart/item/:productId', authUser, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    const before = user.cart.length;
    user.cart = user.cart.filter((c) => c.productId.toString() !== req.params.productId);
    if (user.cart.length === before) return res.status(404).json(err('NOT_FOUND', 'Cart item not found'));
    await user.save();
    res.json(ok(user.cart));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to remove cart item'));
  }
});

app.post('/cart/checkout', authUser, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.productId');
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    if (!user.cart.length) return res.status(400).json(err('EMPTY_CART', 'Cart is empty'));

    const items = user.cart.map((c) => ({
      productId: c.productId._id,
      name: c.productId.name,
      qty: c.qty,
      price: c.priceAtAdd,
    }));
    const totals = items.reduce(
      (acc, it) => {
        acc.subtotal += it.qty * it.price;
        return acc;
      },
      { subtotal: 0 }
    );

    const primaryAddress = user.addresses?.[0];
    const message = buildWhatsAppCheckoutMessage({ user, items, totals, address: primaryAddress });
    const link = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeWhatsAppMessage(message)}`;

    // Optional order snapshot
    await Order.create({
      userPhone: user.phone,
      items,
      total: totals.subtotal,
      status: 'initiated',
    });

    res.json(ok({ link, preview: { items, totals, address: primaryAddress } }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to checkout'));
  }
});

// ---- Buy Now (no cart)
app.post('/checkout/now', authUser, async (req, res) => {
  try {
    const parsed = addToCartSchema.safeParse(req.body); // reuse schema { productId, qty }
    if (!parsed.success) return res.status(400).json(err('VALIDATION_ERROR', 'Invalid request', parsed.error.issues));
    const { productId, qty } = parsed.data;
    const [user, product] = await Promise.all([
      User.findOne({ phone: req.user.phone }),
      Product.findById(productId),
    ]);
    if (!user) return res.status(404).json(err('NOT_FOUND', 'User not found'));
    if (!product || !product.visible) return res.status(404).json(err('NOT_FOUND', 'Product not found'));

    const items = [{ productId: product._id, name: product.name, qty, price: product.sellingPrice }];
    const totals = { subtotal: qty * product.sellingPrice };
    const primaryAddress = user.addresses?.[0];

    const message = buildWhatsAppCheckoutMessage({ user, items, totals, address: primaryAddress });
    const link = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeWhatsAppMessage(message)}`;

    await Order.create({ userPhone: user.phone, items, total: totals.subtotal, status: 'initiated' });

    res.json(ok({ link, preview: { item: items[0], totals } }));
  } catch (e) {
    console.error(e);
    res.status(500).json(err('SERVER_ERROR', 'Failed to build buy-now link'));
  }
});

// ------------------------------
// Bootstrap: ensure a default admin exists (username: admin / password: admin)
// ------------------------------
async function ensureDefaultAdmin() {
  const exists = await Admin.findOne({ username: 'Parth' });
}

ensureDefaultAdmin().catch(console.error);

// ------------------------------
// Start server
// ------------------------------
app.use((req, res) => res.status(404).json(err('NOT_FOUND', 'Route not found')));

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
