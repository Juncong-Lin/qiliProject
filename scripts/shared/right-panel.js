// Right Panel Functionality

// Function to scroll to top of the page
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Function to scroll to footer (contact section)
function scrollToFooter() {
  const footer = document.querySelector('.footer');
  if (footer) {
    footer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Show/hide right panel based on scroll position
function handleRightPanelVisibility() {
  const rightPanel = document.querySelector('.right-panel-fixed');
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (rightPanel) {
    // Show panel after scrolling down 200px
    if (scrollTop > 200) {
      rightPanel.style.opacity = '1';
      rightPanel.style.visibility = 'visible';
    } else {
      rightPanel.style.opacity = '0.7';
      rightPanel.style.visibility = 'visible';
    }
  }
}

// Initialize right panel functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add scroll event listener for panel visibility
  window.addEventListener('scroll', handleRightPanelVisibility);
  
  // Initial visibility check
  handleRightPanelVisibility();
});

// Export functions for global use
window.scrollToTop = scrollToTop;
window.scrollToFooter = scrollToFooter;
