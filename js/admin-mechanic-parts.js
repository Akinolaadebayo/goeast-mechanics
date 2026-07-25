/* =========================================================
   ADMIN MECHANIC PARTS MODULE
   File: js/admin-mechanic-parts.js

   Sprint 7.3 — Enterprise Parts Management Engine

   Purpose:
   Handles parts attached to mechanic job cards.

   Supports:
   - Internal inventory parts
   - External supplier parts
   - Customer supplied parts
   - Job parts history
   - Current inventory price refresh
   - Current inventory quantity refresh
   - Safe future invoice/customer portal integration

   Handover:
   This file does NOT replace the mechanic board.
   It is called from admin-mechanic-board.js.
   ========================================================= */

let mechanicPartsByJob = {};
let mechanicInventoryItems = [];

/* =========================================================
      1. LOAD PARTS + INVENTORY
      ========================================================= */

async function loadMechanicPartsEngine() {
  await loadMechanicInventoryItems();
  await loadMechanicJobParts();
}

async function loadMechanicInventoryItems() {
  const { data, error } = await supabaseClient
    .from("inventory_items")
    .select(
      `
           id,
           item_name,
           sku,
           part_number,
           quantity,
           cost_price,
           selling_price,
           supplier,
           category,
           brand,
           is_active
         `
    )
    .eq("is_active", true)
    .order("item_name", { ascending: true });

  if (error) {
    console.error("Could not load inventory items:", error.message);

    mechanicInventoryItems = [];

    return false;
  }

  mechanicInventoryItems = data || [];

  return true;
}

async function loadMechanicJobParts() {
  mechanicPartsByJob = {};

  const { data, error } = await supabaseClient
    .from("job_parts")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Could not load job parts:", error.message);

    return false;
  }

  (data || []).forEach((part) => {
    const jobId = String(part.job_card_id);

    if (!mechanicPartsByJob[jobId]) {
      mechanicPartsByJob[jobId] = [];
    }

    mechanicPartsByJob[jobId].push(part);
  });

  return true;
}

/* =========================================================
      2. RENDER PARTS WORKSPACE
      ========================================================= */

function renderMechanicPartsWorkspace(job) {
  const parts = mechanicPartsByJob[String(job.id)] || [];

  return `
       <div class="mechanic-parts-workspace">
   
         <div class="admin-detail-header">
   
           <div>
             <p class="admin-card-label">
               Parts Management
             </p>
   
             <h3>Installed Parts</h3>
   
             <p>
               Record all parts installed during this repair.
               Inventory, externally sourced, and customer-supplied
               parts are managed here.
             </p>
           </div>
   
           <button
             type="button"
             class="table-action-btn"
             data-open-add-part="${job.id}"
           >
             Add Part
           </button>
   
         </div>
   
         ${
           parts.length === 0
             ? `
               <div class="card-notes">
                 <strong>No parts added yet</strong>
   
                 <p>
                   No inventory, external, or customer supplied
                   parts are linked to this job.
                 </p>
               </div>
             `
             : `
               ${renderMechanicPartsSummary(parts)}
               ${renderMechanicPartsTable(parts)}
             `
         }
   
       </div>
     `;
}

function renderMechanicPartsSummary(parts) {
  const inventoryParts = parts.filter(
    (part) => part.source_type === "inventory"
  ).length;

  const externalParts = parts.filter(
    (part) => part.source_type === "external"
  ).length;

  const customerParts = parts.filter(
    (part) => part.source_type === "customer"
  ).length;

  const totalQuantity = parts.reduce((sum, part) => {
    return sum + Number(part.quantity_used || 0);
  }, 0);

  const partsRevenue = parts.reduce((sum, part) => {
    return sum + Number(part.quantity_used || 0) * Number(part.unit_price || 0);
  }, 0);

  return `
       <div class="workspace-info-grid">
   
         ${renderInfoCard("Inventory Parts", inventoryParts)}
   
         ${renderInfoCard("External Parts", externalParts)}
   
         ${renderInfoCard("Customer Supplied", customerParts)}
   
         ${renderInfoCard("Total Quantity", totalQuantity)}
   
         ${renderInfoCard("Parts Revenue", money(partsRevenue))}
   
       </div>
     `;
}

