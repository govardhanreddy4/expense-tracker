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

  const resetBtn = document.getElementById('reset-btn');
  const editBtn = document.getElementById('edit-btn');
  const dineshBtn = document.getElementById('dinesh-btn');

  if (resetBtn) resetBtn.addEventListener('click', () => alert('Reset button clicked!'));
  if (editBtn) editBtn.addEventListener('click', () => alert('Edit button clicked!'));
  if (dineshBtn) dineshBtn.addEventListener('click', () => alert('Dinesh button clicked!'));

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});
