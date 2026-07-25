/* =========================================================
   ADMIN INVENTORY TRANSACTIONS MODULE
   File: js/admin-inventory-transactions.js

   Purpose:
   Core inventory transaction engine.

   Enterprise Rule:
   Inventory quantity should not be changed silently.
   Every stock movement must create a transaction record.

   Supported transaction types:
   - OPENING_BALANCE
   - RECEIVE
   - ISSUE
   - RETURN
   - ADJUSTMENT
   - TRANSFER
   - WARRANTY
   - DAMAGED
   - CYCLE_COUNT
   - PURCHASE
   ========================================================= */

/* =========================================================
   1. CREATE INVENTORY TRANSACTION

   Operation:
   - Reads current inventory item quantity.
   - Calculates new quantity.
   - Updates inventory_items.quantity.
   - Inserts inventory_transactions ledger record.

   This function becomes the single source for stock movement.
   ========================================================= */

   async function createInventoryTransaction(options) {
    if (!canManageInventory()) {
      return {
        success: false,
        message: "You do not have permission to manage inventory."
      };
    }
  
    const inventoryItemId = Number(options.inventory_item_id);
    const transactionType = options.transaction_type;
    const quantityChange = inventoryNumber(options.quantity_change);
  
    if (!inventoryItemId) {
      return {
        success: false,
        message: "Inventory item is required."
      };
    }
  
    if (!transactionType) {
      return {
        success: false,
        message: "Transaction type is required."
      };
    }
  
    if (quantityChange === 0) {
      return {
        success: false,
        message: "Quantity change cannot be zero."
      };
    }
  
    const { data: item, error: itemError } = await supabaseClient
      .from("inventory_items")
      .select("*")
      .eq("id", inventoryItemId)
      .single();
  
    if (itemError || !item) {
      return {
        success: false,
        message: "Inventory item could not be found."
      };
    }
  
    const previousQuantity = inventoryNumber(item.quantity);
    const newQuantity = previousQuantity + quantityChange;
  
    if (newQuantity < 0) {
      return {
        success: false,
        message: "This transaction would make stock negative."
      };
    }
  
    const { error: updateError } = await supabaseClient
      .from("inventory_items")
      .update({
        quantity: newQuantity,
        updated_by: currentUser ? currentUser.id : null
      })
      .eq("id", inventoryItemId);
  
    if (updateError) {
      return {
        success: false,
        message: "Inventory quantity could not be updated: " + updateError.message
      };
    }
  
    const transactionPayload = {
      inventory_item_id: inventoryItemId,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference_type: options.reference_type || "MANUAL",
      reference_id: options.reference_id || null,
      supplier: options.supplier || item.supplier || null,
      location: options.location || item.location || null,
      unit_cost: inventoryNumber(options.unit_cost || item.cost_price || item.unit_price),
      unit_price: inventoryNumber(options.unit_price || item.selling_price || item.unit_price),
      notes: options.notes || null,
      performed_by: currentUser ? currentUser.id : null
    };
  
    const { error: transactionError } = await supabaseClient
      .from("inventory_transactions")
      .insert([transactionPayload]);
  
    if (transactionError) {
      /*
        Important:
        If this insert fails, quantity has already changed.
        In a later enterprise version, we should move this into a
        Supabase RPC/database transaction for true atomic safety.
      */
      return {
        success: false,
        message:
          "Quantity updated, but transaction record failed: " +
          transactionError.message
      };
    }
  
    return {
      success: true,
      message: "Inventory transaction completed successfully.",
      previous_quantity: previousQuantity,
      new_quantity: newQuantity
    };
  }
  
  /* =========================================================
     2. RECEIVE STOCK
  
     Operation:
     Adds inventory quantity and creates RECEIVE transaction.
     ========================================================= */
  
  async function receiveInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "RECEIVE",
      quantity_change: Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_RECEIVE",
      reference_id: options.reference_id || null,
      supplier: options.supplier || null,
      location: options.location || null,
      unit_cost: options.unit_cost || 0,
      unit_price: options.unit_price || 0,
      notes: options.notes || "Stock received manually."
    });
  }
  
  /* =========================================================
     3. ISSUE STOCK
  
     Operation:
     Deducts inventory quantity and creates ISSUE transaction.
  
     Later this will be used by Job Cards when mechanics consume parts.
     ========================================================= */
  
  async function issueInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "ISSUE",
      quantity_change: -Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_ISSUE",
      reference_id: options.reference_id || null,
      supplier: options.supplier || null,
      location: options.location || null,
      unit_cost: options.unit_cost || 0,
      unit_price: options.unit_price || 0,
      notes: options.notes || "Stock issued manually."
    });
  }
  
  /* =========================================================
     4. ADJUST STOCK
  
     Operation:
     Handles manual correction.
  
     Example:
     Current quantity is 10.
     Actual counted quantity is 14.
     Difference = +4.
     ========================================================= */
  
  async function adjustInventoryStock(itemId, newQuantity, options = {}) {
    const { data: item, error } = await supabaseClient
      .from("inventory_items")
      .select("id, quantity")
      .eq("id", itemId)
      .single();
  
    if (error || !item) {
      return {
        success: false,
        message: "Inventory item could not be found."
      };
    }
  
    const currentQuantity = inventoryNumber(item.quantity);
    const targetQuantity = inventoryNumber(newQuantity);
    const difference = targetQuantity - currentQuantity;
  
    if (difference === 0) {
      return {
        success: false,
        message: "No stock change needed."
      };
    }
  
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "ADJUSTMENT",
      quantity_change: difference,
      reference_type: options.reference_type || "MANUAL_ADJUSTMENT",
      reference_id: options.reference_id || null,
      notes: options.notes || "Manual stock adjustment."
    });
  }
  
  /* =========================================================
     5. RETURN STOCK
  
     Operation:
     Adds stock back into inventory.
     ========================================================= */
  
  async function returnInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "RETURN",
      quantity_change: Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_RETURN",
      reference_id: options.reference_id || null,
      notes: options.notes || "Stock returned."
    });
  }
  
  /* =========================================================
     6. DAMAGE / WRITE-OFF STOCK
  
     Operation:
     Deducts damaged stock with a ledger record.
     ========================================================= */
  
  async function damageInventoryStock(itemId, quantity, options = {}) {
    return await createInventoryTransaction({
      inventory_item_id: itemId,
      transaction_type: "DAMAGED",
      quantity_change: -Math.abs(inventoryNumber(quantity)),
      reference_type: options.reference_type || "MANUAL_DAMAGE",
      reference_id: options.reference_id || null,
      notes: options.notes || "Stock marked as damaged."
    });
  }