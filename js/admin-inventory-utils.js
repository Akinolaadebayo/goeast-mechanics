/* =========================================================
   ADMIN INVENTORY UTILITIES
   File: js/admin-inventory-utils.js

   Purpose:
   Shared helper functions for the enterprise inventory system.

   Used by:
   - admin-inventory-items.js
   - admin-inventory-transactions.js
   - admin-inventory-history.js
   - admin-inventory-receiving.js
   - admin-inventory-adjustments.js
   - admin-inventory-bulk.js
   ========================================================= */

   function canManageInventory() {
    return (
      currentProfile &&
      ["developer", "upper_admin"].includes(currentProfile.role)
    );
  }
  
  function canDeleteInventoryItem() {
    return currentProfile && currentProfile.role === "developer";
  }
  
  function inventoryNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  
  function inventoryQuantityLabel(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "Inactive";
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  }
  
  function inventoryStatusClass(quantity, reorderLevel, isActive = true) {
    if (!isActive) return "status-cancelled";
    if (quantity <= 0) return "status-cancelled";
    if (quantity <= reorderLevel) return "status-waiting_parts";
    return "status-closed";
  }
  
  function inventoryFormatTransactionType(type) {
    if (!type) return "Transaction";
  
    return String(type)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  
  function inventorySignedQuantity(value) {
    const number = inventoryNumber(value);
  
    if (number > 0) return `+${number}`;
    return String(number);
  }
  
  function inventorySafeId(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
  }