function renderMechanicPartsTable(parts) {
  return `
       <div class="parts-entry-list">
   
         ${parts
           .map((part) => {
             const quantity = Number(part.quantity_used || 1);

             const unitPrice = Number(part.unit_price || 0);

             const total = quantity * unitPrice;

             return `
               <div class="parts-entry-card">
   
                 <div class="parts-entry-main">
   
                   <div>
                     <span class="parts-label">
                       Source
                     </span>
   
                     <strong>
                       ${safeText(part.source_type || "inventory")}
                     </strong>
                   </div>
   
                   <div>
                     <span class="parts-label">
                       Part
                     </span>
   
                     <strong>
                       ${safeText(part.item_name || "Part")}
                     </strong>
   
                     <p class="parts-notes">
                       SKU / Part #:
                       ${safeText(part.sku || "-")}
                     </p>
                   </div>
   
                 </div>
   
                 <div class="parts-entry-metrics">
   
                   <div>
                     <span class="parts-label">
                       Quantity
                     </span>
   
                     <strong>
                       ${safeText(quantity)}
                     </strong>
                   </div>
   
                   <div>
                     <span class="parts-label">
                       Unit Price
                     </span>
   
                     <strong>
                       ${money(unitPrice)}
                     </strong>
                   </div>
   
                   <div>
                     <span class="parts-label">
                       Total
                     </span>
   
                     <strong>
                       ${money(total)}
                     </strong>
                   </div>
   
                 </div>
   
                 <div class="parts-entry-actions">
   
                   <button
                     type="button"
                     class="
                       table-action-btn
                       installed-part-edit-btn
                     "
                     data-part-id="${part.id}"
                   >
                     Edit
                   </button>
   
                   <button
                     type="button"
                     class="
                       table-action-btn
                       danger
                       installed-part-remove-btn
                     "
                     data-part-id="${part.id}"
                   >
                     Remove
                   </button>
   
                 </div>
   
               </div>
             `;
           })
           .join("")}
   
       </div>
     `;
}

/* =========================================================
      3. ADD PART MODAL
      ========================================================= */

async function openMechanicAddPartModal(jobId) {
  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");
    return;
  }

  /*
       Important fix:
   
       Reload inventory immediately before rendering the modal.
   
       This ensures that recently changed:
   
       - selling prices
       - quantities
       - item names
       - active status
   
       are retrieved from Supabase.
     */
  const inventoryLoaded = await loadMechanicInventoryItems();

  if (!inventoryLoaded) {
    if (typeof showToast === "function") {
      showToast(
        "error",
        "Inventory Could Not Load",
        "Current inventory prices and quantities could not be retrieved."
      );
    } else {
      alert("Current inventory prices and quantities could not be retrieved.");
    }

    return;
  }

  openAdminModal({
    title: "Add Part to Job",

    subtitle: `JOB-${jobId}`,

    content: renderAddPartForm(jobId),

    footer: `
         <button
           type="button"
           class="table-action-btn"
           onclick="closeAdminModal()"
         >
           Cancel
         </button>
   
         <button
           type="button"
           class="table-action-btn"
           onclick="
             saveMechanicJobPart(
               ${Number(jobId)}
             )
           "
         >
           Save Part
         </button>
       `,
  });

  bindPartSourceChange();
}

