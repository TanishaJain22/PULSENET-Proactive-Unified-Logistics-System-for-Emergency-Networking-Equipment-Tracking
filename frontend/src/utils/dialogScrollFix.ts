// Global dialog scroll fix
export const initializeDialogScrollFix = () => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDialogScrolling);
  } else {
    setupDialogScrolling();
  }
};

const setupDialogScrolling = () => {
  // Create a MutationObserver to watch for new dialogs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if this is a dialog or contains dialog content
          const dialogContent = element.querySelector('[data-radix-dialog-content]') || 
                               (element.hasAttribute('data-radix-dialog-content') ? element : null);
          
          if (dialogContent) {
            setupDialogScrollBehavior(dialogContent as HTMLElement);
          }
          
          // Also check for sheet content
          const sheetContent = element.querySelector('[data-radix-sheet-content]') || 
                              (element.hasAttribute('data-radix-sheet-content') ? element : null);
          
          if (sheetContent) {
            setupDialogScrollBehavior(sheetContent as HTMLElement);
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also fix any existing dialogs
  document.querySelectorAll('[data-radix-dialog-content], [data-radix-sheet-content]').forEach((dialog) => {
    setupDialogScrollBehavior(dialog as HTMLElement);
  });
};

const setupDialogScrollBehavior = (dialogElement: HTMLElement) => {
  // Find scrollable areas within the dialog
  const scrollableAreas = dialogElement.querySelectorAll('.dialog-scroll, .force-scroll');
  
  scrollableAreas.forEach((scrollArea) => {
    const element = scrollArea as HTMLElement;
    
    // Ensure proper scrolling styles
    element.style.overflowY = 'scroll';
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.touchAction = 'pan-y';
    element.style.transform = 'translate3d(0, 0, 0)';
    
    // Remove existing event listeners to avoid duplicates
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('wheel', handleWheel);
    
    // Add event listeners for proper scrolling
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    // Ensure minimum content for scrolling
    const ensureScrollableContent = () => {
      if (element.scrollHeight <= element.clientHeight) {
        const spacer = document.createElement('div');
        spacer.style.height = '1px';
        spacer.style.visibility = 'hidden';
        spacer.className = 'scroll-spacer';
        element.appendChild(spacer);
      }
    };
    
    // Initial setup
    setTimeout(ensureScrollableContent, 100);
    
    // Watch for content changes
    const contentObserver = new MutationObserver(ensureScrollableContent);
    contentObserver.observe(element, { childList: true, subtree: true });
  });
};

let startY = 0;

const handleTouchStart = (e: TouchEvent) => {
  startY = e.touches[0].clientY;
  e.stopPropagation();
};

const handleTouchMove = (e: TouchEvent) => {
  const element = e.currentTarget as HTMLElement;
  const currentY = e.touches[0].clientY;
  const deltaY = startY - currentY;
  const { scrollTop, scrollHeight, clientHeight } = element;
  
  // Allow scrolling within bounds
  if (
    (deltaY < 0 && scrollTop > 0) ||
    (deltaY > 0 && scrollTop < scrollHeight - clientHeight)
  ) {
    e.stopPropagation();
  } else {
    // At scroll boundary, prevent default to avoid page scroll
    e.preventDefault();
  }
};

const handleWheel = (e: WheelEvent) => {
  const element = e.currentTarget as HTMLElement;
  const { deltaY } = e;
  const { scrollTop, scrollHeight, clientHeight } = element;
  
  // Allow scrolling within bounds
  if (
    (deltaY < 0 && scrollTop > 0) ||
    (deltaY > 0 && scrollTop < scrollHeight - clientHeight)
  ) {
    e.stopPropagation();
  } else {
    // At scroll boundary, prevent default to avoid page scroll
    e.preventDefault();
  }
};