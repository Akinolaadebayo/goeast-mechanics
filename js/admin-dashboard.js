/* =========================================================
   ADMIN DASHBOARD MODULE
   File: js/admin-dashboard.js

   Purpose:
   - Shows the authenticated staff profile.
   - Applies role-based dashboard wording and permissions.
   - Controls section navigation.
   - Updates Service Request statistics.
   - Loads inventory and low-stock dashboard totals.

   Defensive Design:
   Missing HTML elements will not stop the dashboard.
   ========================================================= */


/* =========================================================
   1. SAFE DOM HELPERS
   ========================================================= */

   function setTextIfExists(id, value) {
    const element =
      document.getElementById(id);
  
    if (element) {
      element.textContent = value;
    }
  }
  
  
  function setTextBySelector(
    selector,
    value
  ) {
    const element =
      document.querySelector(selector);
  
    if (element) {
      element.textContent = value;
    }
  }
  
  
  /* =========================================================
     2. ROLE FORMATTING
     ========================================================= */
  
  function formatAdminRole(role) {
    if (!role) {
      return "Staff";
    }
  
    return String(role)
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) => {
          return letter.toUpperCase();
        }
      );
  }
  
  
  /**
   * Returns the completed dashboard subtitle for each role.
   *
   * @param {string} role
   * @returns {string}
   */
  function getAdminDashboardSubtitle(role) {
    const subtitles = {
      developer:
        "Full platform access across service requests, workshop jobs, inventory, billing, and system controls.",
  
      upper_admin:
        "Manage business operations, workshop activity, inventory, invoices, and payments.",
  
      receptionist:
        "Manage customer intake, Service Requests, appointments, and pickup communication.",
  
      mechanic:
        "Manage assigned repair work, diagnosis, parts, labour, and workshop progress."
    };
  
    return (
      subtitles[role] ||
      "Your secure Go East Mechanics workspace is ready."
    );
  }
  
  
  /* =========================================================
     3. ADMIN PROFILE UI
     ========================================================= */
  
  /**
   * Replaces all loading placeholders with the authenticated
   * staff profile and completed role-specific dashboard wording.
   */
  function applyAdminProfileUI() {
    if (
      !currentUser ||
      !currentProfile
    ) {
      return;
    }
  
    const displayName =
      currentProfile.full_name ||
      currentUser.email ||
      "Staff User";
  
    const email =
      currentProfile.email ||
      currentUser.email ||
      "";
  
    const role =
      formatAdminRole(
        currentProfile.role
      );
  
    const initials =
      displayName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
          return word.charAt(0);
        })
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "ST";
  
  
    /*
      Exact IDs from admin.html.
    */
    setTextIfExists(
      "adminName",
      displayName
    );
  
    setTextIfExists(
      "adminEmail",
      email
    );
  
    setTextIfExists(
      "adminRoleBadge",
      role
    );
  
    setTextIfExists(
      "profileInitials",
      initials
    );
  
    setTextIfExists(
      "staffRoleLabel",
      role.toUpperCase()
    );
  
    setTextIfExists(
      "sidebarRoleLabel",
      role.toUpperCase()
    );
  
    setTextIfExists(
      "dashboardSubtitle",
      getAdminDashboardSubtitle(
        currentProfile.role
      )
    );
  
  
    /*
      Compatibility selectors for older dashboard layouts.
    */
    setTextBySelector(
      ".profile-card strong",
      displayName
    );
  
    setTextBySelector(
      ".profile-card span",
      email
        ? `${email} • ${role}`
        : role
    );
  
    setTextBySelector(
      ".profile-avatar",
      initials
    );
  
  
    const sidebarBadge =
      document.querySelector(
        ".sidebar .role-badge"
      ) ||
      document.querySelector(
        ".sidebar-badge"
      ) ||
      document.querySelector(
        ".sidebar-role"
      );
  
    if (sidebarBadge) {
      sidebarBadge.textContent =
        role.toUpperCase();
    }
  
  
    const topLabel =
      document.querySelector(
        ".admin-topbar .top-label"
      );
  
    if (topLabel) {
      topLabel.textContent =
        role.toUpperCase();
    }
  }
  
  
  /* =========================================================
     4. ROLE-BASED UI
     ========================================================= */
  
  /**
   * Shows only controls permitted for the authenticated role.
   */
  function applyRoleUI() {
    if (!currentProfile) {
      return;
    }
  
    document
      .querySelectorAll(
        "[data-roles]"
      )
      .forEach((element) => {
        const allowedRoles =
          String(
            element.dataset.roles ||
            ""
          )
            .split(",")
            .map((role) => {
              return role.trim();
            })
            .filter(Boolean);
  
        element.style.display =
          allowedRoles.includes(
            currentProfile.role
          )
            ? ""
            : "none";
      });
  }
  
  
  /* =========================================================
     5. SECTION NAVIGATION
     ========================================================= */
  
  function showAdminSection(sectionId) {
    document
      .querySelectorAll(
        ".admin-section"
      )
      .forEach((section) => {
        section.classList.remove(
          "active-section"
        );
      });
  
    document
      .querySelectorAll(
        ".nav-btn"
      )
      .forEach((button) => {
        button.classList.remove(
          "active"
        );
      });
  
    const section =
      document.getElementById(
        sectionId
      );
  
    const button =
      document.querySelector(
        `.nav-btn[data-section="${sectionId}"]`
      );
  
    if (section) {
      section.classList.add(
        "active-section"
      );
    }
  
    if (button) {
      button.classList.add(
        "active"
      );
    }
  }
  
  
  /**
   * Connects navigation and opens the first visible section.
   *
   * data-navigation-bound prevents duplicate click listeners.
   */
  function showFirstAllowedSection() {
    const buttons =
      Array.from(
        document.querySelectorAll(
          ".nav-btn"
        )
      ).filter((button) => {
        return (
          button.style.display !==
          "none"
        );
      });
  
    buttons.forEach((button) => {
      if (
        button.dataset.navigationBound ===
        "true"
      ) {
        return;
      }
  
      button.dataset.navigationBound =
        "true";
  
      button.addEventListener(
        "click",
        function () {
          showAdminSection(
            button.dataset.section
          );
        }
      );
    });
  
    const firstButton =
      buttons[0];
  
    if (
      firstButton &&
      firstButton.dataset.section
    ) {
      showAdminSection(
        firstButton.dataset.section
      );
    }
  }
  
  
  /* =========================================================
     6. SERVICE REQUEST DASHBOARD STATISTICS
     ========================================================= */
  
  /**
   * Updates request-based dashboard cards.
   *
   * Active Jobs represents Service Requests currently in an
   * operational workshop stage.
   */
  function updateDashboardStats() {
    const requests =
      Array.isArray(allRequests)
        ? allRequests
        : [];
  
    const countByStatus =
      function (statuses) {
        return requests.filter(
          (request) => {
            const status =
              String(
                request.status ||
                "new"
              )
                .trim()
                .toLowerCase();
  
            return statuses.includes(
              status
            );
          }
        ).length;
      };
  
  
    const total =
      requests.length;
  
    const newCount =
      countByStatus([
        "new"
      ]);
  
    const acknowledgedCount =
      countByStatus([
        "acknowledged"
      ]);
  
    const activeCount =
      countByStatus([
        "diagnosing",
        "waiting_parts",
        "repairing",
        "testing"
      ]);
  
    const readyClosedCount =
      countByStatus([
        "ready_for_pickup",
        "closed"
      ]);
  
    const cancelledCount =
      countByStatus([
        "cancelled"
      ]);
  
  
    /*
      Exact IDs used in admin.html.
    */
    setTextIfExists(
      "totalRequests",
      total
    );
  
    setTextIfExists(
      "newRequests",
      newCount
    );
  
    setTextIfExists(
      "acknowledgedRequests",
      acknowledgedCount
    );
  
    setTextIfExists(
      "ongoingRequests",
      activeCount
    );
  
    setTextIfExists(
      "finishedRequests",
      readyClosedCount
    );
  
    setTextIfExists(
      "canceledRequests",
      cancelledCount
    );
  }
  
  
  /* =========================================================
     7. INVENTORY DASHBOARD STATISTICS
     ========================================================= */
  
  /**
   * Loads active inventory totals and low-stock totals.
   *
   * Low stock:
   * quantity <= reorder_level or low_stock_limit.
   */
  async function loadDashboardStats() {
    updateDashboardStats();
  
    setTextIfExists(
      "paidInvoices",
      "Manual"
    );
  
    if (
      typeof supabaseClient ===
      "undefined"
    ) {
      setTextIfExists(
        "inventoryCount",
        "—"
      );
  
      setTextIfExists(
        "lowStockCount",
        "—"
      );
  
      return;
    }
  
    const { data, error } =
      await supabaseClient
        .from("inventory_items")
        .select(`
          id,
          quantity,
          reorder_level,
          low_stock_limit,
          is_active
        `);
  
    if (error) {
      console.error(
        "Dashboard inventory statistics failed:",
        error.message
      );
  
      setTextIfExists(
        "inventoryCount",
        "—"
      );
  
      setTextIfExists(
        "lowStockCount",
        "—"
      );
  
      return;
    }
  
    const activeItems =
      (data || []).filter((item) => {
        return (
          item.is_active !==
          false
        );
      });
  
    const lowStockItems =
      activeItems.filter((item) => {
        const quantity =
          Number(
            item.quantity ||
            0
          );
  
        const reorderLevel =
          Number(
            item.reorder_level ??
            item.low_stock_limit ??
            0
          );
  
        return (
          quantity <=
          reorderLevel
        );
      });
  
    setTextIfExists(
      "inventoryCount",
      activeItems.length
    );
  
    setTextIfExists(
      "lowStockCount",
      lowStockItems.length
    );
  }
  
  
  /* =========================================================
     8. GLOBAL EXPORTS
     ========================================================= */
  
  window.applyAdminProfileUI =
    applyAdminProfileUI;
  
  window.applyRoleUI =
    applyRoleUI;
  
  window.showAdminSection =
    showAdminSection;
  
  window.showFirstAllowedSection =
    showFirstAllowedSection;
  
  window.updateDashboardStats =
    updateDashboardStats;
  
  window.loadDashboardStats =
    loadDashboardStats;