function renderAddPartForm(jobId) {
  return `
       <div class="mechanic-parts-form">
   
         <label>
           Part Source
   
           <select
             id="mechanicPartSource"
             data-job-id="${jobId}"
           >
             <option value="inventory">
               Internal Inventory
             </option>
   
             <option value="external">
               External Supplier
             </option>
   
             <option value="customer">
               Customer Supplied
             </option>
           </select>
         </label>
   
   
         <div id="inventoryPartFields">
   
           <label>
             Search Inventory
   
             <input
               id="mechanicInventorySearch"
               type="text"
               placeholder="
                 Search part name, SKU, brand,
                 supplier, part number...
               "
               autocomplete="off"
             >
           </label>
   
   
           <label>
             Inventory Item
   
             <select id="mechanicInventoryItem">
   
               <option value="">
                 Select inventory item
               </option>
   
               ${mechanicInventoryItems
                 .map((item) => {
                   const searchableText = [
                     item.item_name,
                     item.sku,
                     item.part_number,
                     item.brand,
                     item.supplier,
                     item.category,
                   ]
                     .filter(Boolean)
                     .join(" ")
                     .toLowerCase();

                   const itemReference =
                     item.sku || item.part_number || "No SKU";

                   return `
                     <option
                       value="${item.id}"
                       data-search="
                         ${safeText(searchableText)}
                       "
                     >
                       ${safeText(item.item_name || "Inventory Item")}
                       —
                       ${safeText(itemReference)}
                       —
                       Qty:
                       ${safeText(item.quantity || 0)}
                     </option>
                   `;
                 })
                 .join("")}
   
             </select>
           </label>
   
         </div>
   
   
         <div
           id="manualPartFields"
           style="display:none;"
         >
   
           <label>
             Part Name
   
             <input
               id="mechanicManualPartName"
               type="text"
               placeholder="Part name"
             >
           </label>
   
   
           <label>
             SKU / Part Number
   
             <input
               id="mechanicManualSku"
               type="text"
               placeholder="SKU or part number"
             >
           </label>
   
   
           <label>
             Supplier
   
             <input
               id="mechanicManualSupplier"
               type="text"
               placeholder="Supplier name"
             >
           </label>
   
         </div>
   
   
         <label>
           Quantity Used
   
           <input
             id="mechanicPartQty"
             type="number"
             min="1"
             step="1"
             value="1"
           >
         </label>
   
   
         <label id="mechanicPartSellPriceLabel">
           Selling Price
   
           <input
             id="mechanicPartSellPrice"
             type="number"
             min="0"
             step="0.01"
             value="0.00"
           >
         </label>
   
   
         <label>
           Notes
   
           <textarea
             id="mechanicPartNotes"
             placeholder="Optional part notes"
           ></textarea>
         </label>
   
       </div>
     `;
}

function bindPartSourceChange() {
  const source = document.getElementById("mechanicPartSource");

  const inventoryFields = document.getElementById("inventoryPartFields");

  const manualFields = document.getElementById("manualPartFields");

  const inventorySearch = document.getElementById("mechanicInventorySearch");

  const inventorySelect = document.getElementById("mechanicInventoryItem");

  const sellingPriceInput = document.getElementById("mechanicPartSellPrice");

  const sellingPriceLabel = document.getElementById(
    "mechanicPartSellPriceLabel"
  );

  if (
    !source ||
    !inventoryFields ||
    !manualFields ||
    !inventorySelect ||
    !sellingPriceInput
  ) {
    return;
  }

  function getSelectedInventoryItem() {
    return mechanicInventoryItems.find((item) => {
      return String(item.id) === String(inventorySelect.value);
    });
  }

  function updateInventoryPrice() {
    const selectedItem = getSelectedInventoryItem();

    const currentPrice = Number(selectedItem?.selling_price || 0).toFixed(2);

    sellingPriceInput.value = currentPrice;

    /*
         Save the automatically loaded price.
   
         This allows the save function to detect
         whether the user intentionally changed it.
       */
    sellingPriceInput.dataset.defaultPrice = currentPrice;
  }

  function selectFirstAvailableItem() {
    if (inventorySelect.value) {
      return;
    }

    const firstAvailableOption = Array.from(inventorySelect.options).find(
      (option, index) => {
        return index > 0 && !option.hidden;
      }
    );

    if (firstAvailableOption) {
      inventorySelect.value = firstAvailableOption.value;
    }
  }

  function filterInventoryOptions() {
    if (!inventorySearch) {
      return;
    }

    const searchValue = inventorySearch.value.trim().toLowerCase();

    let firstVisibleOption = null;

    Array.from(inventorySelect.options).forEach((option, index) => {
      if (index === 0) {
        return;
      }

      const searchableText = option.dataset.search || "";

      const visible =
        searchValue === "" || searchableText.includes(searchValue);

      option.hidden = !visible;

      if (visible && !firstVisibleOption) {
        firstVisibleOption = option;
      }
    });

    if (firstVisibleOption) {
      inventorySelect.value = firstVisibleOption.value;

      updateInventoryPrice();
    } else {
      inventorySelect.value = "";

      sellingPriceInput.value = "0.00";

      sellingPriceInput.dataset.defaultPrice = "0.00";
    }
  }

  function applySourceUI() {
    const isInventory = source.value === "inventory";

    const isCustomer = source.value === "customer";

    inventoryFields.style.display = isInventory ? "block" : "none";

    manualFields.style.display = isInventory ? "none" : "block";

    if (sellingPriceLabel) {
      sellingPriceLabel.style.display = isCustomer ? "none" : "block";
    }

    if (isInventory) {
      selectFirstAvailableItem();
      updateInventoryPrice();
    } else {
      sellingPriceInput.value = "0.00";

      sellingPriceInput.dataset.defaultPrice = "0.00";
    }
  }

  source.addEventListener("change", applySourceUI);

  inventorySelect.addEventListener("change", updateInventoryPrice);

  if (inventorySearch) {
    inventorySearch.addEventListener("input", filterInventoryOptions);
  }

  applySourceUI();
}

