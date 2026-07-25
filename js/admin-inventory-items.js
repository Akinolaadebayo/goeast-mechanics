/* =========================================================
   ADMIN INVENTORY ITEMS MODULE
   File: js/admin-inventory-items.js
========================================================= */

let inventoryItems = [];
let editingInventoryItemId = null;

let inventoryCurrentPage = 1;
let inventoryPageSize = 25;
let inventoryTotalCount = 0;
let inventorySearchTimer = null;

const inventoryList = document.getElementById("inventoryList");
const inventorySearch = document.getElementById("inventorySearch");
const inventoryStatusFilter = document.getElementById("inventoryStatusFilter");
const inventoryCategoryFilter = document.getElementById("inventoryCategoryFilter");
const inventoryBrandFilter = document.getElementById("inventoryBrandFilter");
const inventoryForm = document.getElementById("inventoryForm");
const showInventoryFormBtn = document.getElementById("showInventoryFormBtn");

async function loadInventoryItems() {
  if (!inventoryList) return;

  inventoryList.innerHTML = `<p class="empty-message">Loading inventory...</p>`;

  const from = (inventoryCurrentPage - 1) * inventoryPageSize;
  const to = from + inventoryPageSize - 1;

  let query = supabaseClient
    .from("inventory_items")
    .select("*", { count: "exact" });

  query = applyInventoryDatabaseFilters(query);

  const { data, error, count } = await query
    .order("item_name", { ascending: true })
    .range(from, to);

  if (error) {
    inventoryList.innerHTML = `<p class="empty-message">Could not load inventory: ${escapeHtml(error.message)}</p>`;
    return;
  }

  inventoryItems = data || [];
  inventoryTotalCount = count || 0;

  await buildInventoryFilterOptions();
  renderInventoryItems();
}

function applyInventoryDatabaseFilters(query) {
  const searchText = inventorySearch ? inventorySearch.value.trim() : "";
  const selectedStatus = inventoryStatusFilter ? inventoryStatusFilter.value : "active";
  const selectedCategory = inventoryCategoryFilter ? inventoryCategoryFilter.value : "all";
  const selectedBrand = inventoryBrandFilter ? inventoryBrandFilter.value : "all";

  if (selectedStatus === "active") query = query.eq("is_active", true);
  if (selectedStatus === "inactive") query = query.eq("is_active", false);
  if (selectedStatus === "low_stock") query = query.eq("is_active", true);
  if (selectedCategory !== "all") query = query.eq("category", selectedCategory);
  if (selectedBrand !== "all") query = query.eq("brand", selectedBrand);

  if (searchText) {
    const cleanedSearch = searchText.replace(/[,()]/g, " ");

    query = query.or(`
      item_name.ilike.%${cleanedSearch}%,
      sku.ilike.%${cleanedSearch}%,
      part_number.ilike.%${cleanedSearch}%,
      category.ilike.%${cleanedSearch}%,
      brand.ilike.%${cleanedSearch}%,
      supplier.ilike.%${cleanedSearch}%,
      notes.ilike.%${cleanedSearch}%
    `.replace(/\s/g, ""));
  }

  return query;
}

async function buildInventoryFilterOptions() {
  if (!inventoryCategoryFilter || !inventoryBrandFilter) return;

  const selectedCategory = inventoryCategoryFilter.value || "all";
  const selectedBrand = inventoryBrandFilter.value || "all";

  const { data, error } = await supabaseClient
    .from("inventory_items")
    .select("category, brand")
    .eq("is_active", true);

  if (error) return;

  const categories = [...new Set((data || []).map((item) => item.category).filter(Boolean))].sort();
  const brands = [...new Set((data || []).map((item) => item.brand).filter(Boolean))].sort();

  inventoryCategoryFilter.innerHTML = `
    <option value="all">All Categories</option>
    ${categories.map((category) => `
      <option value="${escapeHtml(category)}">${safeText(category)}</option>
    `).join("")}
  `;

  inventoryBrandFilter.innerHTML = `
    <option value="all">All Brands</option>
    ${brands.map((brand) => `
      <option value="${escapeHtml(brand)}">${safeText(brand)}</option>
    `).join("")}
  `;

  inventoryCategoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : "all";
  inventoryBrandFilter.value = brands.includes(selectedBrand) ? selectedBrand : "all";
}

