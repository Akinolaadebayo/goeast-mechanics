/* =========================================================
   ADMIN INVENTORY BULK ACTIONS MODULE
   File: js/admin-inventory-bulk.js

   Purpose:
   Handles checkbox-based bulk actions for inventory records.

   Supported actions:
   - Select all visible records
   - Select individual records
   - Clear selection
   - Bulk deactivate
   - Bulk restore
   - Bulk permanent delete, Developer only
========================================================= */


/* =========================================================
   1. BULK SELECTION STATE
========================================================= */

let selectedInventoryItemIds = new Set();


/* =========================================================
   2. BASIC HELPERS
========================================================= */

function getSelectedInventoryIds() {
  return Array.from(selectedInventoryItemIds);
}

function getVisibleInventoryCheckboxes() {
  return Array.from(
    document.querySelectorAll(".inventory-row-checkbox")
  );
}

function getVisibleInventoryIds() {
  return getVisibleInventoryCheckboxes()
    .map((checkbox) => checkbox.getAttribute("data-id"))
    .filter(Boolean)
    .map(String);
}

function showInventoryBulkMessage(type, title, message) {
  if (typeof showToast === "function") {
    showToast(type, title, message);
    return;
  }

  alert(`${title}\n\n${message}`);
}


/* =========================================================
   3. SELECTION MANAGEMENT
========================================================= */

function clearInventorySelection() {
  selectedInventoryItemIds.clear();

  getVisibleInventoryCheckboxes().forEach((checkbox) => {
    checkbox.checked = false;
  });

  updateInventorySelectAllState();
  updateInventoryBulkBar();
}

function toggleInventoryRowSelection(itemId, checked) {
  const normalizedId = String(itemId);

  if (checked) {
    selectedInventoryItemIds.add(normalizedId);
  } else {
    selectedInventoryItemIds.delete(normalizedId);
  }

  updateInventorySelectAllState();
  updateInventoryBulkBar();
}

function toggleAllVisibleInventoryRows(checked) {
  getVisibleInventoryCheckboxes().forEach((checkbox) => {
    const itemId = checkbox.getAttribute("data-id");

    checkbox.checked = checked;

    if (!itemId) return;

    if (checked) {
      selectedInventoryItemIds.add(String(itemId));
    } else {
      selectedInventoryItemIds.delete(String(itemId));
    }
  });

  updateInventorySelectAllState();
  updateInventoryBulkBar();
}

function updateInventorySelectAllState() {
  const selectAllCheckbox = document.getElementById(
    "inventorySelectAllCheckbox"
  );

  if (!selectAllCheckbox) return;

  const visibleIds = getVisibleInventoryIds();

  if (visibleIds.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    return;
  }

  const selectedVisibleCount = visibleIds.filter((itemId) => {
    return selectedInventoryItemIds.has(String(itemId));
  }).length;

  selectAllCheckbox.checked =
    selectedVisibleCount === visibleIds.length;

  selectAllCheckbox.indeterminate =
    selectedVisibleCount > 0 &&
    selectedVisibleCount < visibleIds.length;
}

function restoreVisibleInventorySelection() {
  getVisibleInventoryCheckboxes().forEach((checkbox) => {
    const itemId = checkbox.getAttribute("data-id");

    checkbox.checked =
      itemId &&
      selectedInventoryItemIds.has(String(itemId));
  });

  updateInventorySelectAllState();
  updateInventoryBulkBar();
}


/* =========================================================
   4. BULK ACTION BAR
========================================================= */