/* =========================================================
      4. SAVE PART
      ========================================================= */

async function saveMechanicJobPart(jobId) {
  const sourceType =
    document.getElementById("mechanicPartSource")?.value || "inventory";

  const quantityUsed = Number(
    document.getElementById("mechanicPartQty")?.value || 0
  );

  const enteredSellPrice = Number(
    document.getElementById("mechanicPartSellPrice")?.value || 0
  );

  const notes =
    document.getElementById("mechanicPartNotes")?.value.trim() || "";

  if (!Number.isInteger(quantityUsed) || quantityUsed < 1) {
    alert("Quantity used must be a whole number of at least 1.");

    return;
  }

  if (!Number.isFinite(enteredSellPrice) || enteredSellPrice < 0) {
    alert("Selling price cannot be negative.");

    return;
  }

  let partPayload = {
    job_card_id: Number(jobId),

    quantity_used: quantityUsed,

    unit_price: enteredSellPrice,

    notes,
  };

  if (sourceType === "inventory") {
    const inventoryId = Number(
      document.getElementById("mechanicInventoryItem")?.value || 0
    );

    if (!inventoryId) {
      alert("Please select an inventory item.");

      return;
    }

    /*
         Important fix:
   
         Retrieve the exact item again immediately
         before saving.
   
         Even if the modal has been open for several
         minutes, the database remains the source
         of truth for price and quantity.
       */
    const { data: item, error: itemError } = await supabaseClient
      .from("inventory_items")
      .select(
        `
             id,
             item_name,
             sku,
             part_number,
             quantity,
             cost_price,
             selling_price,
             supplier,
             category,
             brand,
             is_active
           `
      )
      .eq("id", inventoryId)
      .single();

    if (itemError || !item || item.is_active === false) {
      alert("The current inventory item could not be loaded.");

      return;
    }

    const cachedItemIndex = mechanicInventoryItems.findIndex((cachedItem) => {
      return Number(cachedItem.id) === inventoryId;
    });

    if (cachedItemIndex >= 0) {
      mechanicInventoryItems[cachedItemIndex] = item;
    }

    const priceInput = document.getElementById("mechanicPartSellPrice");

    const automaticPrice = Number(priceInput?.dataset.defaultPrice || 0);

    const currentInventoryPrice = Number(item.selling_price || 0);

    const priceWasManuallyChanged =
      Math.abs(enteredSellPrice - automaticPrice) > 0.000001;

    /*
         When the user did not manually change
         the modal price, use the newest price
         retrieved from Supabase.
       */
    const effectiveSellPrice = priceWasManuallyChanged
      ? enteredSellPrice
      : currentInventoryPrice;

    const previousQuantity = Number(item.quantity || 0);

    if (previousQuantity < quantityUsed) {
      alert(
        `Not enough inventory stock available. Current quantity: ${previousQuantity}.`
      );

      return;
    }

    const newQuantity = previousQuantity - quantityUsed;

    partPayload = {
      ...partPayload,

      source_type: "inventory",

      inventory_item_id: item.id,

      item_name: item.item_name,

      sku: item.sku || item.part_number || "",

      unit_price: effectiveSellPrice,
    };

    const { error: stockError } = await supabaseClient
      .from("inventory_items")
      .update({
        quantity: newQuantity,
      })
      .eq("id", item.id);

    if (stockError) {
      alert("Could not deduct inventory: " + stockError.message);

      return;
    }

    const { error: transactionError } = await supabaseClient
      .from("inventory_transactions")
      .insert({
        inventory_item_id: item.id,

        transaction_type: "JOB_PART_USED",

        quantity_change: -quantityUsed,

        previous_quantity: previousQuantity,

        new_quantity: newQuantity,

        reference_type: "job_card",

        reference_id: Number(jobId),

        supplier: item.supplier || "",

        unit_cost: Number(item.cost_price || 0),

        unit_price: effectiveSellPrice,

        notes: notes || `Part used on JOB-${jobId}`,
      });

    if (transactionError) {
      console.error(
        "Inventory transaction record could not be created:",
        transactionError.message
      );
    }
  }

  if (sourceType === "external" || sourceType === "customer") {
    const partName =
      document.getElementById("mechanicManualPartName")?.value.trim() || "";

    const sku =
      document.getElementById("mechanicManualSku")?.value.trim() || "";

    const supplier =
      document.getElementById("mechanicManualSupplier")?.value.trim() || "";

    if (!partName) {
      alert("Please enter the part name.");

      return;
    }

    partPayload = {
      ...partPayload,

      source_type: sourceType,

      inventory_item_id: null,

      item_name: partName,

      sku,

      supplier,

      unit_price: sourceType === "customer" ? 0 : enteredSellPrice,
    };
  }

  const { error } = await supabaseClient.from("job_parts").insert(partPayload);

  if (error) {
    alert("Could not save part: " + error.message);

    return;
  }

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }

  if (typeof showToast === "function") {
    if (sourceType === "customer") {
      showToast(
        "success",
        "Customer Part Added",
        "Customer-supplied part has been recorded."
      );
    } else if (sourceType === "inventory") {
      showToast(
        "success",
        "Inventory Part Added",
        "The current inventory price was applied and stock was updated."
      );
    } else {
      showToast(
        "success",
        "External Part Added",
        "Externally sourced part has been recorded."
      );
    }
  }

  await refreshMechanicPartsViews();
}

