/* =========================================================
   ADMIN WORKSPACE COMPONENT
   File: js/ui/admin-workspace.js

   Purpose:
   Creates reusable enterprise workspace HTML.

   Layout:
   1. Workspace header
   2. Shared context area
   3. Optional toolbar
   4. Tabs
   5. Active tab panel

   The context area is used for shared content such as:
   - Breadcrumbs
   - Archive actions
   - Delete actions
   - Request identity
   ========================================================= */


/* =========================================================
   1. SAFE WORKSPACE DOM ID
   ========================================================= */

   function workspaceDomId(value) {
    return String(value || "workspace")
      .replace(/[^a-zA-Z0-9_-]/g, "-");
  }
  
  
  /* =========================================================
     2. WORKSPACE HEADER
     ========================================================= */
  
  function renderWorkspaceHeader(config = {}) {
    return `
      <div class="workspace-header">
        <div class="workspace-header-copy">
          <p class="workspace-kicker">
            ${safeText(config.kicker || "Workspace")}
          </p>
  
          <h2 class="workspace-title">
            ${safeText(config.title || "Untitled Workspace")}
          </h2>
  
          ${
            config.subtitle
              ? `
                <p class="workspace-subtitle">
                  ${safeText(config.subtitle)}
                </p>
              `
              : ""
          }
        </div>
  
        ${
          config.actions
            ? `
              <div class="workspace-actions">
                ${config.actions}
              </div>
            `
            : ""
        }
      </div>
    `;
  }
  
  
  /* =========================================================
     3. WORKSPACE TABS
     ========================================================= */
  
  function renderWorkspaceTabs(tabs = [], moduleName = "workspace") {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return "";
    }
  
    const safeModuleName = workspaceDomId(moduleName);
  
    return `
      <div
        class="workspace-tabs"
        role="tablist"
        aria-label="Workspace sections"
      >
        ${tabs.map((tab, index) => {
          const safeTabId = workspaceDomId(tab.id);
          const buttonId =
            `${safeModuleName}-tab-${safeTabId}`;
  
          const panelId =
            `${safeModuleName}-panel-${safeTabId}`;
  
          return `
            <button
              type="button"
              id="${buttonId}"
              class="workspace-tab-btn ${
                index === 0 ? "active" : ""
              }"
              data-tab="${safeText(tab.id)}"
              role="tab"
              aria-selected="${index === 0 ? "true" : "false"}"
              aria-controls="${panelId}"
              tabindex="${index === 0 ? "0" : "-1"}"
            >
              ${safeText(tab.label)}
            </button>
          `;
        }).join("")}
      </div>
    `;
  }
  
  
  /* =========================================================
     4. WORKSPACE PANELS
     ========================================================= */
  
  function renderWorkspacePanels(
    tabs = [],
    moduleName = "workspace"
  ) {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return `
        <div class="workspace-panel active">
          ${
            typeof renderEmptyState === "function"
              ? renderEmptyState(
                  "No workspace content",
                  "This workspace does not have any panels yet."
                )
              : `
                <p class="workspace-empty">
                  No workspace content available.
                </p>
              `
          }
        </div>
      `;
    }
  
    const safeModuleName = workspaceDomId(moduleName);
  
    return tabs.map((tab, index) => {
      const safeTabId = workspaceDomId(tab.id);
  
      const buttonId =
        `${safeModuleName}-tab-${safeTabId}`;
  
      const panelId =
        `${safeModuleName}-panel-${safeTabId}`;
  
      return `
        <section
          id="${panelId}"
          class="workspace-panel ${
            index === 0 ? "active" : ""
          }"
          data-panel="${safeText(tab.id)}"
          role="tabpanel"
          aria-labelledby="${buttonId}"
          ${index === 0 ? "" : "hidden"}
        >
          ${tab.content || ""}
        </section>
      `;
    }).join("");
  }
  
  
  /* =========================================================
     5. COMPLETE WORKSPACE
     ========================================================= */
  
  function renderWorkspace(config = {}) {
    const tabs = Array.isArray(config.tabs)
      ? config.tabs
      : [];
  
    const moduleName =
      config.module || "workspace";
  
    /*
      config.context contains information shared by every tab.
  
      It is rendered only once rather than being repeated inside
      every individual tab panel.
    */
    const contextContent =
      config.context ||
      config.beforeTabs ||
      "";
  
    return `
      <div
        class="workspace-shell"
        data-workspace="${safeText(moduleName)}"
      >
        ${renderWorkspaceHeader(config)}
  
        ${
          contextContent
            ? `
              <div class="workspace-context">
                ${contextContent}
              </div>
            `
            : ""
        }
  
        ${
          config.toolbar
            ? `
              <div class="workspace-toolbar">
                ${config.toolbar}
              </div>
            `
            : ""
        }
  
        <div class="workspace-body">
          ${renderWorkspaceTabs(tabs, moduleName)}
  
          <div class="workspace-panels">
            ${renderWorkspacePanels(tabs, moduleName)}
          </div>
        </div>
      </div>
    `;
  }
  
  
  /* =========================================================
     6. INFORMATION CARD
     ========================================================= */
  
  function renderInfoCard(label, value) {
    return `
      <div class="workspace-info-card">
        <span>${safeText(label)}</span>
        <strong>${safeText(value, "-")}</strong>
      </div>
    `;
  }
  
  
  /* =========================================================
     7. INFORMATION GRID
     ========================================================= */
  
  function renderInfoGrid(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return typeof renderEmptyState === "function"
        ? renderEmptyState(
            "No information available",
            "There are no details to display."
          )
        : `
          <p class="workspace-empty">
            No information available.
          </p>
        `;
    }
  
    return `
      <div class="workspace-info-grid">
        ${items.map((item) => {
          return renderInfoCard(
            item.label,
            item.value
          );
        }).join("")}
      </div>
    `;
  }
  
  
  /* =========================================================
     8. GLOBAL EXPORTS
     ========================================================= */
  
  window.renderWorkspace = renderWorkspace;
  window.renderInfoCard = renderInfoCard;
  window.renderInfoGrid = renderInfoGrid;