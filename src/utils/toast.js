export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  
  // Base glassmorphism style for toast
  let bgColorClass = 'bg-slate-800/80 dark:bg-slate-700/80 border-slate-600';
  let iconHtml = '<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  
  if (type === 'success') {
    bgColorClass = 'bg-primary/90 dark:bg-primary/80 border-primary/50';
    iconHtml = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
  } else if (type === 'error') {
    bgColorClass = 'bg-red-500/90 dark:bg-red-500/80 border-red-500/50';
    iconHtml = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  }

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border shadow-lg text-white transform translate-x-full opacity-0 transition-all duration-300 ${bgColorClass}`;
  
  toast.innerHTML = `
    ${iconHtml}
    <p class="text-sm font-medium">${message}</p>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
