/* =========================================================
   ADMIN TABS COMPONENT
   File: js/ui/admin-tabs.js

   Purpose:
   Reusable accessible enterprise tab controller.

   Features:
   - Permanent active-tab styling.
   - Proper ARIA state.
   - Keyboard navigation.
   - Left and right arrow navigation.
   - Home and End key support.
   - Removes accidental browser text selection.
   ========================================================= */


/* =========================================================
   1. CLEAR ACCIDENTAL TEXT SELECTION
   ========================================================= */

   function clearWorkspaceTextSelection() {
    const selection = window.getSelection
      ? window.getSelection()
      : null;
  
    if (selection && selection.removeAllRanges) {
      selection.removeAllRanges();
    }
  }
  
  
  /* =========================================================
     2. ACTIVATE ONE TAB
     ========================================================= */
  
  function activateWorkspaceTab(
    workspaceElement,
    tabName,
    options = {}
  ) {
    if (!workspaceElement || !tabName) {
      return;
    }
  
    const {
      focusTab = false
    } = options;
  
    const buttons = Array.from(
      workspaceElement.querySelectorAll(
        ".workspace-tab-btn"
      )
    );
  
    const panels = Array.from(
      workspaceElement.querySelectorAll(
        ".workspace-panel"
      )
    );
  
    let activeButton = null;
  
    buttons.forEach((button) => {
      const isActive =
        button.dataset.tab === tabName;
  
      button.classList.toggle(
        "active",
        isActive
      );
  
      button.setAttribute(
        "aria-selected",
        isActive ? "true" : "false"
      );
  
      button.tabIndex = isActive ? 0 : -1;
  
      if (isActive) {
        activeButton = button;
      }
    });
  
    panels.forEach((panel) => {
      const isActive =
        panel.dataset.panel === tabName;
  
      panel.classList.toggle(
        "active",
        isActive
      );
  
      panel.hidden = !isActive;
    });
  
    clearWorkspaceTextSelection();
  
    if (focusTab && activeButton) {
      activeButton.focus({
        preventScroll: true
      });
    }
  }
  
  
  /* =========================================================
     3. INITIALIZE ACTIVE TAB
     ========================================================= */
  
  function initializeWorkspaceTabs(workspaceElement) {
    if (!workspaceElement) {
      return;
    }
  
    const existingActiveButton =
      workspaceElement.querySelector(
        ".workspace-tab-btn.active"
      );
  
    const firstButton =
      workspaceElement.querySelector(
        ".workspace-tab-btn"
      );
  
    const startingButton =
      existingActiveButton || firstButton;
  
    if (!startingButton) {
      return;
    }
  
    activateWorkspaceTab(
      workspaceElement,
      startingButton.dataset.tab
    );
  }
  
  
  /* =========================================================
     4. KEYBOARD NAVIGATION
     ========================================================= */
  
  function handleWorkspaceTabKeyboard(
    event,
    workspaceElement,
    currentButton
  ) {
    const buttons = Array.from(
      workspaceElement.querySelectorAll(
        ".workspace-tab-btn"
      )
    );
  
    if (buttons.length === 0) {
      return;
    }
  
    const currentIndex =
      buttons.indexOf(currentButton);
  
    let nextIndex = currentIndex;
  
    switch (event.key) {
      case "ArrowRight":
        nextIndex =
          (currentIndex + 1) % buttons.length;
        break;
  
      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + buttons.length) %
          buttons.length;
        break;
  
      case "Home":
        nextIndex = 0;
        break;
  
      case "End":
        nextIndex = buttons.length - 1;
        break;
  
      default:
        return;
    }
  
    event.preventDefault();
  
    const nextButton = buttons[nextIndex];
  
    activateWorkspaceTab(
      workspaceElement,
      nextButton.dataset.tab,
      {
        focusTab: true
      }
    );
  }
  
  
  /* =========================================================
     5. BIND TAB EVENTS
     ========================================================= */
  
  function bindWorkspaceTabs(scope = document) {
    scope
      .querySelectorAll(".workspace-shell")
      .forEach((workspaceElement) => {
        if (
          workspaceElement.dataset.tabsBound ===
          "true"
        ) {
          return;
        }
  
        workspaceElement.dataset.tabsBound = "true";
  
        initializeWorkspaceTabs(
          workspaceElement
        );
  
        workspaceElement
          .querySelectorAll(".workspace-tab-btn")
          .forEach((button) => {
            button.addEventListener(
              "click",
              function () {
                activateWorkspaceTab(
                  workspaceElement,
                  button.dataset.tab
                );
              }
            );
  
            button.addEventListener(
              "keydown",
              function (event) {
                handleWorkspaceTabKeyboard(
                  event,
                  workspaceElement,
                  button
                );
              }
            );
          });
      });
  }
  
  
  /* =========================================================
     6. GLOBAL EXPORTS
     ========================================================= */
  
  window.activateWorkspaceTab =
    activateWorkspaceTab;
  
  window.bindWorkspaceTabs =
    bindWorkspaceTabs;