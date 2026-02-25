// ============================================
// GLOBAL VARIABLE (Used for Edit Mode)
// ============================================
let editingProductId = null;


// ============================================
// GET PRODUCTS FROM LOCALSTORAGE
// ============================================
function getProducts() {
  return JSON.parse(localStorage.getItem("Products")) || [];
}


// ============================================
// RENDERING PRODUCTS IN TABLE
// ============================================
function renderProducts() {
  const tableBody = document.querySelector("#table-data tbody");
  tableBody.innerHTML = "";

  const storedProducts = JSON.parse(localStorage.getItem("Products")) || [];

  storedProducts.forEach(function (product) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>${product.price}</td>
      <td><img src="${product.imageUrl}" width="50"></td>
      <td>
        <button class="btn btn-light edit-btn" data-id="${product.id}">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-light delete-btn" data-id="${product.id}">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

renderProducts();


// ============================================
// EDITING PRODUCT (OPEN MODAL WITH DATA)
// ============================================
document
  .querySelector("#table-data tbody")
  .addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-btn");
    if (!editBtn) return;

    const id = parseInt(editBtn.dataset.id);
    editingProductId = id;

    const storedProducts = JSON.parse(localStorage.getItem("Products")) || [];

    const product = storedProducts.find(function (p) {
      return p.id === id;
    });

    if (!product) return;

    document.querySelector("#product-name").value = product.name;
    document.querySelector("#product-image-url").value = product.imageUrl;
    document.querySelector("#product-price").value = product.price;
    document.querySelector("#product-description").value = product.description;

    document.querySelector("#addProductLabel").innerText = "Edit Product";

    const modal = new bootstrap.Modal(document.getElementById("form-modal"));
    modal.show();
  });


// ============================================
// ADDING + UPDATING PRODUCT
// ============================================
document.querySelector("#saveProduct").addEventListener("click", function () {

  const name = document.querySelector("#product-name").value;
  const imageUrl = document.querySelector("#product-image-url").value;
  const price = document.querySelector("#product-price").value;
  const description = document.querySelector("#product-description").value;

  if (!name || !price || !description || !imageUrl) {
    alert("Please fill all fields");
    return;
  }

  const storedProducts = JSON.parse(localStorage.getItem("Products")) || [];

  if (editingProductId !== null) {

    // ---------- CONFIRM BEFORE UPDATE ----------
    const confirmUpdate = confirm("Are you sure you want to update this product?");
    if (!confirmUpdate) return;

    // ===== UPDATE MODE =====
    const product = storedProducts.find(function (p) {
      return p.id === editingProductId;
    });

    if (product) {
      product.name = name;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
    }

  } else {

    // ===== ADD MODE =====
    let newId;

    if (storedProducts.length > 0) {
      const lastProduct = storedProducts[storedProducts.length - 1];
      newId = lastProduct.id + 1;
    } else {
      newId = 1;
    }

    const newProduct = {
      id: newId,
      name: name,
      imageUrl: imageUrl,
      price: price,
      description: description,
    };

    storedProducts.push(newProduct);
  }

  localStorage.setItem("Products", JSON.stringify(storedProducts));
  renderProducts();

  editingProductId = null;
  document.querySelector("form").reset();
  document.querySelector("#exampleModalLabel").innerText = "Add Product";

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("form-modal")
  );
  modal.hide();
});


// ============================================
// RESET MODAL WHEN CLOSED
// ============================================
const modalElement = document.getElementById("form-modal");

modalElement.addEventListener("hidden.bs.modal", function () {
  editingProductId = null;
  document.querySelector("form").reset();
  document.querySelector("#addProductLabel").innerText = "Add Product";
});


// ============================================
// DELETE PRODUCT
// ============================================
document
  .querySelector("#table-data tbody")
  .addEventListener("click", function (e) {

    const deleteBtn = e.target.closest(".delete-btn");
    if (!deleteBtn) return;

    const id = parseInt(deleteBtn.dataset.id);

    // ---------- CONFIRM BEFORE DELETE ----------
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    let storedProducts = JSON.parse(localStorage.getItem("Products")) || [];

    for (let i = 0; i < storedProducts.length; i++) {
      if (storedProducts[i].id === id) {
        storedProducts.splice(i, 1);
        break;
      }
    }

    localStorage.setItem("Products", JSON.stringify(storedProducts));
    renderProducts();
  });


// ============================================
// SEARCHING PRODUCTS
// ============================================
document.querySelector("#searchProduct")
  .addEventListener("input", function () {

    const searchText = this.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#table-data tbody tr");

    let count = 0;

    rows.forEach(function (row) {
      const rowText = row.innerText.toLowerCase();

      if (rowText.includes(searchText)) {
        row.style.display = "";
        count++;
      } else {
        row.style.display = "none";
      }
    });

    if (count === 0) {
      document.getElementById("nodata").innerHTML =
        "<h3 style='color:red;'> No Data Found</h3>";
    } else {
      document.getElementById("nodata").innerHTML = "";
    }
  });


// ============================================
// SORTING PRODUCTS
// ============================================
document.querySelector("#sortSelect")
  .addEventListener("change", function () {

    const sortType = this.value;
    const products = getProducts();

    if (!sortType) {
      renderProducts();
      return;
    }

    let sortedProducts;

    if (sortType === "id-asc") {
      sortedProducts = products.toSorted((a, b) => a.id - b.id);
    }

    if (sortType === "id-desc") {
      sortedProducts = products.toSorted((a, b) => b.id - a.id);
    }

    if (sortType === "name-asc") {
      sortedProducts = products.toSorted((a, b) => a.name.localeCompare(b.name));
    }

    if (sortType === "name-desc") {
      sortedProducts = products.toSorted((a, b) => b.name.localeCompare(a.name));
    }

    if (sortType === "price-asc") {
      sortedProducts = products.toSorted(
        (a, b) =>
          parseFloat(a.price.replace("$", "")) -
          parseFloat(b.price.replace("$", ""))
      );
    }

    if (sortType === "price-desc") {
      sortedProducts = products.toSorted(
        (a, b) =>
          parseFloat(b.price.replace("$", "")) -
          parseFloat(a.price.replace("$", ""))
      );
    }

    const tableBody = document.querySelector("#table-data tbody");
    tableBody.innerHTML = "";

    sortedProducts.forEach(function (product) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>${product.price}</td>
        <td><img src="${product.imageUrl}" width="50"></td>
        <td>
          <button class="btn btn-light edit-btn" data-id="${product.id}">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-light delete-btn" data-id="${product.id}">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });
});