/* =========================================================
   ADMIN INVENTORY HISTORY MODULE
   File: js/admin-inventory-history.js

   Purpose:
   Shows inventory movement history inside a modal instead of
   expanding inside the inventory table.
   ========================================================= */


/* =========================================================
   1. LOAD TRANSACTION HISTORY
   ========================================================= */

   async function loadInventoryItemHistory(itemId) {
    const { data, error } = await supabaseClient
      .from("inventory_transactions")
      .select(`
        id,
        inventory_item_id,
        transaction_type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reference_type,
        reference_id,
        supplier,
        location,
        unit_cost,
        unit_price,
        notes,
        performed_by,
        created_at
      `)
      .eq("inventory_item_id", itemId)
      .order("created_at", { ascending: false });
  
    if (error) {
      return {
        success: false,
        message: error.message,
        transactions: []
      };
    }
  
    return {
      success: true,
      message: "History loaded successfully.",
      transactions: data || []
    };
  }
  
  
  /* =========================================================
     2. OPEN HISTORY MODAL
     ========================================================= */
  
  async function openInventoryHistoryModal(item) {
    if (!item) {
      alert("Inventory item could not be found.");
      return;
    }
  
    if (typeof openAdminModal !== "function") {
      alert("Modal framework not loaded.");
      return;
    }
  
    openAdminModal({
      title: "Inventory Movement History",
      subtitle: safeText(item.item_name, "Inventory Item"),
      content: renderLoadingState("Loading inventory history..."),
      footer: `
        <button type="button" class="secondary-action-btn" onclick="closeAdminModal()">
          Close
        </button>
      `
    });
  
    const result = await loadInventoryItemHistory(item.id);
  
    const modalBody = document.querySelector("#adminModalBackdrop .admin-modal-body");
  
    if (!modalBody) return;
  
    if (!result.success) {
      modalBody.innerHTML = `
        <div class="admin-empty-state">
          <strong>Could not load inventory history</strong>
          <p>${safeText(result.message)}</p>
        </div>
      `;
      return;
    }
  
    modalBody.innerHTML = renderInventoryHistoryPanel(item, result.transactions);
  }
  
  
  /* =========================================================
     3. RENDER HISTORY PANEL
     ========================================================= */
  
  function renderInventoryHistoryPanel(item, transactions) {
    const quantity = inventoryNumber(item.quantity);
    const reorderLevel = inventoryNumber(item.reorder_level || item.low_stock_limit);
    const isActive = item.is_active !== false;
  
    const statusLabel = inventoryQuantityLabel(quantity, reorderLevel, isActive);
    const statusClass = inventoryStatusClass(quantity, reorderLevel, isActive);
  
    return `
      <div class="inventory-history-panel modal-history-panel">
        <div class="inventory-history-header">
          <div>
            <p class="admin-card-label">Inventory Audit Trail</p>
            <h3>${safeText(item.item_name, "Inventory Item")}</h3>
            <p>
              SKU: ${safeText(item.sku, "-")}
              ${item.part_number ? ` • Part #: ${safeText(item.part_number)}` : ""}
            </p>
          </div>
  
          <div class="inventory-history-summary">
            <span class="status-badge ${statusClass}">
              ${safeText(statusLabel)}
            </span>
            <strong>${safeText(quantity)}</strong>
            <small>Current quantity</small>
          </div>
        </div>
  
        <div class="inventory-history-list">
          ${renderInventoryTransactionRows(transactions)}
        </div>
      </div>
    `;
  }
  
  
  /* =========================================================
     4. RENDER TRANSACTION ROWS
     ========================================================= */
  
  function renderInventoryTransactionRows(transactions) {
    if (!transactions || transactions.length === 0) {
      return `
        <div class="inventory-history-empty">
          No inventory movement has been recorded for this item yet.
        </div>
      `;
    }
  
    return transactions.map((transaction) => {
      const quantityChange = Number(transaction.quantity_change || 0);
  
      const quantityClass = quantityChange >= 0
        ? "inventory-qty-positive"
        : "inventory-qty-negative";
  
      return `
        <div class="inventory-history-item">
          <div class="inventory-history-main">
            <div>
              <strong>
                ${safeText(inventoryFormatTransactionType(transaction.transaction_type))}
              </strong>
  
              <small>
                ${formatDate(transaction.created_at)}
                ${
                  transaction.reference_type
                    ? ` • ${safeText(transaction.reference_type)}`
                    : ""
                }
                ${
                  transaction.reference_id
                    ? ` #${safeText(transaction.reference_id)}`
                    : ""
                }
              </small>
            </div>
  
            <span class="inventory-history-quantity ${quantityClass}">
              ${safeText(inventorySignedQuantity(quantityChange))}
            </span>
          </div>
  
          <div class="inventory-history-grid">
            <div>
              <span>Previous Qty</span>
              <strong>${safeText(transaction.previous_quantity, "0")}</strong>
            </div>
  
            <div>
              <span>New Qty</span>
              <strong>${safeText(transaction.new_quantity, "0")}</strong>
            </div>
  
            <div>
              <span>Supplier</span>
              <strong>${safeText(transaction.supplier, "-")}</strong>
            </div>
  
            <div>
              <span>Location</span>
              <strong>${safeText(transaction.location, "-")}</strong>
            </div>
  
            <div>
              <span>Unit Cost</span>
              <strong>${money(transaction.unit_cost || 0)}</strong>
            </div>
  
            <div>
              <span>Unit Price</span>
              <strong>${money(transaction.unit_price || 0)}</strong>
            </div>
          </div>
  
          ${
            transaction.notes
              ? `
                <div class="inventory-history-notes">
                  <strong>Notes</strong>
                  <p>${safeText(transaction.notes)}</p>
                </div>
              `
              : ""
          }
        </div>
      `;
    }).join("");
  }
  
  
  /* =========================================================
     5. LEGACY SAFE WRAPPERS
     ========================================================= */
  
  async function toggleInventoryHistory(itemId) {
    const item = inventoryItems.find((record) => {
      return String(record.id) === String(itemId);
    });
  
    if (!item) {
      alert("Inventory item could not be found.");
      return;
    }
  
    await openInventoryHistoryModal(item);
  }
  
  function bindInventoryHistoryButtons() {
    document.querySelectorAll(".view-inventory-history-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const itemId = button.getAttribute("data-id");
        await toggleInventoryHistory(itemId);
      });
    });
  }
  
  
  /* =========================================================
     6. GLOBAL EXPORTS
     ========================================================= */
  
  window.loadInventoryItemHistory = loadInventoryItemHistory;
  window.openInventoryHistoryModal = openInventoryHistoryModal;
  window.renderInventoryHistoryPanel = renderInventoryHistoryPanel;
  window.toggleInventoryHistory = toggleInventoryHistory;
  window.bindInventoryHistoryButtons = bindInventoryHistoryButtons;
  window.openInventoryHistoryModal = openInventoryHistoryModal;
window.toggleInventoryHistory = toggleInventoryHistory;
window.bindInventoryHistoryButtons = bindInventoryHistoryButtons;