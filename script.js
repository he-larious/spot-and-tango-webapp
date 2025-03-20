document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

let cart = [];
let products = [];
  
async function fetchProducts() {
    try {
        const response = await fetch('https://s3.us-east-1.amazonaws.com/assets.spotandtango/products.json');
        products = await response.json();

        populateCategoryFilters(products)
        displayProducts();
    } 
    catch (error) {
        console.error("Error fetching products:", error);
    }
}

function populateCategoryFilters(products) {
    const filterEl = document.getElementById("category-filter");
    filterEl.innerHTML = ""; 

    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.textContent = "All Categories";
    filterEl.appendChild(allOption);

    const categories = new Set();
    products.forEach(product => {
        if (product.group) {
            categories.add(product.group);
        }
    });

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        filterEl.appendChild(option);
    });
}
  
function displayProducts() {
    const productsEl = document.getElementById("products");
    productsEl.innerHTML = "";

    const selectedCategory = document.getElementById("category-filter").value;
    const filteredProducts = products.filter(product => {
        return selectedCategory === "All" || product.group === selectedCategory;
    });
    
    filteredProducts.forEach(product => {
        const col = document.createElement("div");
        col.className = "col-md-6";

        const card = document.createElement("div");
        card.className = "product-card";
      
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p><b>Group:</b> ${product.group}</p>
            <p><b>MSRP:</b> $${product.msrp}</p>
            <p><b>Price:</b> $${product.price}</p>

            ${product.status === "Available"
                ? `<div class="input-group">
                        <input type="number" id="quantity-${product.id}" value="1" min="1" class="form-control">
                        <button onclick="handleAddToCart('${product.id}', '${product.name}', ${product.price}, document.getElementById('quantity-${product.id}').value)">Add to Cart</button>
                    </div>`
                : `<button disabled>Sold Out</button>`
            }
        `;

        col.appendChild(card);
        productsEl.appendChild(col);
    });
}
  
function handleAddToCart(productId, productName, productPrice, productQuantity) {
    productQuantity = parseInt(productQuantity);

    if (isNaN(productQuantity) || productQuantity < 1) {
        alert("Please enter a valid quantity (1 or more).");
        return; 
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += productQuantity;
    } 
    else {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: productQuantity });
    }

    updateCartDisplay();
}
  
function updateCartDisplay() {
    const cartItemsEl = document.getElementById("cart-items");
    const totalPriceEl = document.getElementById("total-price");
    cartItemsEl.innerHTML = ""; 
  
    let total = 0;

    cart.forEach(item => {
        const li = document.createElement("li");

        li.innerHTML = `<b>${item.name}</b> - Qty: ${item.quantity}`;
        cartItemsEl.appendChild(li);

        total += item.price * item.quantity;
    });
  
    totalPriceEl.textContent = total.toFixed(2);
}  