/* =========================================================
      5. REFRESH RELATED VIEWS
      ========================================================= */

async function refreshMechanicPartsViews() {
  await loadMechanicPartsEngine();

  if (typeof loadMechanicBoard === "function") {
    await loadMechanicBoard();
  }

  if (typeof loadInventoryItems === "function") {
    await loadInventoryItems();
  }

  if (typeof renderInventoryItems === "function") {
    renderInventoryItems();
  }

  if (typeof loadInventory === "function") {
    await loadInventory();
  }
}

/* =========================================================
      6. BUTTON BINDINGS
      ========================================================= */

function bindMechanicPartsButtons() {
  document.querySelectorAll("[data-open-add-part]").forEach((button) => {
    button.addEventListener("click", async function () {
      await openMechanicAddPartModal(button.dataset.openAddPart);
    });
  });
}

/* =========================================================
      7. INSTALLED PART ACTIONS
      ========================================================= */

function editInstalledPart(partId) {
  const part = Object.values(mechanicPartsByJob)
    .flat()
    .find((item) => {
      return Number(item.id) === Number(partId);
    });

  if (!part) {
    alert("Installed part could not be found.");

    return;
  }

  if (typeof openAdminModal !== "function") {
    alert("Modal framework not loaded.");

    return;
  }

  openAdminModal({
    title: "Edit Installed Part",

    subtitle: safeText(part.item_name || "Installed Part"),

    content: `
         <div class="mechanic-parts-form">
   
           <label>
             Quantity Used
   
             <input
               id="editInstalledPartQty"
               type="number"
               min="1"
               step="1"
               value="${Number(part.quantity_used || 1)}"
             >
           </label>
   
   
           <label>
             Unit Price
   
             <input
               id="editInstalledPartPrice"
               type="number"
               min="0"
               step="0.01"
               value="${Number(part.unit_price || 0).toFixed(2)}"
               ${part.source_type === "customer" ? "readonly" : ""}
             >
           </label>
   
   
           <label>
             Notes
   
             <textarea
               id="editInstalledPartNotes"
             >${safeText(part.notes || "")}</textarea>
           </label>
   
         </div>
       `,

    footer: `
         <button
           type="button"
           class="table-action-btn"
           onclick="closeAdminModal()"
         >
           Cancel
         </button>
   
         <button
           type="button"
           class="table-action-btn"
           onclick="
             saveInstalledPartEdit(
               ${Number(part.id)}
             )
           "
         >
           Save Changes
         </button>
       `,
  });
}

