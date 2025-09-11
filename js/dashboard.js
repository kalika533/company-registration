// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard loaded successfully');
  
  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('.companies-table tbody tr');
      
      rows.forEach(row => {
        const companyName = row.querySelector('td:first-child').textContent.toLowerCase();
        if (companyName.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  
  // Action buttons functionality
  const actionButtons = document.querySelectorAll('.btn-icon');
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const title = this.getAttribute('title');
      const companyName = this.closest('tr').querySelector('td:first-child').textContent;
      
      switch(title) {
        case 'View':
          alert(`View details for ${companyName}`);
          break;
        case 'Edit':
          alert(`Edit details for ${companyName}`);
          break;
        case 'Delete':
          if (confirm(`Are you sure you want to delete ${companyName}?`)) {
            alert(`${companyName} has been deleted.`);
          }
          break;
      }
    });
  });
  
  // Toggle mobile menu
  const setupMobileMenu = () => {
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    mobileMenuButton.classList.add('mobile-menu-toggle');
    mobileMenuButton.style.display = 'none';
    
    const sidebar = document.querySelector('.sidebar');
    document.querySelector('.sidebar-header').prepend(mobileMenuButton);
    
    mobileMenuButton.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
    
    // Check if mobile view
    const checkMobileView = () => {
      if (window.innerWidth <= 768) {
        mobileMenuButton.style.display = 'block';
        sidebar.classList.remove('mobile-open');
      } else {
        mobileMenuButton.style.display = 'none';
        sidebar.classList.remove('mobile-open');
      }
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
  };
  
  setupMobileMenu();
  
  // Simulate loading data
  setTimeout(() => {
    console.log('Data loaded successfully');
    // In a real application, you would update the DOM with fetched data here
  }, 1000);
});