function renderInventoryBulkBar() {
  const selectedCount = selectedInventoryItemIds.size;

  if (selectedCount === 0) {
    return `
      <div class="inventory-bulk-bar" aria-hidden="true"></div>
    `;
  }

  const deleteButton =
    typeof canDeleteInventoryItem === "function" &&
    canDeleteInventoryItem()
      ? `
        <button
          id="bulkDeleteInventoryBtn"
          type="button"
          class="inventory-bulk-btn inventory-bulk-delete-btn"
        >
          Delete Permanently
        </button>
      `
      : "";

  return `
    <div
      class="inventory-bulk-bar active"
      role="region"
      aria-label="Inventory bulk actions"
    >
      <div class="inventory-bulk-summary">
        <span class="inventory-bulk-count">
          ${selectedCount}
        </span>

        <div>
          <strong>
            ${selectedCount === 1
              ? "1 item selected"
              : `${selectedCount} items selected`}
          </strong>

          <small>
            Apply an action to all selected inventory records.
          </small>
        </div>
      </div>

      <div class="inventory-bulk-actions">
        <button
          id="bulkClearInventorySelectionBtn"
          type="button"
          class="inventory-bulk-btn inventory-bulk-clear-btn"
        >
          Clear
        </button>

        <button
          id="bulkDeactivateInventoryBtn"
          type="button"
          class="inventory-bulk-btn"
        >
          Deactivate
        </button>

        <button
          id="bulkRestoreInventoryBtn"
          type="button"
          class="inventory-bulk-btn"
        >
          Restore
        </button>

        ${deleteButton}
      </div>
    </div>
  `;
}

function updateInventoryBulkBar() {
  const bulkBar = document.getElementById("inventoryBulkBar");

  if (!bulkBar) return;

  bulkBar.innerHTML = renderInventoryBulkBar();
  bindInventoryBulkActionButtons();
}


/* =========================================================
   5. BULK DATABASE ACTIONS
========================================================= */

async function bulkDeactivateInventoryItems() {
  const ids = getSelectedInventoryIds();

  if (ids.length === 0) {
    showInventoryBulkMessage(
      "warning",
      "No Items Selected",
      "Select at least one inventory item."
    );
    return;
  }

  if (
    typeof canManageInventory !== "function" ||
    !canManageInventory()
  ) {
    showInventoryBulkMessage(
      "error",
      "Permission Denied",
      "You do not have permission to manage inventory."
    );
    return;
  }

  const approved = window.confirm(
    `Deactivate ${ids.length} selected inventory item(s)?\n\n` +
    "The items will remain in the database and may be restored later."
  );

  if (!approved) return;

  const { error } = await supabaseClient
    .from("inventory_items")
    .update({
      is_active: false,
      status: "inactive",
      updated_by:
        typeof currentUser !== "undefined" && currentUser
          ? currentUser.id
          : null
    })
    .in("id", ids);

  if (error) {
    showInventoryBulkMessage(
      "error",
      "Bulk Deactivation Failed",
      error.message ||
        "The selected inventory items could not be deactivated."
    );
    return;
  }

  clearInventorySelection();

  showInventoryBulkMessage(
    "success",
    "Items Deactivated",
    `${ids.length} inventory item(s) were deactivated successfully.`
  );

  if (typeof loadInventoryItems === "function") {
    await loadInventoryItems();
  }
}

async function bulkRestoreInventoryItems() {
  const ids = getSelectedInventoryIds();

  if (ids.length === 0) {
    showInventoryBulkMessage(
      "warning",
      "No Items Selected",
      "Select at least one inventory item."
    );
    return;
  }

  if (
    typeof canManageInventory !== "function" ||
    !canManageInventory()
  ) {
    showInventoryBulkMessage(
      "error",
      "Permission Denied",
      "You do not have permission to manage inventory."
    );
    return;
  }

  const approved = window.confirm(
    `Restore ${ids.length} selected inventory item(s)?`
  );

  if (!approved) return;

  const { error } = await supabaseClient
    .from("inventory_items")
    .update({
      is_active: true,
      status: "active",
      updated_by:
        typeof currentUser !== "undefined" && currentUser
          ? currentUser.id
          : null
    })
    .in("id", ids);

  if (error) {
    showInventoryBulkMessage(
      "error",
      "Bulk Restore Failed",
      error.message ||
        "The selected inventory items could not be restored."
    );
    return;
  }

  clearInventorySelection();

  showInventoryBulkMessage(
    "success",
    "Items Restored",
    `${ids.length} inventory item(s) were restored successfully.`
  );

  if (typeof loadInventoryItems === "function") {
    await loadInventoryItems();
  }
}

