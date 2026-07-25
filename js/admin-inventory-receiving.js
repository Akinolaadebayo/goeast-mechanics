/* =========================================================
   ADMIN INVENTORY RECEIVING MODULE
   File: js/admin-inventory-receiving.js
========================================================= */

let receivingInventoryItemId = null;

function openReceiveStockModal(item) {
  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  receivingInventoryItemId = item.id;

  openAdminModal({
    title: "Receive Stock",
    subtitle: `${safeText(item.item_name, "Inventory Item")} • Current Qty: ${safeText(item.quantity, "0")}`,
    content: `
      <form id="receiveStockModalForm" class="admin-modal-form">
        <label>
          Quantity Received
          <input id="modalReceiveStockQuantity" type="number" min="1" step="1" required>
        </label>

        <label>
          Supplier
          <input id="modalReceiveStockSupplier" value="${escapeHtml(item.supplier || "")}">
        </label>

        <label>
          Location / Shelf
          <input id="modalReceiveStockLocation" value="${escapeHtml(item.location || "")}">
        </label>

        <label>
          Unit Cost
          <input id="modalReceiveStockUnitCost" type="number" min="0" step="0.01" value="${Number(item.cost_price || item.unit_price || 0)}">
        </label>

        <label>
          Unit Price
          <input id="modalReceiveStockUnitPrice" type="number" min="0" step="0.01" value="${Number(item.selling_price || item.unit_price || 0)}">
        </label>

        <label class="full-span">
          Receiving Notes
          <textarea id="modalReceiveStockNotes" placeholder="Example: Supplier invoice received, shelf A2."></textarea>
        </label>
      </form>
    `,
    footer: `
      <button type="button" class="secondary-action-btn" onclick="closeReceiveStockForm()">Cancel</button>
      <button type="button" class="primary-action-btn" onclick="submitReceiveStockFromModal()">Receive Stock</button>
    `
  });
}

async function submitReceiveStockFromModal() {
  if (!receivingInventoryItemId) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "No Item Selected",
        "Select an inventory item before receiving stock."
      );
    }

    return;
  }

  const quantityInput = document.getElementById(
    "modalReceiveStockQuantity"
  );

  const supplierInput = document.getElementById(
    "modalReceiveStockSupplier"
  );

  const locationInput = document.getElementById(
    "modalReceiveStockLocation"
  );

  const unitCostInput = document.getElementById(
    "modalReceiveStockUnitCost"
  );

  const unitPriceInput = document.getElementById(
    "modalReceiveStockUnitPrice"
  );

  const notesInput = document.getElementById(
    "modalReceiveStockNotes"
  );

  if (
    !quantityInput ||
    !supplierInput ||
    !locationInput ||
    !unitCostInput ||
    !unitPriceInput ||
    !notesInput
  ) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Receive Stock Form Error",
        "One or more receiving form fields could not be found."
      );
    }

    return;
  }

  const quantity = inventoryNumber(quantityInput.value);

  if (quantity <= 0) {
    if (typeof showToast === "function") {
      showToast(
        "warning",
        "Invalid Quantity",
        "Receive quantity must be greater than zero."
      );
    }

    quantityInput.focus();
    return;
  }

  const supplier = supplierInput.value.trim();
  const location = locationInput.value.trim();
  const unitCost = inventoryNumber(unitCostInput.value);
  const unitPrice = inventoryNumber(unitPriceInput.value);
  const notes = notesInput.value.trim();

  const submitButton = document.querySelector(
    "#adminModalBox .primary-action-btn"
  );

  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Receive Stock";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Receiving...";
  }

  try {
    const result = await receiveInventoryStock(
      receivingInventoryItemId,
      quantity,
      {
        supplier,
        location,
        unit_cost: unitCost,
        unit_price: unitPrice,
        notes: notes || "Stock received manually."
      }
    );

    if (!result.success) {
      if (typeof showToast === "function") {
        showToast(
          "error",
          "Stock Could Not Be Received",
          result.message ||
            "The stock receiving operation could not be completed."
        );
      }

      return;
    }

    receivingInventoryItemId = null;

    if (typeof closeAdminModal === "function") {
      closeAdminModal();
    }

    if (typeof showToast === "function") {
      showToast(
        "success",
        "Stock Received",
        `${quantity} unit${quantity === 1 ? "" : "s"} added to inventory successfully.`
      );
    }

    if (typeof loadInventoryItems === "function") {
      await loadInventoryItems();
    }
  } catch (error) {
    console.error("Receive stock error:", error);

    if (typeof showToast === "function") {
      showToast(
        "error",
        "Stock Could Not Be Received",
        error?.message ||
          "An unexpected error occurred while receiving stock."
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

function openReceiveStockForm(itemId) {
  const item = inventoryItems.find((record) => String(record.id) === String(itemId));

  if (!item) {
    alert("Inventory item could not be found.");
    return;
  }

  openReceiveStockModal(item);
}

function closeReceiveStockForm() {
  receivingInventoryItemId = null;

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }
}

async function submitReceiveStock(event) {
  event.preventDefault();
  await submitReceiveStockFromModal();
}

function bindInventoryReceivingButtons() {
  document.querySelectorAll(".receive-stock-btn").forEach((button) => {
    button.addEventListener("click", function () {
      openReceiveStockForm(button.getAttribute("data-id"));
    });
  });
}

window.openReceiveStockModal = openReceiveStockModal;
window.openReceiveStockForm = openReceiveStockForm;
window.closeReceiveStockForm = closeReceiveStockForm;
window.submitReceiveStockFromModal = submitReceiveStockFromModal;
window.submitReceiveStock = submitReceiveStock;
window.bindInventoryReceivingButtons = bindInventoryReceivingButtons;