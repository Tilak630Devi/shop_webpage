from pymongo import MongoClient
from datetime import datetime

# ---- 1. Connect to MongoDB Atlas ----
client = MongoClient("mongodb+srv://admin:admin@shop1.2yux4fe.mongodb.net/")
db = client["shopDB"]

# ---- 2. Create Collections ----
users_col = db["users"]
products_col = db["products"]
admins_col = db["admins"]
orders_col = db["orders"]
comments_col = db["comments"]

# ---- 3. Create Indexes (prevent duplicates) ----
users_col.create_index("phone", unique=True)
admins_col.create_index("username", unique=True)   # ✅ switched to username (matches backend)
products_col.create_index("name", unique=True)

# ---- 4. Insert Admin ----
import bcrypt
hashed = bcrypt.hashpw("admin".encode(), bcrypt.gensalt()).decode()

admins_col.update_one(
    {"username": "admin"},
    {"$set": {"passwordHash": hashed}},
    upsert=True
)
# ---- 5. Insert Sample Products ----
sample_products = [
    {
        "name": "Face Serum",
        "slug": "face-serum",
        "mrp": 599,
        "sellingPrice": 399,
        "description": "Hydrating serum with vitamin C",
        "image": "serum.jpg",
        "visible": True,
        "category": "Skincare",         # ✅ new field
        "stock": 120,                   # ✅ new field
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Moisturiser",
        "slug": "moisturiser",
        "mrp": 499,
        "sellingPrice": 349,
        "description": "Lightweight moisturizer for daily use",
        "image": "moisturiser.jpg",
        "visible": True,
        "category": "Skincare",
        "stock": 85,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Lipstick",
        "slug": "lipstick",
        "mrp": 299,
        "sellingPrice": 199,
        "description": "Matte finish, long lasting",
        "image": "lipstick.jpg",
        "visible": True,
        "category": "Cosmetics",
        "stock": 200,
        "createdAt": datetime.utcnow()
    }
]

# Upsert products (will update if already exists, else insert)
for product in sample_products:
    products_col.update_one({"name": product["name"]}, {"$set": product}, upsert=True)

# ---- 6. Insert Sample User ----
users_col.update_one(
    {"phone": "9876543210"},
    {"$set": {
        "name": "Aditi",
        "password": "user123",   # ✅ added password so login works
        "address": {             # ✅ full structured address
            "line1": "Street 123",
            "city": "New Delhi",
            "state": "Delhi",
            "pincode": "110001",
            "country": "India"
        },
        "cart": [],
        "createdAt": datetime.utcnow()
    }},
    upsert=True
)

# ---- 7. Insert Sample Comment ----
product = products_col.find_one({"name": "Face Serum"})
if product:
    comments_col.update_one(
        {"productId": product["_id"], "userPhone": "9876543210"},
        {"$set": {
            "comment": "This serum is really good, made my skin glow!",
            "createdAt": datetime.utcnow()
        }},
        upsert=True
    )

print("✅ Database setup complete (admin, products, user, comments)!")
