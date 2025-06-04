document.addEventListener('DOMContentLoaded', () => {
  const expandableLinks = document.querySelectorAll('.expandable');
  let currentActiveGroup = null; // Replacing currentActiveGroups with a single variable
  let mouseInSubmenu = false;
    // Helper function to close submenu with delay
  const closeSubmenuWithDelay = (group) => {
    if (!mouseInSubmenu) {
      setTimeout(() => {
        if (!mouseInSubmenu) {
          const submenu = group.querySelector('.submenu');
          const link = group.querySelector('.expandable');
          if (submenu) {
            submenu.classList.remove('active');
            // Also close any nested submenus
            submenu.querySelectorAll('.submenu').forEach(nestedSubmenu => {
              nestedSubmenu.classList.remove('active');
              const nestedLink = nestedSubmenu.previousElementSibling;
              if (nestedLink) nestedLink.classList.remove('active');
            });
          }
          if (link) {
            link.classList.remove('active');
          }
          currentActiveGroup = null;
        }
      }, 100);
    }
  };

  expandableLinks.forEach(link => {
    const group = link.closest('.department-group, .department-subgroup');
    const submenu = group.querySelector('.submenu');

    // Handle mouse enter on the expandable link
    link.addEventListener('mouseenter', function() {
      // Only close unrelated expandables/submenus, not parent/child chains
      document.querySelectorAll('.expandable.active').forEach(activeLink => {
        if (activeLink !== link && !activeLink.contains(link) && !link.contains(activeLink)) {
          activeLink.classList.remove('active');
        }
      });
      document.querySelectorAll('.submenu.active').forEach(activeSubmenu => {
        if (activeSubmenu !== submenu && !activeSubmenu.contains(submenu) && !submenu.contains(activeSubmenu)) {
          activeSubmenu.classList.remove('active');
        }
      });
      link.classList.add('active');
      if (submenu) submenu.classList.add('active');
    });

    // Handle mouse leave from the expandable link
    link.addEventListener('mouseleave', function(e) {
      setTimeout(() => {
        const related = document.elementFromPoint(e.clientX, e.clientY);
        // Only close if not hovering a related submenu or parent
        if (!related || (!submenu.contains(related) && related !== link)) {
          link.classList.remove('active');
          if (submenu) submenu.classList.remove('active');
        }
      }, 100);
    });

    // Handle mouse enter/leave for submenu
    if (submenu) {
      submenu.addEventListener('mouseenter', function() {
        link.classList.add('active');
        submenu.classList.add('active');
      });
      submenu.addEventListener('mouseleave', function(e) {
        setTimeout(() => {
          const related = document.elementFromPoint(e.clientX, e.clientY);
          if (!related || (!submenu.contains(related) && related !== link)) {
            link.classList.remove('active');
            submenu.classList.remove('active');
          }
        }, 100);
      });
    }

    // Handle click events (especially for mobile)
    link.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.innerWidth <= 800) {
        if (currentActiveGroup && currentActiveGroup !== group) {
          const prevSubmenu = currentActiveGroup.querySelector('.submenu');
          const prevLink = currentActiveGroup.querySelector('.expandable');
          prevSubmenu.classList.remove('active');
          prevLink.classList.remove('active');
        }
        
        submenu.classList.toggle('active');
        link.classList.toggle('active');
        currentActiveGroup = submenu.classList.contains('active') ? group : null;
      }
    });
  });

  // Close submenu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.department-group') && currentActiveGroup) {
      const submenu = currentActiveGroup.querySelector('.submenu');
      const link = currentActiveGroup.querySelector('.expandable');
      submenu.classList.remove('active');
      link.classList.remove('active');
      currentActiveGroup = null;
    }
  });
});
