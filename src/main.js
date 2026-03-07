import '../style.css';
import { setupTheme } from './utils/theme.js';
import { setupRouter } from './utils/router.js';
import { setupAuth } from './utils/auth.js';
import { openTransactionModal } from './components/transactionModal.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  const router = setupRouter();
  
  const fabAdd = document.getElementById('fab-add');
  if (fabAdd) {
    fabAdd.addEventListener('click', openTransactionModal);
  }
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  const toggleMenu = () => {
    sidebar.classList.toggle('hidden');
    sidebar.classList.toggle('absolute');
    sidebar.classList.toggle('z-50');
    overlay.classList.toggle('hidden');
    setTimeout(() => overlay.classList.toggle('opacity-0'), 10);
  };

  if (mobileMenuBtn && overlay) {
    mobileMenuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
  }

  // Set initial route & auth
  setupAuth(router);
});
