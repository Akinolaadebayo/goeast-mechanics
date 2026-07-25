/* =========================================================
   CUSTOMER DASHBOARD APP CONTROLLER
   File: js/customer.js
   ========================================================= */

   function initializeCustomerNavigation() {
    navButtons.forEach((button) => {
      button.addEventListener("click", function () {
        navButtons.forEach((btn) => btn.classList.remove("active"));
        sections.forEach((section) => section.classList.remove("active-section"));
  
        button.classList.add("active");
  
        const targetSection = document.getElementById(button.dataset.section);
  
        if (targetSection) {
          targetSection.classList.add("active-section");
        }
      });
    });
  }
  
  async function loadCustomerDashboard() {
    await loadCustomerVehicles();
  
    await loadCustomerRequests();
    await loadCustomerRepairUpdates();
  
    await loadCustomerInvoices();
    await loadCustomerPayments();
  
    updateCustomerStatistics();
  }
  
  function subscribeCustomerRealtime() {
    supabaseClient
      .channel("customer-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repair_updates" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invoices" },
        loadCustomerDashboard
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        loadCustomerDashboard
      )
      .subscribe();
  }
  
  async function initializeCustomerDashboard() {
    initializeCustomerNavigation();
  
    const isAuthorizedCustomer = await checkCustomerSession();
  
    if (!isAuthorizedCustomer) {
      return;
    }
  
    await loadCustomerDashboard();
    subscribeCustomerRealtime();
  }
  
  initializeCustomerDashboard();