function renderInventoryItems() {
  if (!inventoryList) return;

  /* =========================================================
     1. EMPTY RESULTS
     ========================================================= */

  if (inventoryItems.length === 0) {
    inventoryList.innerHTML = `
      <div id="inventoryBulkBar">
        ${
          typeof renderInventoryBulkBar === "function"
            ? renderInventoryBulkBar()
            : ""
        }
      </div>

      ${renderInventoryPagination()}

      <div class="inventory-table-wrap admin-table-wrap">
        <table class="admin-data-table inventory-table">
          <thead>
            <tr>
              <th class="inventory-checkbox-cell">
                <input
                  id="inventorySelectAllCheckbox"
                  type="checkbox"
                  aria-label="Select all visible inventory items"
                  disabled
                >
              </th>

              <th class="inventory-number-cell">#</th>
              <th class="inventory-item-cell">Item</th>
              <th class="inventory-part-number-cell">Part #</th>
              <th class="inventory-quantity-cell">Qty</th>
              <th class="inventory-status-cell">Status</th>
              <th class="inventory-category-cell">Category</th>
              <th class="inventory-brand-cell">Brand</th>
              <th class="inventory-reorder-cell">Reorder</th>
              <th class="inventory-max-cell">Max</th>
              <th class="inventory-money-cell">Cost</th>
              <th class="inventory-money-cell">Sell</th>
              <th class="inventory-actions-cell">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colspan="13"
                class="inventory-table-message-cell"
              >
                No inventory items found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    bindInventoryPaginationButtons();

    if (typeof bindInventoryBulkSelectionButtons === "function") {
      bindInventoryBulkSelectionButtons();
    }

    return;
  }

  /* =========================================================
     2. ROW NUMBERING
     ========================================================= */

  const pageStartingNumber =
    (inventoryCurrentPage - 1) * inventoryPageSize;

  /* =========================================================
     3. BUILD INVENTORY ROWS
     ========================================================= */

  const rows = inventoryItems.map((item, index) => {
    const quantity = inventoryNumber(item.quantity || 0);

    const reorderLevel = inventoryNumber(
      item.reorder_level ||
      item.low_stock_limit ||
      0
    );

    const maxStock = inventoryNumber(item.max_stock || 0);
    const isActive = item.is_active !== false;

    const stockLabel = inventoryQuantityLabel(
      quantity,
      reorderLevel,
      isActive
    );

    const stockClass = inventoryStatusClass(
      quantity,
      reorderLevel,
      isActive
    );

    const itemId = String(item.id);

    const isSelected =
      typeof selectedInventoryItemIds !== "undefined" &&
      selectedInventoryItemIds.has(itemId);

    const rowNumber = pageStartingNumber + index + 1;

    const itemName = safeText(
      item.item_name,
      "Unnamed Item"
    );

    const itemNameForAttribute = escapeHtml(
      item.item_name || "inventory item"
    );

    const skuText = item.sku
      ? `SKU: ${safeText(item.sku)}`
      : "No SKU";

      const partNumberText = item.part_number
      ? safeText(item.part_number)
      : "-";
    
    const brandText = safeText(
      item.brand,
      "-"
    );

    const costValue = money(
      item.cost_price ||
      item.unit_price ||
      0
    );

    const sellingValue = money(
      item.selling_price ||
      0
    );

    return `
      <tr
        class="
          ${!isActive ? "archived-row" : ""}
          ${isSelected ? "inventory-row-selected" : ""}
        "
        data-inventory-row-id="${itemId}"
      >
        <!-- SELECT -->
        <td class="inventory-checkbox-cell">
          <input
            type="checkbox"
            class="inventory-row-checkbox"
            data-id="${itemId}"
            aria-label="Select ${itemNameForAttribute}"
            ${isSelected ? "checked" : ""}
          >
        </td>

        <!-- ROW NUMBER -->
        <td class="inventory-number-cell">
          <span class="inventory-row-number">
            ${rowNumber}
          </span>
        </td>

       <!-- ITEM IDENTITY -->
<td class="inventory-item-cell">
  <strong>${itemName}</strong>

  <small class="inventory-item-sku">
    ${skuText}
  </small>
</td>

        <!-- PART NUMBER -->
        <td class="inventory-part-number-cell">
          ${partNumberText}
        </td>

        <!-- CURRENT QUANTITY -->
        <td class="inventory-quantity-cell">
          <strong>${quantity}</strong>
        </td>

        <!-- STOCK STATUS -->
        <td class="inventory-status-cell">
          <span class="status-badge ${stockClass}">
            ${safeText(stockLabel)}
          </span>
        </td>

        <!-- CATEGORY -->
        <td class="inventory-category-cell">
          ${safeText(item.category, "-")}
        </td>

        <!-- BRAND -->
        <td class="inventory-brand-cell">
          ${brandText}
        </td>

        <!-- REORDER LEVEL -->
        <td class="inventory-reorder-cell">
          ${reorderLevel}
        </td>

        <!-- MAXIMUM STOCK -->
        <td class="inventory-max-cell">
          ${maxStock}
        </td>

        <!-- COST -->
        <td class="inventory-money-cell">
          ${costValue}
        </td>

        <!-- SELLING PRICE -->
        <td class="inventory-money-cell">
          ${sellingValue}
        </td>

        <!-- ACTION CENTER -->
        <td class="inventory-actions-cell">
          <button
            type="button"
            class="inventory-open-actions-btn inventory-actions-btn"
            data-id="${itemId}"
            aria-label="Open actions for ${itemNameForAttribute}"
            aria-haspopup="dialog"
          >
            Actions
          </button>
        </td>
      </tr>
    `;
  }).join("");

  /* =========================================================
     4. BUILD COMPLETE INVENTORY TABLE
     ========================================================= */

  inventoryList.innerHTML = `
    <div id="inventoryBulkBar">
      ${
        typeof renderInventoryBulkBar === "function"
          ? renderInventoryBulkBar()
          : ""
      }
    </div>

    ${renderInventoryPagination()}

    <div class="inventory-table-wrap admin-table-wrap">
      <table class="admin-data-table inventory-table">
        <thead>
          <tr>
            <th class="inventory-checkbox-cell">
              <input
                id="inventorySelectAllCheckbox"
                type="checkbox"
                aria-label="Select all visible inventory items"
              >
            </th>

            <th class="inventory-number-cell">
              #
            </th>

            <th class="inventory-item-cell">
              Item
            </th>

            <th class="inventory-part-number-cell">
              Part #
            </th>

            <th class="inventory-quantity-cell">
              Qty
            </th>

            <th class="inventory-status-cell">
              Status
            </th>

            <th class="inventory-category-cell">
              Category
            </th>

            <th class="inventory-brand-cell">
              Brand
            </th>

            <th class="inventory-reorder-cell">
              Reorder
            </th>

            <th class="inventory-max-cell">
              Max
            </th>

            <th class="inventory-money-cell">
              Cost
            </th>

            <th class="inventory-money-cell">
              Sell
            </th>

            <th class="inventory-actions-cell">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    ${renderInventoryPagination()}
  `;

  /* =========================================================
     5. REBIND DYNAMIC CONTROLS
     ========================================================= */

  bindInventoryActionButtons();
  bindInventoryPaginationButtons();

  if (typeof bindInventoryBulkSelectionButtons === "function") {
    bindInventoryBulkSelectionButtons();
  }

  bindInventoryRowVisualSelection();
}

function renderInventoryPagination() {
  const totalPages = Math.max(1, Math.ceil(inventoryTotalCount / inventoryPageSize));

  return `
    <div class="inventory-pagination">
      <div>
        <strong>${inventoryTotalCount}</strong> item(s)
        · Page <strong>${inventoryCurrentPage}</strong> of <strong>${totalPages}</strong>
      </div>

      <div class="inventory-pagination-controls">
        <select class="inventory-page-size-select">
          <option value="10" ${inventoryPageSize === 10 ? "selected" : ""}>10 per page</option>
          <option value="25" ${inventoryPageSize === 25 ? "selected" : ""}>25 per page</option>
          <option value="50" ${inventoryPageSize === 50 ? "selected" : ""}>50 per page</option>
          <option value="100" ${inventoryPageSize === 100 ? "selected" : ""}>100 per page</option>
        </select>

        <button class="inventory-prev-page-btn" ${inventoryCurrentPage <= 1 ? "disabled" : ""}>
          Previous
        </button>

        <button class="inventory-next-page-btn" ${inventoryCurrentPage >= totalPages ? "disabled" : ""}>
          Next
        </button>
      </div>
    </div>
  `;
}

function bindInventoryPaginationButtons() {
  document.querySelectorAll(".inventory-page-size-select").forEach((select) => {
    select.addEventListener("change", async function () {
      inventoryPageSize = Number(select.value);
      inventoryCurrentPage = 1;
      await loadInventoryItems();
    });
  });

  document.querySelectorAll(".inventory-prev-page-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      if (inventoryCurrentPage > 1) {
        inventoryCurrentPage--;
        await loadInventoryItems();
      }
    });
  });

  document.querySelectorAll(".inventory-next-page-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const totalPages = Math.max(1, Math.ceil(inventoryTotalCount / inventoryPageSize));

      if (inventoryCurrentPage < totalPages) {
        inventoryCurrentPage++;
        await loadInventoryItems();
      }
    });
  });
}

/* =========================================================
   INVENTORY ACTION CENTER

   Replaces the old clipped dropdown menu.

   Clicking Actions now opens an item-specific action center
   that clearly identifies the selected inventory record.
========================================================= */

function findInventoryItemById(itemId) {
  return inventoryItems.find((record) => {
    return String(record.id) === String(itemId);
  });
}

function bindInventoryRowVisualSelection() {
  document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const itemId = checkbox.getAttribute("data-id");

      const row = document.querySelector(
        `[data-inventory-row-id="${itemId}"]`
      );

      if (row) {
        row.classList.toggle(
          "inventory-row-selected",
          checkbox.checked
        );
      }
    });
  });

  const selectAllCheckbox = document.getElementById(
    "inventorySelectAllCheckbox"
  );

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      document.querySelectorAll(".inventory-row-checkbox").forEach((checkbox) => {
        const itemId = checkbox.getAttribute("data-id");

        const row = document.querySelector(
          `[data-inventory-row-id="${itemId}"]`
        );

        if (row) {
          row.classList.toggle(
            "inventory-row-selected",
            selectAllCheckbox.checked
          );
        }
      });
    });
  }
}

function bindInventoryActionButtons() {
  document.querySelectorAll(".inventory-open-actions-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const itemId = button.getAttribute("data-id");
      openInventoryActionCenter(itemId);
    });
  });
}

function openInventoryActionCenter(itemId) {
  const item = findInventoryItemById(itemId);

  if (!item) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Item Not Found",
        "The selected inventory item could not be found."
      );
    } else {
      alert("Inventory item could not be found.");
    }

    return;
  }

  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  const quantity = inventoryNumber(item.quantity || 0);

  const reorderLevel = inventoryNumber(
    item.reorder_level ||
    item.low_stock_limit ||
    0
  );

  const isActive = item.is_active !== false;

  const stockLabel = inventoryQuantityLabel(
    quantity,
    reorderLevel,
    isActive
  );

  const stockClass = inventoryStatusClass(
    quantity,
    reorderLevel,
    isActive
  );

  const deleteAction =
    typeof canDeleteInventoryItem === "function" &&
    canDeleteInventoryItem()
      ? `
        <button
          type="button"
          class="inventory-action-center-btn danger"
          onclick="runInventoryAction('delete', '${String(item.id)}')"
        >
          <span class="inventory-action-center-icon">×</span>

          <span>
            <strong>Delete Permanently</strong>
            <small>
              Permanently remove a duplicate, test, or invalid record.
            </small>
          </span>
        </button>
      `
      : "";

  openAdminModal({
    title: "Inventory Item Actions",

    subtitle:
      `${safeText(item.item_name, "Inventory Item")} • ` +
      `${safeText(item.part_number || item.sku, "No part number")}`,

    content: `
      <div class="inventory-action-center">
        <section class="inventory-action-item-summary">
          <div class="inventory-action-item-heading">
            <div>
              <p class="inventory-action-kicker">
                Selected Inventory Item
              </p>

              <h3>
                ${safeText(item.item_name, "Unnamed Item")}
              </h3>

              <p>
                ${safeText(item.category, "Uncategorized")}
                ${item.brand ? ` • ${safeText(item.brand)}` : ""}
              </p>
            </div>

            <span class="status-badge ${stockClass}">
              ${safeText(stockLabel)}
            </span>
          </div>

          <div class="inventory-action-summary-grid">
            <div>
              <span>Current Quantity</span>
              <strong>${quantity}</strong>
            </div>

            <div>
              <span>Reorder Level</span>
              <strong>${reorderLevel}</strong>
            </div>

            <div>
              <span>Maximum Stock</span>
              <strong>${inventoryNumber(item.max_stock || 0)}</strong>
            </div>

            <div>
              <span>Part Number</span>
              <strong>${safeText(item.part_number, "-")}</strong>
            </div>

            <div>
              <span>SKU</span>
              <strong>${safeText(item.sku, "-")}</strong>
            </div>

            <div>
              <span>Record Status</span>
              <strong>${isActive ? "Active" : "Inactive"}</strong>
            </div>
          </div>
        </section>

        <section class="inventory-action-group">
          <div class="inventory-action-group-heading">
            <h4>Inventory Operations</h4>
            <p>
              Update this item or record a controlled stock movement.
            </p>
          </div>

          <div class="inventory-action-center-grid">
            <button
              type="button"
              class="inventory-action-center-btn"
              onclick="runInventoryAction('edit', '${String(item.id)}')"
            >
              <span class="inventory-action-center-icon">✎</span>

              <span>
                <strong>Edit Item</strong>
                <small>
                  Update identification, pricing, supplier, and stock settings.
                </small>
              </span>
            </button>

            <button
              type="button"
              class="inventory-action-center-btn"
              onclick="runInventoryAction('receive', '${String(item.id)}')"
            >
              <span class="inventory-action-center-icon">+</span>

              <span>
                <strong>Receive Stock</strong>
                <small>
                  Add newly delivered stock and create a receiving transaction.
                </small>
              </span>
            </button>

            <button
              type="button"
              class="inventory-action-center-btn"
              onclick="runInventoryAction('adjust', '${String(item.id)}')"
            >
              <span class="inventory-action-center-icon">±</span>

              <span>
                <strong>Adjust Stock</strong>
                <small>
                  Correct the recorded quantity after a physical count.
                </small>
              </span>
            </button>

            <button
              type="button"
              class="inventory-action-center-btn"
              onclick="runInventoryAction('history', '${String(item.id)}')"
            >
              <span class="inventory-action-center-icon">↺</span>

              <span>
                <strong>View History</strong>
                <small>
                  Review receiving, adjustment, issue, and return records.
                </small>
              </span>
            </button>
          </div>
        </section>

        <section class="inventory-action-group inventory-record-management">
          <div class="inventory-action-group-heading">
            <h4>Record Management</h4>
            <p>
              Deactivate records normally. Permanent deletion is restricted.
            </p>
          </div>

          <div class="inventory-action-center-grid">
            <button
              type="button"
              class="inventory-action-center-btn warning"
              onclick="runInventoryAction('toggle', '${String(item.id)}')"
            >
              <span class="inventory-action-center-icon">
                ${isActive ? "—" : "↥"}
              </span>

              <span>
                <strong>
                  ${isActive ? "Deactivate Item" : "Restore Item"}
                </strong>

                <small>
                  ${
                    isActive
                      ? "Hide this item from active inventory without deleting its history."
                      : "Return this record to active inventory."
                  }
                </small>
              </span>
            </button>

            ${deleteAction}
          </div>
        </section>
      </div>
    `,

    footer: `
      <button
        type="button"
        class="secondary-action-btn"
        onclick="closeAdminModal()"
      >
        Close
      </button>
    `
  });
}

async function runInventoryAction(action, itemId) {
  const item = findInventoryItemById(itemId);

  if (!item) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Item Not Found",
        "The selected inventory item could not be found."
      );
    }

    return;
  }

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }

  if (action === "edit") {
    openInventoryEditModal(item);
    return;
  }

  if (action === "receive") {
    if (typeof openReceiveStockModal === "function") {
      openReceiveStockModal(item);
    }
    return;
  }

  if (action === "adjust") {
    if (typeof openInventoryAdjustmentModal === "function") {
      openInventoryAdjustmentModal(item);
    }
    return;
  }

  if (action === "history") {
    if (typeof openInventoryHistoryModal === "function") {
      openInventoryHistoryModal(item);
    }
    return;
  }

  if (action === "toggle") {
    await toggleInventoryItemStatus(itemId);
    return;
  }

  if (action === "delete") {
    await deleteInventoryItem(itemId);
  }
}

function openInventoryEditModal(item) {
  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  openAdminModal({
    title: "Edit Inventory Item",
    subtitle: safeText(item.item_name, "Inventory Item"),
    content: `
      <form id="inventoryEditModalForm" class="admin-modal-form">
        <label>
          Item Name
          <input id="editInventoryItemName" value="${escapeHtml(item.item_name || "")}" required>
        </label>

        <label>
          SKU
          <input id="editInventorySku" value="${escapeHtml(item.sku || "")}">
        </label>

        <label>
          Part Number
          <input id="editInventoryPartNumber" value="${escapeHtml(item.part_number || "")}">
        </label>

        <label>
          Category
          <input id="editInventoryCategory" value="${escapeHtml(item.category || "")}">
        </label>

        <label>
          Brand
          <input id="editInventoryBrand" value="${escapeHtml(item.brand || "")}">
        </label>

        <label>
          Supplier
          <input id="editInventorySupplier" value="${escapeHtml(item.supplier || "")}">
        </label>

        <label>
          Quantity
          <input id="editInventoryQuantity" type="number" min="0" value="${Number(item.quantity || 0)}">
        </label>

        <label>
          Reorder Level
          <input id="editInventoryReorderLevel" type="number" min="0" value="${Number(item.reorder_level || item.low_stock_limit || 0)}">
        </label>

        <label>
          Max Stock
          <input id="editInventoryMaxStock" type="number" min="0" value="${Number(item.max_stock || 0)}">
        </label>

        <label>
          Cost Price
          <input id="editInventoryCostPrice" type="number" step="0.01" min="0" value="${Number(item.cost_price || item.unit_price || 0)}">
        </label>

        <label>
          Selling Price
          <input id="editInventorySellingPrice" type="number" step="0.01" min="0" value="${Number(item.selling_price || 0)}">
        </label>

        <label class="full-span">
          Notes
          <textarea id="editInventoryNotes">${escapeHtml(item.notes || "")}</textarea>
        </label>
      </form>
    `,
    footer: `
      <button type="button" class="secondary-action-btn" onclick="closeAdminModal()">Cancel</button>
      <button type="button" class="primary-action-btn" onclick="saveInventoryEditFromModal(${Number(item.id)})">Save Changes</button>
    `
  });
}

async function saveInventoryEditFromModal(itemId) {
  const itemNameInput = document.getElementById(
    "editInventoryItemName"
  );

  const skuInput = document.getElementById(
    "editInventorySku"
  );

  const partNumberInput = document.getElementById(
    "editInventoryPartNumber"
  );

  const categoryInput = document.getElementById(
    "editInventoryCategory"
  );

  const brandInput = document.getElementById(
    "editInventoryBrand"
  );

  const supplierInput = document.getElementById(
    "editInventorySupplier"
  );

  const quantityInput = document.getElementById(
    "editInventoryQuantity"
  );

  const reorderLevelInput = document.getElementById(
    "editInventoryReorderLevel"
  );

  const maxStockInput = document.getElementById(
    "editInventoryMaxStock"
  );

  const costPriceInput = document.getElementById(
    "editInventoryCostPrice"
  );

  const sellingPriceInput = document.getElementById(
    "editInventorySellingPrice"
  );

  const notesInput = document.getElementById(
    "editInventoryNotes"
  );

  if (
    !itemNameInput ||
    !skuInput ||
    !partNumberInput ||
    !categoryInput ||
    !brandInput ||
    !supplierInput ||
    !quantityInput ||
    !reorderLevelInput ||
    !maxStockInput ||
    !costPriceInput ||
    !sellingPriceInput ||
    !notesInput
  ) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Edit Form Error",
        "One or more inventory edit fields could not be found."
      );
    }

    return;
  }

  const payload = {
    item_name: itemNameInput.value.trim(),
    sku: skuInput.value.trim(),
    part_number: partNumberInput.value.trim(),
    category: categoryInput.value.trim(),
    brand: brandInput.value.trim(),
    supplier: supplierInput.value.trim(),

    quantity: Number(quantityInput.value || 0),

    reorder_level: Number(
      reorderLevelInput.value || 0
    ),

    low_stock_limit: Number(
      reorderLevelInput.value || 0
    ),

    max_stock: Number(
      maxStockInput.value || 0
    ),

    cost_price: Number(
      costPriceInput.value || 0
    ),

    selling_price: Number(
      sellingPriceInput.value || 0
    ),

    unit_price: Number(
      sellingPriceInput.value || 0
    ),

    notes: notesInput.value.trim(),

    updated_by:
      typeof currentUser !== "undefined" &&
      currentUser
        ? currentUser.id
        : null
  };

  if (!payload.item_name) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "Item Name Required",
        "Enter an item name before saving."
      );
    }

    itemNameInput.focus();
    return;
  }

  if (payload.quantity < 0) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "Invalid Quantity",
        "Inventory quantity cannot be negative."
      );
    }

    quantityInput.focus();
    return;
  }

  const submitButton = document.querySelector(
    "#adminModalBox .primary-action-btn"
  );

  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Save Changes";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
  }

  try {
    const { error } = await supabaseClient
      .from("inventory_items")
      .update(payload)
      .eq("id", itemId);

    if (error) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Update Failed",
          error.message ||
            "The inventory item could not be updated."
        );
      }

      return;
    }

    if (typeof closeAdminModal === "function") {
      closeAdminModal();
    }

    if (typeof showToast === "function") {
      showToast(
        "success",
        "Item Updated",
        `${payload.item_name} was updated successfully.`
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Inventory item update error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Update Failed",
        error?.message ||
          "An unexpected error occurred while updating the item."
      );
    }
  } finally {
    if (
      submitButton &&
      document.body.contains(submitButton)
    ) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

async function toggleInventoryItemStatus(itemId) {
  const item = inventoryItems.find((record) => {
    return String(record.id) === String(itemId);
  });

  if (!item) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Item Not Found",
        "The selected inventory item could not be found."
      );
    }

    return;
  }

  const nextValue = item.is_active === false;

  const confirmMessage = nextValue
    ? `Restore "${item.item_name || "this inventory item"}"?`
    : `Deactivate "${item.item_name || "this inventory item"}"?`;

  if (!window.confirm(confirmMessage)) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("inventory_items")
      .update({
        is_active: nextValue,
        status: nextValue ? "active" : "inactive",

        updated_by:
          typeof currentUser !== "undefined" &&
          currentUser
            ? currentUser.id
            : null
      })
      .eq("id", itemId);

    if (error) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          nextValue
            ? "Restore Failed"
            : "Deactivation Failed",

          error.message ||
            "The inventory item status could not be updated."
        );
      }

      return;
    }

    if (typeof showToast === "function") {
      showToast(
        "success",

        nextValue
          ? "Item Restored"
          : "Item Deactivated",

        `${item.item_name || "The inventory item"} was ${
          nextValue ? "restored" : "deactivated"
        } successfully.`
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Inventory status update error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Status Update Failed",
        error?.message ||
          "An unexpected error occurred while updating the item status."
      );
    }
  }
}

async function deleteInventoryItem(itemId) {
  if (
    typeof canDeleteInventoryItem === "function" &&
    !canDeleteInventoryItem()
  ) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Permission Denied",
        "Only Developer access can permanently delete inventory items."
      );
    }

    return;
  }

  const item = inventoryItems.find((record) => {
    return String(record.id) === String(itemId);
  });

  const itemName =
    item?.item_name || "this inventory item";

  const firstConfirmation = window.confirm(
    `Permanent deletion should only be used for duplicate, spam, or test records.\n\nDelete "${itemName}"?`
  );

  if (!firstConfirmation) {
    return;
  }

  const finalConfirmation = window.confirm(
    `Final warning: "${itemName}" will be permanently deleted and cannot be restored.\n\nContinue?`
  );

  if (!finalConfirmation) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from("inventory_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Delete Failed",
          error.message ||
            "The inventory item could not be deleted."
        );
      }

      return;
    }

    if (typeof showToast === "function") {
      showToast(
        "success",
        "Item Deleted",
        `${itemName} was permanently deleted.`
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Inventory deletion error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Delete Failed",
        error?.message ||
          "An unexpected error occurred while deleting the item."
      );
    }
  }
}

/* =========================================================
   ADD INVENTORY ITEM

   The Add Inventory Item form already exists in admin.html.

   This section:
   - Opens and closes the hidden form.
   - Validates the form.
   - Creates the inventory record.
   - Records opening stock through the inventory ledger.
   - Refreshes the inventory table.
   ========================================================= */


/* =========================================================
   1. OPEN OR CLOSE ADD ITEM FORM
   ========================================================= */

   function setInventoryCreateFormOpen(isOpen) {
    if (!inventoryForm) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Inventory Form Missing",
          "The Add Inventory Item form could not be found."
        );
      }
  
      return;
    }
  
    inventoryForm.classList.toggle(
      "hidden",
      !isOpen
    );
  
    if (showInventoryFormBtn) {
      showInventoryFormBtn.setAttribute(
        "aria-controls",
        "inventoryForm"
      );
  
      showInventoryFormBtn.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );
  
      showInventoryFormBtn.textContent = isOpen
        ? "Close Add Item Form"
        : "Add Inventory Item";
    }
  
    if (isOpen) {
      const itemNameInput = document.getElementById(
        "inventoryItemName"
      );
  
      requestAnimationFrame(() => {
        inventoryForm.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
  
        if (itemNameInput) {
          itemNameInput.focus();
        }
      });
    }
  }
  
  
  function toggleInventoryCreateForm() {
    if (!inventoryForm) {
      return;
    }
  
    const shouldOpen =
      inventoryForm.classList.contains("hidden");
  
    setInventoryCreateFormOpen(shouldOpen);
  }
  
  
  /* =========================================================
     2. READ ADD ITEM FORM
     ========================================================= */
  
  function getInventoryCreateFormFields() {
    return {
      itemNameInput:
        document.getElementById("inventoryItemName"),
  
      skuInput:
        document.getElementById("inventorySku"),
  
      partNumberInput:
        document.getElementById(
          "inventoryPartNumber"
        ),
  
      categoryInput:
        document.getElementById(
          "inventoryCategory"
        ),
  
      brandInput:
        document.getElementById(
          "inventoryBrand"
        ),
  
      supplierInput:
        document.getElementById(
          "inventorySupplier"
        ),
  
      quantityInput:
        document.getElementById(
          "inventoryQuantity"
        ),
  
      reorderLevelInput:
        document.getElementById(
          "inventoryReorderLevel"
        ),
  
      maxStockInput:
        document.getElementById(
          "inventoryMaxStock"
        ),
  
      costPriceInput:
        document.getElementById(
          "inventoryCostPrice"
        ),
  
      sellingPriceInput:
        document.getElementById(
          "inventorySellingPrice"
        ),
  
      notesInput:
        document.getElementById(
          "inventoryNotes"
        )
    };
  }
  
  
  /* =========================================================
     3. CREATE INVENTORY ITEM
     ========================================================= */
  
  async function submitNewInventoryItem(event) {
    event.preventDefault();
  
    if (
      typeof canManageInventory === "function" &&
      !canManageInventory()
    ) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Permission Denied",
          "You do not have permission to create inventory items."
        );
      }
  
      return;
    }
  
    const fields = getInventoryCreateFormFields();
  
    const requiredFields = Object.values(fields);
  
    if (requiredFields.some((field) => !field)) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Inventory Form Error",
          "One or more Add Inventory Item fields could not be found."
        );
      }
  
      return;
    }
  
    const itemName =
      fields.itemNameInput.value.trim();
  
    const sku =
      fields.skuInput.value.trim();
  
    const partNumber =
      fields.partNumberInput.value.trim();
  
    const category =
      fields.categoryInput.value.trim();
  
    const brand =
      fields.brandInput.value.trim();
  
    const supplier =
      fields.supplierInput.value.trim();
  
    const openingQuantity = inventoryNumber(
      fields.quantityInput.value,
      0
    );
  
    const reorderLevel = inventoryNumber(
      fields.reorderLevelInput.value,
      0
    );
  
    const maxStock = inventoryNumber(
      fields.maxStockInput.value,
      0
    );
  
    const costPrice = inventoryNumber(
      fields.costPriceInput.value,
      0
    );
  
    const sellingPrice = inventoryNumber(
      fields.sellingPriceInput.value,
      0
    );
  
    const notes =
      fields.notesInput.value.trim();
  
    if (!itemName) {
      if (typeof showToast === "function") {
        showToast(
          "warning",
          "Item Name Required",
          "Enter an inventory item name before saving."
        );
      }
  
      fields.itemNameInput.focus();
      return;
    }
  
    if (openingQuantity < 0) {
      if (typeof showToast === "function") {
        showToast(
          "warning",
          "Invalid Opening Quantity",
          "Opening quantity cannot be negative."
        );
      }
  
      fields.quantityInput.focus();
      return;
    }
  
    if (reorderLevel < 0) {
      if (typeof showToast === "function") {
        showToast(
          "warning",
          "Invalid Reorder Level",
          "Reorder level cannot be negative."
        );
      }
  
      fields.reorderLevelInput.focus();
      return;
    }
  
    if (maxStock < 0) {
      if (typeof showToast === "function") {
        showToast(
          "warning",
          "Invalid Maximum Stock",
          "Maximum stock cannot be negative."
        );
      }
  
      fields.maxStockInput.focus();
      return;
    }
  
    if (
      maxStock > 0 &&
      reorderLevel > maxStock
    ) {
      if (typeof showToast === "function") {
        showToast(
          "warning",
          "Stock Levels Conflict",
          "Reorder level cannot be greater than maximum stock."
        );
      }
  
      fields.reorderLevelInput.focus();
      return;
    }
  
    if (costPrice < 0 || sellingPrice < 0) {
      if (typeof showToast === "function") {
        showToast(
          "warning",
          "Invalid Price",
          "Cost and selling prices cannot be negative."
        );
      }
  
      return;
    }
  
    const submitButton = inventoryForm.querySelector(
      'button[type="submit"]'
    );
  
    const originalButtonText = submitButton
      ? submitButton.textContent
      : "Save Inventory Item";
  
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
    }
  
    try {
      /*
        The item starts at zero.
  
        If an opening quantity was entered, the quantity is added
        through createInventoryTransaction() so the stock movement
        is recorded in inventory_transactions.
      */
      const payload = {
        item_name: itemName,
        sku: sku || null,
        part_number: partNumber || null,
        category: category || null,
        brand: brand || null,
        supplier: supplier || null,
  
        quantity: 0,
  
        reorder_level: reorderLevel,
        low_stock_limit: reorderLevel,
        max_stock: maxStock,
  
        cost_price: costPrice,
        selling_price: sellingPrice,
        unit_price: sellingPrice,
  
        notes: notes || null,
  
        is_active: true,
        status: "active",
  
        updated_by:
          typeof currentUser !== "undefined" &&
          currentUser
            ? currentUser.id
            : null
      };
  
      const {
        data: createdItem,
        error: insertError
      } = await supabaseClient
        .from("inventory_items")
        .insert([payload])
        .select("*")
        .single();
  
      if (insertError || !createdItem) {
        if (typeof showToast === "function") {
          showToast(
            "error",
            "Item Creation Failed",
            insertError?.message ||
              "The inventory item could not be created."
          );
        }
  
        return;
      }
  
      let openingBalanceRecorded = true;
      let openingBalanceMessage = "";
  
      if (openingQuantity > 0) {
        if (
          typeof createInventoryTransaction !==
          "function"
        ) {
          openingBalanceRecorded = false;
  
          openingBalanceMessage =
            "The transaction engine is not loaded.";
        } else {
          const openingResult =
            await createInventoryTransaction({
              inventory_item_id: createdItem.id,
              transaction_type: "OPENING_BALANCE",
              quantity_change: openingQuantity,
  
              reference_type:
                "INVENTORY_ITEM_CREATION",
  
              unit_cost: costPrice,
              unit_price: sellingPrice,
  
              supplier: supplier || null,
  
              notes:
                notes ||
                `Opening balance for ${itemName}.`
            });
  
          if (!openingResult.success) {
            openingBalanceRecorded = false;
  
            openingBalanceMessage =
              openingResult.message ||
              "Opening quantity could not be recorded.";
          }
        }
      }
  
      inventoryForm.reset();
      setInventoryCreateFormOpen(false);
  
      inventoryCurrentPage = 1;
  
      if (typeof loadInventoryItems === "function") {
        await loadInventoryItems();
      }
  
      if (
        openingQuantity > 0 &&
        !openingBalanceRecorded
      ) {
        if (typeof showToast === "function") {
          showToast(
            "warning",
            "Item Created Without Opening Stock",
            `${itemName} was created with quantity 0. ${openingBalanceMessage}`
          );
        }
  
        return;
      }
  
      if (typeof showToast === "function") {
        showToast(
          "success",
          "Inventory Item Created",
          openingQuantity > 0
            ? `${itemName} was created with an opening quantity of ${openingQuantity}.`
            : `${itemName} was created successfully.`
        );
      }
    } catch (error) {
      console.error(
        "Inventory creation error:",
        error
      );
  
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Item Creation Failed",
          error?.message ||
            "An unexpected error occurred while creating the inventory item."
        );
      }
    } finally {
      if (
        submitButton &&
        document.body.contains(submitButton)
      ) {
        submitButton.disabled = false;
        submitButton.textContent =
          originalButtonText;
      }
    }
  }
  
  
  /* =========================================================
     4. BIND ADD ITEM CONTROLS
     ========================================================= */
  
  function bindInventoryCreateControls() {
    if (
      showInventoryFormBtn &&
      showInventoryFormBtn.dataset
        .inventoryCreateBound !== "true"
    ) {
      showInventoryFormBtn.dataset
        .inventoryCreateBound = "true";
  
      showInventoryFormBtn.setAttribute(
        "aria-controls",
        "inventoryForm"
      );
  
      showInventoryFormBtn.setAttribute(
        "aria-expanded",
        "false"
      );
  
      showInventoryFormBtn.addEventListener(
        "click",
        toggleInventoryCreateForm
      );
    }
  
    if (
      inventoryForm &&
      inventoryForm.dataset
        .inventoryCreateBound !== "true"
    ) {
      inventoryForm.dataset
        .inventoryCreateBound = "true";
  
      inventoryForm.addEventListener(
        "submit",
        submitNewInventoryItem
      );
    }
  }
  
  
  /* =========================================================
     5. SEARCH CONTROL
  
     The previous file declared inventorySearchTimer but did not
     connect the search input to loadInventoryItems().
     ========================================================= */
  
  function bindInventorySearchControl() {
    if (
      !inventorySearch ||
      inventorySearch.dataset
        .inventorySearchBound === "true"
    ) {
      return;
    }
  
    inventorySearch.dataset
      .inventorySearchBound = "true";
  
    inventorySearch.addEventListener(
      "input",
      function () {
        clearTimeout(inventorySearchTimer);
  
        inventorySearchTimer = setTimeout(
          async function () {
            inventoryCurrentPage = 1;
            await loadInventoryItems();
          },
          350
        );
      }
    );
  }
  
  
  /* =========================================================
     6. INVENTORY FILTER EVENTS
     ========================================================= */
  
  [
    inventoryStatusFilter,
    inventoryCategoryFilter,
    inventoryBrandFilter
  ].forEach((filter) => {
    if (!filter) {
      return;
    }
  
    if (
      filter.dataset.inventoryFilterBound ===
      "true"
    ) {
      return;
    }
  
    filter.dataset.inventoryFilterBound = "true";
  
    filter.addEventListener(
      "change",
      async function () {
        inventoryCurrentPage = 1;
        await loadInventoryItems();
      }
    );
  });
  
  
  /* =========================================================
     7. INITIALIZE INVENTORY CONTROLS
     ========================================================= */
  
  bindInventoryCreateControls();
  bindInventorySearchControl();
  
  
  /* =========================================================
     8. GLOBAL EXPORTS
     ========================================================= */
  
  window.loadInventoryItems =
    loadInventoryItems;
  
  window.renderInventoryItems =
    renderInventoryItems;
  
  window.saveInventoryEditFromModal =
    saveInventoryEditFromModal;
  
  window.openInventoryActionCenter =
    openInventoryActionCenter;
  
  window.runInventoryAction =
    runInventoryAction;
  
  window.setInventoryCreateFormOpen =
    setInventoryCreateFormOpen;
  
  window.toggleInventoryCreateForm =
    toggleInventoryCreateForm;
  
  window.submitNewInventoryItem =
    submitNewInventoryItem;
  
  window.bindInventoryCreateControls =
    bindInventoryCreateControls;