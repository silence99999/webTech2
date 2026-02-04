const API = "http://localhost:3000";

const email = document.getElementById("email");
const password = document.getElementById("password");
const role = document.getElementById("role");
const msg = document.getElementById("msg");

const PAGE_SIZE_PRODUCTS = 12;
const PAGE_SIZE_ORDERS = 6;

let productsCache = [];
let ordersCache = [];
let productsPage = 1;
let ordersPage = 1;
let productsTotal = 0;
let ordersTotal = 0;
let selectedItems = new Map();
let productFilters = {
    q: "",
    category: "",
    brand: "",
    sort: "createdAt",
    order: "desc",
    inStock: "1"
};
let orderFilters = {
    status: "",
    sort: "order_date",
    order: "desc",
    from: "",
    to: ""
};

function getUserRole() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
}

const userRole = getUserRole();

function setMessage(text, color = "#7ef9b4") {
    if (!msg) return;
    msg.style.color = color;
    msg.innerText = text;
}

function renderPagination(containerId, currentPage, totalPages, target) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = `
        <button class="ghost-btn" data-target="${target}" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
            Prev
        </button>
    `;

    for (let i = 1; i <= totalPages; i += 1) {
        html += `
            <button class="${i === currentPage ? "active" : ""}" data-target="${target}" data-page="${i}">
                ${i}
            </button>
        `;
    }

    html += `
        <button class="ghost-btn" data-target="${target}" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
            Next
        </button>
    `;

    container.innerHTML = html;
}

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
        setMessage(data.message || "Login failed", "#ff8b8b");
        return;
    }

    localStorage.setItem("token", data.token);
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    window.location.href = payload.role === "admin"
        ? "admin-products.html"
        : "products.html";
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
        setMessage(data.message || "Registration failed", "#ff8b8b");
        return;
    }

    setMessage("Registered successfully. You can now log in.");
}

function resetPassword() {
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");

    if (!newPassword || !confirmPassword) return;

    if (!newPassword.value.trim() || !confirmPassword.value.trim()) {
        setMessage("Please fill out both password fields.", "#ffcc7a");
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        setMessage("Passwords do not match.", "#ff8b8b");
        return;
    }

    setMessage("Password updated. You can now log in.");
    newPassword.value = "";
    confirmPassword.value = "";
}


function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function renderProducts() {
    const list = document.getElementById("products");
    if (!list) return;

    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isAdmin = payload.role === "admin";

    const totalPages = Math.max(1, Math.ceil(productsTotal / PAGE_SIZE_PRODUCTS));
    productsPage = Math.min(productsPage, totalPages);

    list.innerHTML = "";

    productsCache.forEach(p => {
        let content = "";

        if (!isAdmin) {
            content = `
        <div class="product-item">
          <div class="product-main">
            <div>
              <div class="product-name">${p.name}</div>
              <div class="muted">${p.brand || "Brand"} - ${p.category || "Category"}</div>
            </div>
            <div class="product-meta">
              <span class="tag">$${p.price}</span>
              <span class="muted">Stock: ${p.stock_quantity}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="select-btn ${selectedItems.has(p._id) ? "selected" : ""}"
                    data-id="${p._id}"
                    data-price="${p.price}">
              ${selectedItems.has(p._id) ? "Selected" : "Add to Order"}
            </button>
            <input type="number"
                   min="1"
                   max="${p.stock_quantity}"
                   value="${selectedItems.get(p._id)?.quantity || 1}"
                   class="qty"
                   data-id="${p._id}">
          </div>
        </div>
      `;
        }

        if (isAdmin) {
            content = `
        <div class="product-item">
          <div class="product-main">
            <div>
              <div class="product-name">${p.name}</div>
              <div class="muted">${p.brand || "Brand"} - ${p.category || "Category"}</div>
            </div>
            <div class="product-meta">
              <span class="tag">$${p.price}</span>
              <span class="muted">Stock: ${p.stock_quantity}</span>
            </div>
          </div>
          <div class="product-actions">
            <button onclick="updateProduct('${p._id}', '${p.name}', ${p.price})">
              Update
            </button>
            <button class="ghost-btn" onclick="deleteProduct('${p._id}')">
              Delete
            </button>
          </div>
        </div>
      `;
        }

        list.innerHTML += `<li>${content}</li>`;
    });

    renderPagination("products-pagination", productsPage, totalPages, "products");
}

