import { useEffect, useRef } from 'react';

export const useDialogScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Force scrollable state
    const makeScrollable = () => {
      scrollElement.style.overflowY = 'scroll';
      (scrollElement.style as any).webkitOverflowScrolling = 'touch';
      scrollElement.style.touchAction = 'pan-y';
      scrollElement.style.transform = 'translate3d(0, 0, 0)';
      
      // Ensure there's content to scroll
      if (scrollElement.scrollHeight <= scrollElement.clientHeight) {
        scrollElement.style.minHeight = `${scrollElement.clientHeight + 100}px`;
      }
    };

    // Prevent event blocking
    const preventEventBlocking = (e: Event) => {
      e.stopPropagation();
    };

    // Handle wheel events for desktop
    const handleWheel = (e: WheelEvent) => {
      const { deltaY } = e;
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      
      // Allow scrolling within the element
      if (
        (deltaY < 0 && scrollTop > 0) ||
        (deltaY > 0 && scrollTop < scrollHeight - clientHeight)
      ) {
        e.stopPropagation();
      }
    };

    // Handle touch events for mobile
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      
      // Allow scrolling within the element
      if (
        (deltaY < 0 && scrollTop > 0) ||
        (deltaY > 0 && scrollTop < scrollHeight - clientHeight)
      ) {
        e.stopPropagation();
      }
    };

    // Initialize
    makeScrollable();
    
    // Add event listeners
    scrollElement.addEventListener('wheel', handleWheel, { passive: false });
    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollElement.addEventListener('click', preventEventBlocking);
    scrollElement.addEventListener('mousedown', preventEventBlocking);

    // Observe content changes
    const observer = new MutationObserver(makeScrollable);
    observer.observe(scrollElement, { childList: true, subtree: true });

    return () => {
      scrollElement.removeEventListener('wheel', handleWheel);
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
      scrollElement.removeEventListener('click', preventEventBlocking);
      scrollElement.removeEventListener('mousedown', preventEventBlocking);
      observer.disconnect();
    };
  }, []);

  return scrollRef;
};