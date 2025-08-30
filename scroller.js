// Blaze Restaurant - Scroller
// Define scrollers in a self-executing function to avoid global variable conflicts
(function() {
  // Find all scroller elements
  const scrollers = document.querySelectorAll(".scroller");

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addAnimation();
  }

  function addAnimation() {
    scrollers.forEach(scroller => {
      scroller.setAttribute("data-animated", true);
      
      // Check if scroller__inner exists, if not create it
      let scrollerInner = scroller.querySelector(".scroller__inner");
      if (!scrollerInner) {
        // Move the content into a scroller__inner div
        scrollerInner = document.createElement("div");
        scrollerInner.classList.add("scroller__inner");
        
        // Move all children into the inner container
        while (scroller.firstChild) {
          scrollerInner.appendChild(scroller.firstChild);
        }
        
        scroller.appendChild(scrollerInner);
      }
      
      // Clone the content for continuous scrolling effect
      const scrollerContent = Array.from(scrollerInner.children);
      scrollerContent.forEach(item => {
        const duplicatedItem = item.cloneNode(true);
        scrollerInner.appendChild(duplicatedItem);
      });
    });
  }
})();