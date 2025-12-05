// ===================================================================
// FULLY 3D DARK WATTPAD-STYLE APP WITH SIDEBAR & DASHBOARD
// ===================================================================
document.body.style.background = "linear-gradient(120deg, #1b1b1b, #121212)";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.fontFamily = "'Arial', sans-serif";
document.body.style.color = "#eee";

// ===================================================================
// APP CONTAINER
// ===================================================================
const appContainer = document.createElement("div");
appContainer.style.cssText = `display: flex; min-height: 100vh; width: 100%;`;
document.body.appendChild(appContainer);

// ---------------- SIDEBAR ----------------
const sidebar = document.createElement("div");
sidebar.style.cssText = `
    width: 260px; background:#181818; padding:30px; display:flex; flex-direction:column;
    box-shadow: 4px 0 20px rgba(0,0,0,0.7);
`;
appContainer.appendChild(sidebar);

// SYSTEM TITLE
const systemTitle = document.createElement("h1");
systemTitle.textContent = "Inventory Management System";
systemTitle.style.cssText = `
    color:#ff6f00;margin-bottom:40px;font-size:22px;
    text-shadow:0 2px 5px rgba(0,0,0,0.7); text-align:center;
`;
sidebar.appendChild(systemTitle);

// ---------------- MAIN CONTENT ----------------
const main = document.createElement("div");
main.style.cssText = `flex-grow:1; padding:40px; background:#181818; overflow:auto;`;
appContainer.appendChild(main);

// ===================================================================
// API BASE URL
// ===================================================================
const API_BASE_URL = "https://inventory-management-kq17.onrender.com/api";

// ===================================================================
// UNIVERSAL API REQUEST
// ===================================================================
async function apiRequest(endpoint, method = "GET", data = null) {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (data) options.body = JSON.stringify(data);
    const res = await fetch(API_BASE_URL + endpoint, options);
    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? null : res.json();
}

// ===================================================================
// HYPERSCRIPT HELPER
// ===================================================================
function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);

    if (tag === "button") {
        el.style.cssText = `
            background-color:#ff6f00;color:#fff;border:none;padding:12px 20px;margin:6px;
            border-radius:12px;cursor:pointer;font-weight:bold;
            box-shadow: 0 6px 15px rgba(0,0,0,0.6);
            transform: perspective(500px) translateZ(0px);
            transition: all 0.25s ease;
        `;
        el.onmouseover = () => {
            el.style.backgroundColor = "#ff8f00";
            el.style.transform = "perspective(500px) translateZ(10px)";
            el.style.boxShadow = "0 12px 25px rgba(0,0,0,0.8)";
        };
        el.onmouseout = () => {
            el.style.backgroundColor = "#ff6f00";
            el.style.transform = "perspective(500px) translateZ(0px)";
            el.style.boxShadow = "0 6px 15px rgba(0,0,0,0.6)";
        };
        el.onmousedown = () => { el.style.transform = "perspective(500px) translateZ(5px) scale(0.98)"; };
        el.onmouseup = () => { el.style.transform = "perspective(500px) translateZ(10px)"; };
    }

    if (tag === "input") {
        el.style.cssText = `
            padding:12px 16px;margin-bottom:14px;border:1px solid #333;
            border-radius:12px;width:250px;background:#222;color:#eee;
            box-shadow: inset 0 4px 8px rgba(0,0,0,0.5);
            transform: perspective(500px) translateZ(0px);
            transition: all 0.25s ease;
        `;
        el.onfocus = () => {
            el.style.borderColor = "#ff6f00";
            el.style.boxShadow = "0 0 12px rgba(255,111,0,0.7), inset 0 4px 8px rgba(0,0,0,0.6)";
            el.style.transform = "perspective(500px) translateZ(6px)";
        };
        el.onblur = () => {
            el.style.borderColor = "#333";
            el.style.boxShadow = "inset 0 4px 8px rgba(0,0,0,0.5)";
            el.style.transform = "perspective(500px) translateZ(0px)";
        };
    }

    if (tag === "table") el.style.cssText = `
        width:100%;border-collapse:collapse;margin-top:20px;
        background-color:#222;border-radius:12px;overflow:hidden;
        color:#eee;box-shadow: 0 8px 20px rgba(0,0,0,0.7);
    `;
    if (tag === "th") el.style.cssText = `
        background-color:#ff6f00;color:#fff;font-weight:bold;
        padding:14px 18px;text-align:left;
    `;
    if (tag === "td") el.style.cssText = `
        padding:14px 18px;text-align:left;border-bottom:1px solid #333;
        transition: all 0.2s ease;
    `;
    if (tag === "h2") el.style.cssText = `
        color:#ff6f00;margin-bottom:20px;
        border-bottom:2px solid #ff6f00;padding-bottom:6px;
        text-shadow: 0 2px 5px rgba(0,0,0,0.7);
    `;

    Object.entries(props).forEach(([k, v]) => {
        if (k.startsWith("on")) el.addEventListener(k.substring(2), v);
        else el[k] = v;
    });

    children.forEach(child => {
        if (typeof child === "string") child = document.createTextNode(child);
        if (child) el.appendChild(child);
    });

    return el;
}

