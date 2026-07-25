/* =========================================================
   ADMIN INVENTORY ADJUSTMENTS MODULE
   File: js/admin-inventory-adjustments.js

   Purpose:
   Handles controlled inventory stock adjustments through
   the shared admin modal framework.

   Enterprise Rule:
   - The visible quantity entered by the user is the final
     counted quantity, not the amount to add or subtract.
   - The transaction engine calculates the difference.
   - No legacy inline adjustment form is used.
   ========================================================= */

   let adjustingInventoryItemId = null;


   /* =========================================================
      1. OPEN ADJUSTMENT MODAL
      ========================================================= */
   
   function openInventoryAdjustmentModal(item) {
     if (!item) {
       if (typeof showToast === "function") {
         showToast(
           "error",
           "Item Not Found",
           "The inventory item could not be found."
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
   
     adjustingInventoryItemId = item.id;
   
     const currentQuantity = inventoryNumber(item.quantity);
   
     openAdminModal({
       title: "Adjust Stock",
   
       subtitle:
         `${safeText(item.item_name, "Inventory Item")} • ` +
         `Current Qty: ${currentQuantity}`,
   
       content: `
         <form
           id="inventoryAdjustmentModalForm"
           class="admin-modal-form"
           autocomplete="off"
         >
           <label>
             Current Quantity
             <input
               id="adjustmentCurrentQuantity"
               type="number"
               value="${currentQuantity}"
               disabled
             >
           </label>
   
           <label>
             New Counted Quantity
             <input
               id="adjustmentNewQuantity"
               type="number"
               min="0"
               step="1"
               value="${currentQuantity}"
               required
             >
           </label>
   
           <label>
             Reason
             <select id="adjustmentReason">
               <option value="CYCLE_COUNT">
                 Cycle Count Correction
               </option>
   
               <option value="FOUND_STOCK">
                 Found Extra Stock
               </option>
   
               <option value="MISSING_STOCK">
                 Missing Stock
               </option>
   
               <option value="DAMAGED_STOCK">
                 Damaged Stock
               </option>
   
               <option value="DATA_CORRECTION">
                 Data Correction
               </option>
   
               <option value="MANUAL_ADJUSTMENT">
                 Manual Adjustment
               </option>
             </select>
           </label>
   
           <label class="full-span">
             Adjustment Notes
             <textarea
               id="adjustmentNotes"
               placeholder="Explain why this adjustment is needed."
             ></textarea>
           </label>
         </form>
       `,
   
       footer: `
         <button
           type="button"
           class="secondary-action-btn"
           onclick="closeInventoryAdjustmentForm()"
         >
           Cancel
         </button>
   
         <button
           type="button"
           class="primary-action-btn"
           onclick="submitInventoryAdjustmentFromModal()"
         >
           Save Adjustment
         </button>
       `
     });
   
     const quantityInput = document.querySelector(
       "#inventoryAdjustmentModalForm #adjustmentNewQuantity"
     );
   
     if (quantityInput) {
       quantityInput.focus();
       quantityInput.select();
     }
   }
   
   
   /* =========================================================
      2. SUBMIT ADJUSTMENT
      ========================================================= */
   
   async function submitInventoryAdjustmentFromModal() {
     if (!adjustingInventoryItemId) {
       if (typeof showToast === "function") {
         showToast(
           "warning",
           "No Item Selected",
           "Select an inventory item before adjusting stock."
         );
       }
   
       return;
     }
   
     /*
       Important:
       All selectors are scoped to the active modal form.
   
       This prevents old or duplicate page elements from being read.
     */
     const modalForm = document.getElementById(
       "inventoryAdjustmentModalForm"
     );
   
     if (!modalForm) {
       if (typeof showToast === "function") {
         showToast(
           "error",
           "Adjustment Form Error",
           "The active adjustment form could not be found."
         );
       }
   
       return;
     }
   
     const currentQuantityInput = modalForm.querySelector(
       "#adjustmentCurrentQuantity"
     );
   
     const quantityInput = modalForm.querySelector(
       "#adjustmentNewQuantity"
     );
   
     const reasonInput = modalForm.querySelector(
       "#adjustmentReason"
     );
   
     const notesInput = modalForm.querySelector(
       "#adjustmentNotes"
     );
   
     if (
       !currentQuantityInput ||
       !quantityInput ||
       !reasonInput ||
       !notesInput
     ) {
       if (typeof showToast === "function") {
         showToast(
           "error",
           "Adjustment Form Error",
           "One or more adjustment form fields could not be found."
         );
       }
   
       return;
     }
   
     const currentQuantity = inventoryNumber(
       currentQuantityInput.value
     );
   
     const newQuantity = inventoryNumber(
       quantityInput.value,
       Number.NaN
     );
   
     if (!Number.isFinite(newQuantity)) {
       if (typeof showToast === "function") {
         showToast(
           "warning",
           "Quantity Required",
           "Enter a valid counted quantity before saving."
         );
       }
   
       quantityInput.focus();
       return;
     }
   
     if (newQuantity < 0) {
       if (typeof showToast === "function") {
         showToast(
           "warning",
           "Invalid Quantity",
           "The new inventory quantity cannot be negative."
         );
       }
   
       quantityInput.focus();
       return;
     }
   
     if (newQuantity === currentQuantity) {
       if (typeof showToast === "function") {
         showToast(
           "warning",
           "No Stock Change",
           `The counted quantity is already ${currentQuantity}.`
         );
       }
   
       quantityInput.focus();
       return;
     }
   
     const reason =
       reasonInput.value || "MANUAL_ADJUSTMENT";
   
     const notes = notesInput.value.trim();
   
     const submitButton = document.querySelector(
       "#adminModalBox .primary-action-btn"
     );
   
     const originalButtonText = submitButton
       ? submitButton.textContent
       : "Save Adjustment";
   
     if (submitButton) {
       submitButton.disabled = true;
       submitButton.textContent = "Adjusting...";
     }
   
     try {
       const result = await adjustInventoryStock(
         adjustingInventoryItemId,
         newQuantity,
         {
           reference_type: reason,
   
           notes:
             notes ||
             `Inventory adjusted from ${currentQuantity} to ${newQuantity}. ` +
             `Reason: ${reason}.`
         }
       );
   
       if (!result.success) {
         if (typeof showToast === "function") {
           showToast(
             "error",
             "Adjustment Failed",
             result.message ||
               "The inventory quantity could not be adjusted."
           );
         }
   
         return;
       }
   
       const previousQuantity = inventoryNumber(
         result.previous_quantity,
         currentQuantity
       );
   
       const savedQuantity = inventoryNumber(
         result.new_quantity,
         newQuantity
       );
   
       const quantityDifference =
         savedQuantity - previousQuantity;
   
       adjustingInventoryItemId = null;
   
       if (typeof closeAdminModal === "function") {
         closeAdminModal();
       }
   
       if (typeof showToast === "function") {
         showToast(
           "success",
           "Stock Adjusted",
           `Quantity changed from ${previousQuantity} to ${savedQuantity} ` +
           `(${quantityDifference > 0 ? "+" : ""}${quantityDifference}).`
         );
       }
   
       if (typeof loadInventoryItems === "function") {
         await loadInventoryItems();
       }
     } catch (error) {
       console.error("Inventory adjustment error:", error);
   
       if (typeof showToast === "function") {
         showToast(
           "error",
           "Adjustment Failed",
           error?.message ||
             "An unexpected error occurred while adjusting inventory."
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
   
   
   /* =========================================================
      3. LEGACY-COMPATIBLE OPEN WRAPPER
      ========================================================= */
   
   function openInventoryAdjustmentForm(itemId) {
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
       } else {
         alert("Inventory item could not be found.");
       }
   
       return;
     }
   
     openInventoryAdjustmentModal(item);
   }
   
   
   /* =========================================================
      4. CLOSE MODAL
      ========================================================= */
   
   function closeInventoryAdjustmentForm() {
     adjustingInventoryItemId = null;
   
     if (typeof closeAdminModal === "function") {
       closeAdminModal();
     }
   }
   
   
   /* =========================================================
      5. LEGACY SUBMIT WRAPPER
      ========================================================= */
   
   async function submitInventoryAdjustment(event) {
     if (event) {
       event.preventDefault();
     }
   
     await submitInventoryAdjustmentFromModal();
   }
   
   
   /* =========================================================
      6. ACTION BUTTON BINDINGS
      ========================================================= */
   
   function bindInventoryAdjustmentButtons() {
     document.querySelectorAll(".adjust-stock-btn").forEach((button) => {
       button.addEventListener("click", function () {
         openInventoryAdjustmentForm(
           button.getAttribute("data-id")
         );
       });
     });
   }
   
   
   /* =========================================================
      7. GLOBAL EXPORTS
      ========================================================= */
   
   window.openInventoryAdjustmentModal =
     openInventoryAdjustmentModal;
   
   window.openInventoryAdjustmentForm =
     openInventoryAdjustmentForm;
   
   window.closeInventoryAdjustmentForm =
     closeInventoryAdjustmentForm;
   
   window.submitInventoryAdjustmentFromModal =
     submitInventoryAdjustmentFromModal;
   
   window.submitInventoryAdjustment =
     submitInventoryAdjustment;
   
   window.bindInventoryAdjustmentButtons =
     bindInventoryAdjustmentButtons;