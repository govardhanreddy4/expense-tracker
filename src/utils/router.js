import { renderDashboard } from '../pages/dashboard.js';
import { renderTransactions } from '../pages/transactions.js';
import { renderAnalytics } from '../pages/analytics.js';
import { renderProfile } from '../pages/profile.js';
import { renderAuth } from '../pages/auth.js';

export function setupRouter() {
  const contentArea = document.getElementById('content-area');
  const pageTitle = document.getElementById('page-title');
  const navItems = document.querySelectorAll('.nav-item');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  const routes = {
    dashboard: { render: renderDashboard, title: 'Dashboard' },
    transactions: { render: renderTransactions, title: 'Transactions' },
    analytics: { render: renderAnalytics, title: 'Analytics' },
    profile: { render: renderProfile, title: 'Profile' },
    auth: { render: renderAuth, title: 'Login' },
  };

  function closeMobileMenu() {
    if (window.innerWidth < 768 && sidebar && overlay && !sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('absolute', 'z-50');
      overlay.classList.add('opacity-0');
      setTimeout(() => overlay.classList.add('hidden'), 300);
    }
  }

  function navigate(page, data = null) {
    if (!routes[page]) page = 'dashboard';
    
    // Update Title
    if (pageTitle) pageTitle.textContent = routes[page].title;

    // Update Nav Active State
    navItems.forEach(item => {
      if (item.dataset.page === page) {
        item.classList.add('bg-white/20', 'dark:bg-black/20');
      } else {
        item.classList.remove('bg-white/20', 'dark:bg-black/20');
      }
    });

    closeMobileMenu();

    // Render content
    if (contentArea) {
      contentArea.style.opacity = 0;
      setTimeout(() => {
        contentArea.innerHTML = '';
        routes[page].render(contentArea, data);
        contentArea.style.opacity = 1;
      }, 50);
    }
  }

  // Handle nav clicks
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(item.dataset.page);
    });
  });

  return { navigate };
}