async function bulkDeleteInventoryItems() {
  const ids = getSelectedInventoryIds();

  if (ids.length === 0) {
    showInventoryBulkMessage(
      "warning",
      "No Items Selected",
      "Select at least one inventory item."
    );
    return;
  }

  if (
    typeof canDeleteInventoryItem !== "function" ||
    !canDeleteInventoryItem()
  ) {
    showInventoryBulkMessage(
      "error",
      "Permission Denied",
      "Only Developer access can permanently delete inventory items."
    );
    return;
  }

  const firstConfirmation = window.confirm(
    `Permanently delete ${ids.length} selected inventory item(s)?\n\n` +
    "Permanent deletion should only be used for duplicate, test, or invalid records."
  );

  if (!firstConfirmation) return;

  const finalConfirmation = window.confirm(
    "Final warning: this operation cannot be undone.\n\n" +
    "Continue with permanent deletion?"
  );

  if (!finalConfirmation) return;

  const { error } = await supabaseClient
    .from("inventory_items")
    .delete()
    .in("id", ids);

  if (error) {
    showInventoryBulkMessage(
      "error",
      "Bulk Delete Failed",
      error.message ||
        "The selected inventory items could not be deleted."
    );
    return;
  }

  clearInventorySelection();

  showInventoryBulkMessage(
    "success",
    "Items Deleted",
    `${ids.length} inventory item(s) were permanently deleted.`
  );

  if (typeof loadInventoryItems === "function") {
    await loadInventoryItems();
  }
}


/* =========================================================
   6. EVENT BINDINGS
========================================================= */

function bindInventoryBulkSelectionButtons() {
  const selectAllCheckbox = document.getElementById(
    "inventorySelectAllCheckbox"
  );

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      toggleAllVisibleInventoryRows(selectAllCheckbox.checked);
    });
  }

  getVisibleInventoryCheckboxes().forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      toggleInventoryRowSelection(
        checkbox.getAttribute("data-id"),
        checkbox.checked
      );
    });
  });

  restoreVisibleInventorySelection();
}

function bindInventoryBulkActionButtons() {
  const clearButton = document.getElementById(
    "bulkClearInventorySelectionBtn"
  );

  const deactivateButton = document.getElementById(
    "bulkDeactivateInventoryBtn"
  );

  const restoreButton = document.getElementById(
    "bulkRestoreInventoryBtn"
  );

  const deleteButton = document.getElementById(
    "bulkDeleteInventoryBtn"
  );

  if (clearButton) {
    clearButton.addEventListener(
      "click",
      clearInventorySelection
    );
  }

  if (deactivateButton) {
    deactivateButton.addEventListener(
      "click",
      bulkDeactivateInventoryItems
    );
  }

  if (restoreButton) {
    restoreButton.addEventListener(
      "click",
      bulkRestoreInventoryItems
    );
  }

  if (deleteButton) {
    deleteButton.addEventListener(
      "click",
      bulkDeleteInventoryItems
    );
  }
}


/* =========================================================
   7. GLOBAL EXPORTS
========================================================= */

window.getSelectedInventoryIds = getSelectedInventoryIds;
window.clearInventorySelection = clearInventorySelection;
window.toggleInventoryRowSelection = toggleInventoryRowSelection;
window.toggleAllVisibleInventoryRows =
  toggleAllVisibleInventoryRows;

window.renderInventoryBulkBar = renderInventoryBulkBar;
window.updateInventoryBulkBar = updateInventoryBulkBar;

window.bindInventoryBulkSelectionButtons =
  bindInventoryBulkSelectionButtons;

window.bulkDeactivateInventoryItems =
  bulkDeactivateInventoryItems;

window.bulkRestoreInventoryItems =
  bulkRestoreInventoryItems;

window.bulkDeleteInventoryItems =
  bulkDeleteInventoryItems;