/* =========================================================
   ADMIN ENTERPRISE COMPONENT LIBRARY
   File: js/ui/admin-components.js
========================================================= */

function renderBreadcrumbs(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return `
    <div class="admin-breadcrumbs">
      ${items.map((item, index) => {
        const isLast = index === items.length - 1;

        return `
          ${isLast
            ? `<strong>${safeText(item.label)}</strong>`
            : `<span>${safeText(item.label)}</span>`
          }
          ${!isLast ? `<span class="admin-breadcrumb-separator">›</span>` : ""}
        `;
      }).join("")}
    </div>
  `;
}

function renderActionToolbar(config = {}) {
  return `
    <div class="admin-action-toolbar">
      <div class="admin-action-toolbar-left">
        ${config.title ? `<span class="admin-action-toolbar-title">${safeText(config.title)}</span>` : ""}
        ${config.left || ""}
      </div>

      <div class="admin-action-toolbar-right">
        ${config.right || ""}
      </div>
    </div>
  `;
}

function ensureToastContainer() {
  let container = document.getElementById("adminToastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "adminToastContainer";
    container.className = "admin-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");

    document.body.appendChild(container);
  }

  return container;
}

function showToast(type = "success", title = "Success", message = "") {
  const container = ensureToastContainer();

  const normalizedType = String(type || "success").toLowerCase();

  const supportedTypes = [
    "success",
    "error",
    "warning",
    "danger",
    "info"
  ];

  const safeType = supportedTypes.includes(normalizedType)
    ? normalizedType
    : "info";

  /*
    Existing modules sometimes use "danger", while the notification
    styles use "error". Both values remain supported.
  */
  const visualType = safeType === "danger"
    ? "error"
    : safeType;

  const toast = document.createElement("div");

  /*
    Both class formats are deliberately included:

    1. admin-toast-success
       Supports the existing admin.css notification styles.

    2. success
       Preserves compatibility with any newer modular component CSS.
  */
  toast.className =
    `admin-toast admin-toast-${visualType} ${visualType}`;

  toast.setAttribute("role", visualType === "error" ? "alert" : "status");

  toast.innerHTML = `
    <strong>${safeText(title)}</strong>
    <p>${safeText(message)}</p>
  `;

  container.appendChild(toast);

  /*
    The browser must first render the hidden state before the
    "show" class is added. requestAnimationFrame provides that
    rendering boundary more reliably than an immediate class change.
  */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  });

  const removeToast = () => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();

      if (
        container.childElementCount === 0 &&
        document.body.contains(container)
      ) {
        container.remove();
      }
    }, 300);
  };

  const removalTimer = setTimeout(removeToast, 4200);

  toast.addEventListener("click", function () {
    clearTimeout(removalTimer);
    removeToast();
  });
}

function renderEmptyState(title = "No records found", message = "There is nothing to show yet.") {
  return `
    <div class="admin-empty-state">
      <strong>${safeText(title)}</strong>
      <p>${safeText(message)}</p>
    </div>
  `;
}

function renderLoadingState(message = "Loading...") {
  return `
    <div class="admin-loading-state">
      <div class="admin-loading-spinner"></div>
      <strong>${safeText(message)}</strong>
    </div>
  `;
}

function openSlidePanel(config = {}) {
  closeSlidePanel();

  const backdrop = document.createElement("div");
  backdrop.id = "adminSlidePanelBackdrop";
  backdrop.className = "admin-slide-backdrop";

  backdrop.innerHTML = `
    <aside class="admin-slide-panel">
      <div class="admin-slide-header">
        <div>
          <h3>${safeText(config.title || "Panel")}</h3>
          ${config.subtitle ? `<p>${safeText(config.subtitle)}</p>` : ""}
        </div>

        <button class="admin-slide-close" type="button" onclick="closeSlidePanel()">×</button>
      </div>

      <div class="admin-slide-body">
        ${config.content || ""}
      </div>
    </aside>
  `;

  document.body.appendChild(backdrop);
}

function closeSlidePanel() {
  const existing = document.getElementById("adminSlidePanelBackdrop");
  if (existing) existing.remove();
}

/* =========================================================
   MODAL FRAMEWORK
========================================================= */

function openAdminModal(config = {}) {
  closeAdminModal();

  const backdrop = document.createElement("div");
  backdrop.id = "adminModalBackdrop";
  backdrop.className = "admin-modal-backdrop";

  backdrop.innerHTML = `
    <div class="admin-modal-box" id="adminModalBox">
      <div class="admin-modal-header" id="adminModalDragHandle">
        <div>
          <h3>${safeText(config.title || "Modal")}</h3>
          ${config.subtitle ? `<p>${safeText(config.subtitle)}</p>` : ""}
        </div>

        <button class="admin-modal-close" type="button" onclick="closeAdminModal()">×</button>
      </div>

      <div class="admin-modal-body">
        ${config.content || ""}
      </div>

      ${config.footer ? `
        <div class="admin-modal-footer">
          ${config.footer}
        </div>
      ` : ""}
    </div>
  `;

  document.body.appendChild(backdrop);

  const modal = document.getElementById("adminModalBox");

  modal.style.position = "fixed";
  modal.style.width = config.width || "760px";
  modal.style.height = config.height || "650px";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";

  enableAdminModalDrag();
}

function closeAdminModal() {
  const existing = document.getElementById("adminModalBackdrop");
  if (existing) existing.remove();
}

function enableAdminModalDrag() {
  const modal = document.getElementById("adminModalBox");
  const handle = document.getElementById("adminModalDragHandle");

  if (!modal || !handle) return;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button, input, textarea, select, option")) return;

    dragging = true;

    const rect = modal.getBoundingClientRect();

    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    modal.style.transform = "none";
    modal.style.left = `${startLeft}px`;
    modal.style.top = `${startTop}px`;

    modal.classList.add("is-dragging");
    document.body.style.userSelect = "none";

    handle.setPointerCapture(event.pointerId);

    event.preventDefault();
    event.stopPropagation();
  });

  handle.addEventListener("pointermove", function (event) {
    if (!dragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    const maxLeft = window.innerWidth - modal.offsetWidth - 12;
    const maxTop = window.innerHeight - modal.offsetHeight - 12;

    modal.style.left = `${Math.max(12, Math.min(startLeft + dx, maxLeft))}px`;
    modal.style.top = `${Math.max(12, Math.min(startTop + dy, maxTop))}px`;

    event.preventDefault();
  });

  handle.addEventListener("pointerup", function (event) {
    dragging = false;
    modal.classList.remove("is-dragging");
    document.body.style.userSelect = "";

    try {
      handle.releasePointerCapture(event.pointerId);
    } catch (error) {}
  });
}

/* =========================================================
   CONTEXT MENU
========================================================= */

function openContextMenu(event, actions = []) {
  event.preventDefault();
  closeContextMenu();

  const menu = document.createElement("div");
  menu.id = "adminContextMenu";
  menu.className = "admin-context-menu";

  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;

  menu.innerHTML = actions.map((action) => `
    <button
      type="button"
      class="${action.danger ? "danger" : ""}"
      onclick="${action.onClick}"
    >
      ${safeText(action.label)}
    </button>
  `).join("");

  document.body.appendChild(menu);
}

function closeContextMenu() {
  const existing = document.getElementById("adminContextMenu");
  if (existing) existing.remove();
}

document.addEventListener("click", function () {
  closeContextMenu();
});