async function loadProducts() {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isAdmin = payload.role === "admin";
    const inStock = isAdmin ? "" : productFilters.inStock;
    const params = new URLSearchParams();
    params.set("page", String(productsPage));
    params.set("limit", String(PAGE_SIZE_PRODUCTS));
    params.set("sort", productFilters.sort);
    params.set("order", productFilters.order);
    if (productFilters.q) params.set("q", productFilters.q);
    if (productFilters.category) params.set("category", productFilters.category);
    if (productFilters.brand) params.set("brand", productFilters.brand);
    if (inStock) params.set("inStock", inStock);

    const res = await fetch(`${API}/api/products?${params.toString()}`);
    const data = await res.json();
    productsCache = Array.isArray(data.items) ? data.items : [];
    productsTotal = Number.isFinite(data.total) ? data.total : productsCache.length;
    renderProducts();
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



function renderOrders() {
    const list = document.getElementById("orders");
    if (!list) return;

    const totalPages = Math.max(1, Math.ceil(ordersTotal / PAGE_SIZE_ORDERS));
    ordersPage = Math.min(ordersPage, totalPages);

    list.innerHTML = "";

    ordersCache.forEach(order => {
        let itemsHtml = "";
        const isAdmin = getUserRole() === "admin";
        const canPay = !isAdmin && order.order_status === "pending";
        const canCancel = !isAdmin && ["pending", "paid"].includes(order.order_status);

        order.order_items.forEach(item => {
            const productName = item.product_id?.name || "Unknown product";

            itemsHtml += `
        <li>
          ${productName} x ${item.quantity}
          ($${item.unit_price})
        </li>
      `;
        });

        list.innerHTML += `
      <li>
        <div class="product-main">
          <div class="product-name">Order</div>
          <span class="tag">$${order.total_amount}</span>
        </div>
        <div class="muted">Status: ${order.order_status || "pending"}</div>
        <ul>
          ${itemsHtml}
        </ul>
        ${(!isAdmin && (canPay || canCancel)) ? `
          <div class="product-actions">
            ${canPay ? `
              <button onclick="updateOrderStatus('${order._id}', 'paid')">
                Pay
              </button>
            ` : ""}
            ${canCancel ? `
              <button class="ghost-btn" onclick="updateOrderStatus('${order._id}', 'cancelled')">
                Cancel
              </button>
            ` : ""}
          </div>
        ` : ""}
      </li>
    `;
    });

    renderPagination("orders-pagination", ordersPage, totalPages, "orders");
}

async function loadOrders() {
    const res = await fetch(
        `${API}/api/orders?${getOrdersQuery()}`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    const data = await res.json();
    ordersCache = Array.isArray(data.items) ? data.items : [];
    ordersTotal = Number.isFinite(data.total) ? data.total : ordersCache.length;
    renderOrders();
}

function getOrdersQuery() {
    const params = new URLSearchParams();
    params.set("page", String(ordersPage));
    params.set("limit", String(PAGE_SIZE_ORDERS));
    params.set("sort", orderFilters.sort);
    params.set("order", orderFilters.order);
    if (orderFilters.status) params.set("status", orderFilters.status);
    if (orderFilters.from) params.set("from", orderFilters.from);
    if (orderFilters.to) params.set("to", orderFilters.to);
    return params.toString();
}

async function updateOrderStatus(orderId, status) {
    const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (!res.ok) {
        alert(data.message || "Failed to update order");
        return;
    }

    loadOrders();
}

async function loadAdminSummary() {
    const productsRes = await fetch(`${API}/api/products?page=1&limit=1`);
    const ordersRes = await fetch(
        `${API}/api/orders?page=1&limit=1`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
    const revenueRes = await fetch(
        `${API}/api/orders/analytics/revenue-by-product`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    const productsData = await productsRes.json();
    const ordersData = await ordersRes.json();
    const revenueData = await revenueRes.json();

    const totalProducts = Number.isFinite(productsData.total) ? productsData.total : 0;
    const totalOrders = Number.isFinite(ordersData.total) ? ordersData.total : 0;
    const totalRevenue = Array.isArray(revenueData)
        ? revenueData.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
        : 0;

    const productsEl = document.getElementById("stat-products");
    const ordersEl = document.getElementById("stat-orders");
    const revenueEl = document.getElementById("stat-revenue");

    if (productsEl) productsEl.innerText = totalProducts;
    if (ordersEl) ordersEl.innerText = totalOrders;
    if (revenueEl) revenueEl.innerText = `$${totalRevenue.toFixed(2)}`;

    const recentRes = await fetch(
        `${API}/api/orders?page=1&limit=5&sort=order_date&order=desc`,
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
    const recentData = await recentRes.json();
    const recentList = document.getElementById("recent-orders");
    if (recentList) {
        recentList.innerHTML = "";
        const items = Array.isArray(recentData.items) ? recentData.items : [];
        items.forEach(order => {
            recentList.innerHTML += `
                <li>
                  <div class="product-main">
                    <div class="product-name">${order.user_id?.email || "User"}</div>
                    <span class="tag">$${order.total_amount}</span>
                  </div>
                  <div class="muted">${new Date(order.order_date).toLocaleDateString()}</div>
                </li>
            `;
        });
    }
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

    for (const [id, data] of selectedItems.entries()) {
        const qtyInput = document.querySelector(`.qty[data-id="${id}"]`);
        const quantity = qtyInput ? Number(qtyInput.value) : data.quantity;
        const maxStock = qtyInput ? Number(qtyInput.max) : Number.POSITIVE_INFINITY;

        if (quantity <= 0) {
            alert("Quantity must be at least 1");
            return;
        }

        if (quantity > maxStock) {
            alert(`You can select maximum ${maxStock} items (stock limit)`);
            return;
        }

        items.push({
            product_id: id,
            quantity,
            unit_price: data.unit_price
        });
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

    const data = await response.json();

    if (!response.ok) {
        alert(data.message || "Failed to place order");
        return;
    }

    selectedItems.clear();
    alert("Order placed successfully!");
    loadProducts();
}

document.addEventListener("click", (event) => {
    const selectButton = event.target.closest(".select-btn");
    if (selectButton) {
        const id = selectButton.dataset.id;
        const price = Number(selectButton.dataset.price);
        const qtyInput = document.querySelector(`.qty[data-id="${id}"]`);
        const quantity = qtyInput ? Number(qtyInput.value) : 1;

        if (selectedItems.has(id)) {
            selectedItems.delete(id);
            selectButton.classList.remove("selected");
            selectButton.textContent = "Add to Order";
        } else {
            selectedItems.set(id, { quantity, unit_price: price });
            selectButton.classList.add("selected");
            selectButton.textContent = "Selected";
        }
    }

    const button = event.target.closest("button[data-target][data-page]");
    if (!button) return;

    const target = button.dataset.target;
    const page = Number(button.dataset.page);

    if (!Number.isFinite(page)) return;

    if (target === "products") {
        productsPage = page;
        loadProducts();
    }

    if (target === "orders") {
        ordersPage = page;
        loadOrders();
    }
});

document.addEventListener("input", (event) => {
    const qtyInput = event.target.closest(".qty");
    if (!qtyInput) return;

    const id = qtyInput.dataset.id;
    const quantity = Number(qtyInput.value);
    const maxStock = Number(qtyInput.max);

    if (!selectedItems.has(id)) return;

    if (quantity <= 0 || quantity > maxStock) return;

    const current = selectedItems.get(id);
    selectedItems.set(id, { ...current, quantity });
});

document.addEventListener("DOMContentLoaded", () => {
    const productsList = document.getElementById("products");
    const ordersList = document.getElementById("orders");
    const adminSummary = document.getElementById("admin-summary");
    const productSearch = document.getElementById("product-search");
    const productCategory = document.getElementById("product-category");
    const productBrand = document.getElementById("product-brand");
    const productSort = document.getElementById("product-sort");
    const productInStock = document.getElementById("product-instock");
    const orderStatus = document.getElementById("order-status");
    const orderSort = document.getElementById("order-sort");
    const orderFrom = document.getElementById("order-from");
    const orderTo = document.getElementById("order-to");

    if (productsList) {
        loadProducts();
    }

    if (ordersList) {
        loadOrders();
        if (getUserRole() === "admin") {
            loadRevenue();
        }
    }

    if (adminSummary) {
        loadAdminSummary();
    }

    if (productSearch) {
        productSearch.addEventListener("input", () => {
            productFilters.q = productSearch.value.trim();
            productsPage = 1;
            loadProducts();
        });
    }

    if (productCategory) {
        productCategory.addEventListener("input", () => {
            productFilters.category = productCategory.value.trim();
            productsPage = 1;
            loadProducts();
        });
    }

    if (productBrand) {
        productBrand.addEventListener("input", () => {
            productFilters.brand = productBrand.value.trim();
            productsPage = 1;
            loadProducts();
        });
    }

    if (productSort) {
        productSort.addEventListener("change", () => {
            const [field, order] = productSort.value.split("-");
            productFilters.sort = field;
            productFilters.order = order;
            productsPage = 1;
            loadProducts();
        });
    }

    if (productInStock) {
        productInStock.addEventListener("change", () => {
            productFilters.inStock = productInStock.value;
            productsPage = 1;
            loadProducts();
        });
    }

    if (orderStatus) {
        orderStatus.addEventListener("change", () => {
            orderFilters.status = orderStatus.value;
            ordersPage = 1;
            loadOrders();
        });
    }

    if (orderSort) {
        orderSort.addEventListener("change", () => {
            const [field, order] = orderSort.value.split("-");
            orderFilters.sort = field;
            orderFilters.order = order;
            ordersPage = 1;
            loadOrders();
        });
    }

    if (orderFrom) {
        orderFrom.addEventListener("change", () => {
            orderFilters.from = orderFrom.value;
            ordersPage = 1;
            loadOrders();
        });
    }

    if (orderTo) {
        orderTo.addEventListener("change", () => {
            orderFilters.to = orderTo.value;
            ordersPage = 1;
            loadOrders();
        });
    }
});
