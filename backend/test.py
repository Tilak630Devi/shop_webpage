import requests

BASE_URL = "http://localhost:5000"

# --- 1. Health check ---
print("🔍 Health Check:")
res = requests.get(f"{BASE_URL}/health")
print(res.json())

# --- 2. Admin login ---
print("\n🔑 Admin Login:")
admin_login = requests.post(f"{BASE_URL}/admin/login", json={
    "username": "admin",
    "password": "admin"
})
admin_data = admin_login.json()
print(admin_data)
admin_token = admin_data.get("token") or admin_data.get("data", {}).get("token")
headers_admin = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

# --- 3. Create product ---
print("\n📦 Creating Product:")
new_product = {
    "name": "Test Serum",
    "slug": "test-serum",
    "mrp": 599,
    "sellingPrice": 399,
    "description": "Hydrating serum for testing",
    "image": "test-serum.jpg",   # ✅ added image
    "visible": True
}
res = requests.post(f"{BASE_URL}/admin/products", json=new_product, headers=headers_admin)
print(res.json())

# --- 4. User signup ----
print("\n👤 User Signup:")
user_signup = requests.post(f"{BASE_URL}/auth/signup", json={
    "phone": "4561231223",
    "name": "Test User",
    "password": "user123",
    "address": {
        "line1": "MG Road",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
    }
})
print(user_signup.json())

# --- 5. User login ---
print("\n🔓 User Login:")
user_login = requests.post(f"{BASE_URL}/auth/login", json={
    "phone": "4561231223",
    "password": "user123"
})
user_data = user_login.json()
print(user_data)
user_token = user_data.get("token") or user_data.get("data", {}).get("token")
headers_user = {"Authorization": f"Bearer {user_token}"} if user_token else {}

# --- 6. Get all products ---
print("\n📋 Product List:")
products_res = requests.get(f"{BASE_URL}/products").json()
print(products_res)

items = products_res["data"]["items"]
first_product = items[0]
product_slug = first_product.get("slug", first_product["name"].lower().replace(" ", "-"))

# --- 7. Add product to cart ---
print("\n🛒 Add to Cart:")
res = requests.post(
    f"{BASE_URL}/cart/add",
    json={"productId": first_product["_id"], "quantity": 1},  # ✅ include quantity
    headers=headers_user
)
print(res.json())

# --- 8. View Cart ---
print("\n🛒 View Cart:")
res = requests.get(f"{BASE_URL}/cart", headers=headers_user)
print(res.json())

# --- 9. Checkout ---
print("\n✅ Checkout:")
res = requests.post(f"{BASE_URL}/cart/checkout", headers=headers_user)
print(res.json())

# --- 10. Add Comment ---
print("\n💬 Add Comment:")
res = requests.post(
    f"{BASE_URL}/products/{product_slug}/comments",
    json={"text": "Awesome product!"},   # ✅ fixed key
    headers=headers_user
)
print(res.json())

# --- 11. Get Comments ---
print("\n💬 Get Comments:")
res = requests.get(f"{BASE_URL}/products/{product_slug}/comments")
print(res.json())
