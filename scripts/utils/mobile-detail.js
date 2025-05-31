/**
 * Mobile-friendly enhancements for the detail page
 */

document.addEventListener('DOMContentLoaded', function() {
  // For touch devices, make thumbnails scroll horizontally
  const thumbnailsContainer = document.querySelector('.product-thumbnails');
  
  if (thumbnailsContainer) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    thumbnailsContainer.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    thumbnailsContainer.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const touchDiff = touchStartX - touchEndX;
      // Scroll the container by the swipe distance
      thumbnailsContainer.scrollLeft += touchDiff;
    }
  }
  
  // Adjust image height for better mobile display
  function adjustImageHeight() {
    const imageContainer = document.querySelector('.product-main-image-container');
    const image = document.querySelector('.product-image');
    
    if (imageContainer && image) {
      // For mobile phones in portrait mode
      if (window.innerWidth < 600 && window.innerHeight > window.innerWidth) {
        const maxHeight = window.innerHeight * 0.45; // 45% of screen height
        image.style.maxHeight = `${maxHeight}px`;
      } else if (window.innerWidth < 900) {
        // For tablets or phones in landscape
        const maxHeight = window.innerHeight * 0.65; // 65% of screen height
        image.style.maxHeight = `${maxHeight}px`;
      } else {
        // For desktop
        image.style.maxHeight = '500px';
      }
    }
  }
  
  // Call once on load and on resize
  adjustImageHeight();
  window.addEventListener('resize', adjustImageHeight);
  window.addEventListener('orientationchange', adjustImageHeight);
  
  // Make thumbnails automatically scroll when clicking on arrows
  const leftArrow = document.querySelector('.js-thumbnail-arrow-left');
  const rightArrow = document.querySelector('.js-thumbnail-arrow-right');
  
  if (leftArrow && rightArrow && thumbnailsContainer) {
    const scrollAmount = 90; // Approximate width of thumbnail + margin
    
    leftArrow.addEventListener('click', function() {
      thumbnailsContainer.scrollLeft -= scrollAmount;
    });
    
    rightArrow.addEventListener('click', function() {
      thumbnailsContainer.scrollLeft += scrollAmount;
    });
  }
});
