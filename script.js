// ===== LOGIN LOGIC =====
const loginBtn = document.getElementById('loginBtn');
const username = document.getElementById('username');
const password = document.getElementById('password');
const errorMsg = document.getElementById('errorMsg');
const togglePassword = document.getElementById('togglePassword');

loginBtn.addEventListener('click', () => {
  if (username.value === 'Yashivishnoi' && password.value === 'yashi123') {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'flex';
  } else {
    errorMsg.textContent = 'Invalid username or password!';
  }
});

togglePassword.addEventListener('click', () => {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  togglePassword.src = type === 'password' ? 'assets/icons/eye-off.svg' : 'assets/icons/eye.svg';
});

// ===== SIDEBAR NAVIGATION =====
const menuItems = document.querySelectorAll('.sidebar li');
const sections = document.querySelectorAll('.content');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const target = item.getAttribute('data-page');
    sections.forEach(sec => sec.classList.toggle('hidden', sec.id !== target));
  });
});

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  themeToggle.src = theme === 'dark' ? 'assets/icons/light.svg' : 'assets/icons/dark.svg';
});

window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.src = 'assets/icons/light.svg';
  }
});

// ===== PRODUCT CRUD =====
const productForm = document.getElementById('productForm');
const productTableBody = document.querySelector('#productTable tbody');
const searchInput = document.getElementById('searchProduct');

let products = JSON.parse(localStorage.getItem('products')) || [];

// ===== ANALYTICS ELEMENTS =====
const analyticsTotal = document.getElementById('analyticsTotalProducts');
const analyticsInStock = document.getElementById('analyticsInStock');
const analyticsOutStock = document.getElementById('analyticsOutStock');
const ctx = document.getElementById('productChart').getContext('2d');
let productChart;

// ===== FUNCTION TO UPDATE ANALYTICS =====
function updateAnalytics() {
  const total = products.length;
  const inStock = products.filter(p => p.qty > 0).length;
  const outStock = total - inStock;

  analyticsTotal.textContent = total;
  analyticsInStock.textContent = inStock;
  analyticsOutStock.textContent = outStock;

  // Category-wise product count
  const categoryCount = {};
  products.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  const labels = Object.keys(categoryCount);
  const data = Object.values(categoryCount);

  // Destroy previous chart
  if (productChart) productChart.destroy();

  productChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Products by Category',
        data: data,
        backgroundColor: 'rgba(108, 99, 255, 0.7)',
        borderColor: 'rgba(108, 99, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Category-wise Product Count' }
      },
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1
        }
      }
    }
  });
}

// ===== RENDER PRODUCTS FUNCTION =====
function renderProducts(filter = '') {
  productTableBody.innerHTML = '';
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.category.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach((product, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price}</td>
      <td>${product.qty}</td>
      <td><img src="${product.image}" alt="${product.name}" width="50"></td>
      <td>${product.desc}</td>
      <td class="qr-cell"></td> <!-- QR code cell -->
      <td>
        <button class="edit-btn" onclick="editProduct(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;
    productTableBody.appendChild(row);

    // Generate QR code
    const qrCell = row.querySelector('.qr-cell');
    new QRCode(qrCell, {
      text: `${product.name} | ${product.category} | $${product.price} | Qty: ${product.qty}`,
      width: 50,
      height: 50
    });
  });

  // Update Dashboard Summary
  document.getElementById('totalProducts').textContent = products.length;
  const inStock = products.filter(p => p.qty > 0).length;
  document.getElementById('inStock').textContent = inStock;
  document.getElementById('outStock').textContent = products.length - inStock;

  // Update Analytics
  updateAnalytics();
}

// ===== ADD PRODUCT =====
productForm.addEventListener('submit', e => {
  e.preventDefault();
  const newProduct = {
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    price: parseFloat(document.getElementById('productPrice').value),
    qty: parseInt(document.getElementById('productQty').value),
    image: document.getElementById('productImage').value,
    desc: document.getElementById('productDesc').value
  };
  products.push(newProduct);
  localStorage.setItem('products', JSON.stringify(products));
  productForm.reset();
  renderProducts();
  alert('Product added successfully!');
});

// ===== DELETE PRODUCT =====
function deleteProduct(index) {
  if (confirm('Are you sure you want to delete this product?')) {
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
  }
}

// ===== EDIT PRODUCT =====
function editProduct(index) {
  const p = products[index];
  document.getElementById('productName').value = p.name;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productQty').value = p.qty;
  document.getElementById('productImage').value = p.image;
  document.getElementById('productDesc').value = p.desc;

  products.splice(index, 1);
  renderProducts();
}

// ===== SEARCH PRODUCT =====
searchInput.addEventListener('input', () => renderProducts(searchInput.value));

// ===== INITIAL RENDER =====
renderProducts();

// ===== Voice Search =====
const voiceSearchBtn = document.getElementById('voiceSearchBtn');
voiceSearchBtn.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Your browser does not support voice recognition.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const spokenText = event.results[0][0].transcript;
    searchInput.value = spokenText;
    renderProducts(spokenText);
  };
});

// ===== Export CSV =====
const exportCSVBtn = document.getElementById('exportCSVBtn');
exportCSVBtn.addEventListener('click', () => {
  if (products.length === 0) return alert('No products to export.');

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Name,Category,Price,Quantity,Image,Description\n";

  products.forEach(p => {
    csvContent += `${p.name},${p.category},${p.price},${p.qty},${p.image},${p.desc}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'products.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
