const API = "http://localhost:3000";

const email = document.getElementById("email");
const password = document.getElementById("password");
const role = document.getElementById("role");
const msg = document.getElementById("msg");

function getUserRole() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
}

const userRole = getUserRole();


async function login() {
    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    const data = await res.json();

    if (!res.ok) {
        msg.innerText = data.message || "Login failed";
        return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "products.html";
}

async function register() {
    const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    const data = await res.json();

    if (!res.ok) {
        msg.innerText = data.message || "Registration failed";
        msg.style.color = "red";
        return;
    }

    msg.style.color = "green";
    msg.innerText = "Registered successfully. You can now log in.";
}


function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

async function loadProducts() {
    const res = await fetch(`${API}/api/products`);
    const products = await res.json();

    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isAdmin = payload.role === "admin";

    const list = document.getElementById("products");
    list.innerHTML = "";

    products.forEach(p => {

        if (!isAdmin && p.stock_quantity <= 0) {
            return;
        }

        let content = "";


        if (!isAdmin) {
            content = `
        <input type="checkbox" class="product-check"
               data-id="${p._id}"
               data-price="${p.price}">
        ${p.name} — $${p.price}
        (Stock: ${p.stock_quantity})
        <input type="number"
               min="1"
               max="${p.stock_quantity}"
               value="1"
               class="qty">
      `;
        }


        if (isAdmin) {
            content = `
        ${p.name} — $${p.price}
        (Stock: ${p.stock_quantity})
        <button onclick="updateProduct('${p._id}', '${p.name}', ${p.price})">
          Update
        </button>
        <button onclick="deleteProduct('${p._id}')">
          Delete
        </button>
      `;
        }

        list.innerHTML += `<li>${content}</li>`;
    });
}


async function createProduct() {
    await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            name: name.value,
            category: category.value,
            brand: brand.value,
            price: price.value,
            stock_quantity: stock.value
        })
    });

    loadProducts();
}

async function updateProduct(id, oldName, oldPrice) {
    const name = prompt("New name:", oldName);
    const price = prompt("New price:", oldPrice);

    if (!name || !price) return;

    await fetch(`${API}/api/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ name, price })
    });

    loadProducts();
}

async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    loadProducts();
}



async function loadOrders() {
    const res = await fetch(`${API}/api/orders`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const orders = await res.json();
    const list = document.getElementById("orders");
    list.innerHTML = "";

    orders.forEach(order => {
        let itemsHtml = "";

        order.order_items.forEach(item => {
            const productName = item.product_id?.name || "Unknown product";

            itemsHtml += `
        <li>
          ${productName} × ${item.quantity}
          ($${item.unit_price})
        </li>
      `;
        });

        list.innerHTML += `
      <li>
        <strong>Order</strong>
        <ul>
          ${itemsHtml}
        </ul>
        <strong>Total:</strong> $${order.total_amount}
      </li>
    `;
    });
}



async function loadRevenue() {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.role !== "admin") {
        alert("Access denied");
        return;
    }

    const res = await fetch(
        `${API}/api/orders/analytics/revenue-by-product`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        alert("Not authorized");
        return;
    }

    const data = await res.json();
    const list = document.getElementById("analytics");
    list.innerHTML = "";

    data.forEach(item => {
        list.innerHTML += `<li>${item.productName} — $${item.revenue}</li>`;
    });
}

async function placeOrder() {
    const items = [];

    try {
        document.querySelectorAll(".product-check").forEach((check, index) => {
            if (check.checked) {
                const qtyInput = document.querySelectorAll(".qty")[index];
                const quantity = Number(qtyInput.value);
                const maxStock = Number(qtyInput.max);

                if (quantity <= 0) {
                    alert("Quantity must be at least 1");
                    throw new Error("Invalid quantity");
                }

                if (quantity > maxStock) {
                    alert(`You can select maximum ${maxStock} items (stock limit)`);
                    throw new Error("Quantity exceeds stock");
                }

                items.push({
                    product_id: check.dataset.id,
                    quantity,
                    unit_price: Number(check.dataset.price)
                });
            }
        });
    } catch {
        return;
    }

    if (items.length === 0) {
        alert("Select at least one product");
        return;
    }

    let response = await fetch(`${API}/api/orders/place`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ items })
    });

    let data = await response.json();

    if (data.requireCustomerData) {
        const full_name = prompt("Enter full name:");
        const phone = prompt("Enter phone:");
        const address = prompt("Enter address:");

        if (!full_name || !phone || !address) {
            alert("All customer fields are required");
            return;
        }

        response = await fetch(`${API}/api/orders/place`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                items,
                customerData: { full_name, phone, address }
            })
        });

        data = await response.json();
    }

    alert("Order placed successfully!");
}