async function saveInstalledPartEdit(partId) {
  const quantityUsed = Number(
    document.getElementById("editInstalledPartQty")?.value || 0
  );

  const unitPrice = Number(
    document.getElementById("editInstalledPartPrice")?.value || 0
  );

  const notes =
    document.getElementById("editInstalledPartNotes")?.value.trim() || null;

  if (!Number.isInteger(quantityUsed) || quantityUsed < 1) {
    alert("Quantity must be a whole number of at least 1.");

    return;
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    alert("Unit price cannot be negative.");

    return;
  }

  const { error } = await supabaseClient.rpc("update_mechanic_job_part", {
    p_job_part_id: Number(partId),

    p_quantity_used: quantityUsed,

    p_unit_price: unitPrice,

    p_notes: notes,
  });

  if (error) {
    alert("Could not update installed part: " + error.message);

    return;
  }

  if (typeof closeAdminModal === "function") {
    closeAdminModal();
  }

  if (typeof showToast === "function") {
    showToast(
      "success",
      "Part Updated",
      "Installed part updated. Inventory was adjusted when applicable."
    );
  }

  await refreshMechanicPartsViews();
}

async function removeInstalledPart(partId) {
  const confirmed = confirm(
    "Remove this installed part from the repair record? Internal inventory parts will be returned to stock automatically."
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient.rpc("remove_mechanic_job_part", {
    p_job_part_id: Number(partId),
  });

  if (error) {
    alert("Could not remove installed part: " + error.message);

    return;
  }

  if (typeof showToast === "function") {
    showToast(
      "success",
      "Part Removed",
      "Installed part removed. Inventory was restored when applicable."
    );
  }

  await refreshMechanicPartsViews();
}

/* =========================================================
      8. DELEGATED EVENTS
      ========================================================= */

if (!window.__mechanicPartsDelegatedEventsBound) {
  document.addEventListener("click", function (event) {
    const editButton = event.target.closest(".installed-part-edit-btn");

    const removeButton = event.target.closest(".installed-part-remove-btn");

    if (editButton) {
      event.preventDefault();

      editInstalledPart(editButton.dataset.partId);

      return;
    }

    if (removeButton) {
      event.preventDefault();

      removeInstalledPart(removeButton.dataset.partId);
    }
  });

  window.__mechanicPartsDelegatedEventsBound = true;
}

/* =========================================================
      9. GLOBAL EXPORTS
      ========================================================= */

window.openMechanicAddPartModal = openMechanicAddPartModal;

window.saveMechanicJobPart = saveMechanicJobPart;

window.editInstalledPart = editInstalledPart;

window.saveInstalledPartEdit = saveInstalledPartEdit;

window.removeInstalledPart = removeInstalledPart;