// ===================================================================
// HIGHLIGHT ROW
// ===================================================================
function highlightRow(row) {
    row.addEventListener("mouseenter", () => {
        row.style.backgroundColor = "#333";
        row.style.transform = "perspective(500px) translateZ(4px)";
        row.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5)";
    });
    row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = "#222";
        row.style.transform = "perspective(500px) translateZ(0px)";
        row.style.boxShadow = "none";
    });
}

// ===================================================================
// CONFIRM MODAL
// ===================================================================
async function confirmAction(message) {
    return new Promise(resolve => {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:9999;
        `;
        const box = document.createElement("div");
        box.style.cssText = `
            background:#181818;padding:30px;border-radius:16px;text-align:center;
            width:350px;box-shadow: 0 12px 30px rgba(0,0,0,0.8);
            color:#eee;transform: perspective(500px) translateZ(0px);
            transition: all 0.3s ease;
        `;
        box.style.transform = "perspective(500px) translateZ(8px)";
        const msg = document.createElement("p"); msg.textContent = message;
        const yesBtn = h("button", { onclick: () => { document.body.removeChild(modal); resolve(true); } }, "Yes");
        const noBtn = h("button", { onclick: () => { document.body.removeChild(modal); resolve(false); } }, "No");
        box.append(msg, yesBtn, noBtn);
        modal.appendChild(box);
        document.body.appendChild(modal);
    });
}

// ===================================================================
// SIDEBAR BUTTON HELPER
// ===================================================================
function createSidebarButton(label, onclick) {
    const btn = h("button", { onclick }, label);
    btn.style.width = "100%";
    return btn;
}

// ===================================================================
// DASHBOARD WITH OVERVIEW
// ===================================================================
async function loadDashboard() {
    main.innerHTML = "";
    main.appendChild(h("h2", {}, "Dashboard"));

    const overviewBox = h("div", {});
    overviewBox.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 20px;
    `;

    // Create overview card helper
    function overviewCard(label, value) {
        const card = document.createElement("div");
        card.style.cssText = `
            background: #222;
            padding: 25px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 8px 18px rgba(0,0,0,0.6);
            transform: perspective(600px) translateZ(0px);
            transition: 0.3s ease;
        `;
        card.onmouseenter = () => {
            card.style.transform = "perspective(600px) translateZ(12px)";
            card.style.boxShadow = "0 12px 28px rgba(0,0,0,0.8)";
        };
        card.onmouseleave = () => {
            card.style.transform = "perspective(600px) translateZ(0px)";
            card.style.boxShadow = "0 8px 18px rgba(0,0,0,0.6)";
        };

        const title = document.createElement("h3");
        title.textContent = label;
        title.style.color = "#ff6f00";
        title.style.marginBottom = "10px";

        const val = document.createElement("p");
        val.textContent = value;
        val.style.fontSize = "24px";
        val.style.fontWeight = "bold";
        val.style.color = "#fff";

        card.append(title, val);
        return card;
    }

    try {
        const [products, suppliers, orders] = await Promise.all([
            apiRequest("/products"),
            apiRequest("/suppliers"),
            apiRequest("/orders")
        ]);

        overviewBox.append(
            overviewCard("Total Products", products.length),
            overviewCard("Total Suppliers", suppliers.length),
            overviewCard("Total Orders", orders.length)
        );
    } catch (err) {
        console.error(err);
        main.appendChild(h("p", {}, "Error loading dashboard overview."));
    }

    main.appendChild(overviewBox);

}

// ===================================================================
// ADD / EDIT PRODUCT
// ===================================================================
function AddOrEditProduct(product = {}) {
    main.innerHTML = "";
    main.appendChild(h("h2", {}, product._id ? "Edit Product" : "Add Product"));

    const name = h("input", { placeholder: "Product Name", value: product.name || "" });
    const sku = h("input", { placeholder: "SKU", value: product.sku || "" });
    const stock = h("input", { type: "number", placeholder: "Stock", value: product.stock != null ? product.stock : "" });
    const price = h("input", { type: "number", placeholder: "Price", value: product.price != null ? product.price : "" });

    const btn = h("button", { onclick: async () => {
        const data = { 
            name: name.value,
            sku: sku.value,
            stock: Number(stock.value) || 0,
            price: Number(price.value) || 0
        };
        try {
            if (product._id) await apiRequest(`/products/${product._id}`, "PUT", data);
            else await apiRequest("/products", "POST", data);
        } catch(e){ console.error(e); }
        ProductList();
    }}, product._id ? "Update" : "Submit");

    main.append(name, h("br"), sku, h("br"), stock, h("br"), price, h("br"), h("br"), btn);
}

// ===================================================================
// PRODUCT LIST
// ===================================================================
async function ProductList() {
    main.innerHTML = "";
    main.appendChild(h("h2", {}, "Products"));
    try {
        const productsData = await apiRequest("/products");
        const products = Array.isArray(productsData) ? productsData : [];
        const table = h("table", {},
            h("tr", {}, 
                h("th", {}, "SKU"), 
                h("th", {}, "Name"), 
                h("th", {}, "Price"), 
                h("th", {}, "Stock"), 
                h("th", {}, "Actions")
            )
        );

        products.forEach(p => {
            if (p && typeof p === "object") {
                const tr = h("tr", {},
                    h("td", {}, p.sku || ""),
                    h("td", {}, p.name || ""),
                    h("td", {}, "₱" + (p.price != null ? p.price : 0)),
                    h("td", {}, String(p.stock != null ? p.stock : 0)),
                    h("td", {}, 
                        h("button", { onclick: () => AddOrEditProduct(p) }, "Edit"),
                        h("button", { onclick: async () => { 
                            if (await confirmAction("Delete this product?")) { 
                                await apiRequest(`/products/${p._id}`, "DELETE"); 
                                ProductList(); 
                            } 
                        }}, "Delete")
                    )
                );
                highlightRow(tr);
                table.appendChild(tr);
            }
        });
        main.appendChild(table);
    } catch (err) {
        console.error(err);
        main.appendChild(h("p", {}, "Error loading products: " + err.message));
    }
}

// ===================================================================
// ADD / EDIT SUPPLIER
// ===================================================================
function AddOrEditSupplier(supplier = {}) {
    main.innerHTML = "";
    main.appendChild(h("h2", {}, supplier._id ? "Edit Supplier" : "Add Supplier"));

    const name = h("input", { placeholder: "Supplier Name", value: supplier.name || "" });
    const contact = h("input", { placeholder: "Contact", value: supplier.contact || "" });

    const btn = h("button", { onclick: async () => {
        const data = {
            name: name.value,
            contact: contact.value,
        };
        try {
            if (supplier._id) await apiRequest(`/suppliers/${supplier._id}`, "PUT", data);
            else await apiRequest("/suppliers", "POST", data);
        } catch(e){ console.error(e); }
        SupplierList();
    }}, supplier._id ? "Update" : "Submit");

    main.append(name, h("br"), contact, h("br"), btn);
}

// ===================================================================
// SUPPLIER LIST
// ===================================================================
async function SupplierList() {
    main.innerHTML = "";
    main.appendChild(h("h2", {}, "Suppliers"));
    try {
        const suppliersData = await apiRequest("/suppliers");
        const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
        const table = h("table", {},
            h("tr", {},
                h("th", {}, "Name"),
                h("th", {}, "Contact"),
                h("th", {}, "Actions")
            )
        );

        suppliers.forEach(s => {
            if (s && typeof s === "object") {
                const tr = h("tr", {},
                    h("td", {}, s.name || ""),
                    h("td", {}, s.contact || ""),
                    h("td", {},
                        h("button", { onclick: async () => {
                            if (await confirmAction("Delete this supplier?")) {
                                await apiRequest(`/suppliers/${s._id}`, "DELETE");
                                SupplierList();
                            }
                        }}, "Delete")
                    )
                );
                highlightRow(tr);
                table.appendChild(tr);
            }
        });

        main.appendChild(table);
    } catch (err) {
        console.error(err);
        main.appendChild(h("p", {}, "Error loading suppliers: " + err.message));
    }
}

// ORDER LIST ////
async function OrderList() {
    main.innerHTML = "";
    main.appendChild(h("h2", {}, "Orders"));

    try {
        const ordersData = await apiRequest("/orders");
        const orders = Array.isArray(ordersData) ? ordersData : [];

        // TABLE HEADER
        const table = h("table", {},
            h("tr", {},
                h("th", {}, "Order ID"),
                h("th", {}, "Supplier ID"),
                h("th", {}, "Items"),
                h("th", {}, "Total Price"),
                h("th", {}, "Status"),
                h("th", {}, "Action")
            )
        );

        orders.forEach(o => {
            if (o && typeof o === "object") {

                // FORMAT ITEMS PROPERLY
                const itemsStr = Array.isArray(o.items)
                    ? o.items
                        .map(i => `${i.productId?.name || i.productId || "Unknown"} x${i.qty} ₱${i.price}`)
                        .join(", ")
                    : "";

                // COMPUTE TOTAL PRICE
                const totalPrice = Array.isArray(o.items)
                    ? o.items.reduce((sum, i) => sum + (i.qty * i.price), 0)
                    : 0;

                // SUPPLIER ID
                const supplierId = typeof o.supplierId === "string"
                    ? o.supplierId
                    : o.supplierId?._id || "";

                // ROW
                const tr = h("tr", {},
                    h("td", {}, o._id || ""),
                    h("td", {}, supplierId),
                    h("td", {}, itemsStr),
                    h("td", {}, `₱${totalPrice.toFixed(2)}`),
                    h("td", {}, o.status || ""),
                    h("td", {},
                        h("button", {
                            onclick: async () => {
                                if (await confirmAction("Delete this order?")) {
                                    await apiRequest(`/orders/${o._id}`, "DELETE");
                                    OrderList();
                                }
                            }
                        }, "Delete")
                    )
                );

                highlightRow(tr);
                table.appendChild(tr);
            }
        });

        main.appendChild(table);

    } catch (err) {
        console.error(err);
        main.appendChild(h("p", {}, "Error loading orders: " + err.message));
    }
}


// ===================================================================
// SIDEBAR BUTTONS
// ===================================================================
sidebar.appendChild(createSidebarButton("Dashboard", loadDashboard));
sidebar.appendChild(createSidebarButton("Products", ProductList));
sidebar.appendChild(createSidebarButton("Add Product", () => AddOrEditProduct()));
sidebar.appendChild(createSidebarButton("Suppliers", SupplierList));
sidebar.appendChild(createSidebarButton("Add Supplier", () => AddOrEditSupplier()));
sidebar.appendChild(createSidebarButton("Orders", OrderList));

// ===================================================================
// LOAD DEFAULT DASHBOARD
// ===================================================================
loadDashboard();
