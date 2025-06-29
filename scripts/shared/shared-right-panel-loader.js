// Right Panel Loader

// Function to load the right panel component
function loadRightPanel() {
  fetch('components/shared-right-panel.html')
    .then(response => response.text())
    .then(html => {
      // Create a placeholder div if it doesn't exist
      let placeholder = document.getElementById('shared-right-panel-placeholder');
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.id = 'shared-right-panel-placeholder';
        document.body.appendChild(placeholder);
      }
      
      // Insert the right panel HTML
      placeholder.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading right panel:', error);
    });
}

// Load the right panel when DOM is ready
document.addEventListener('DOMContentLoaded', loadRightPanel);
