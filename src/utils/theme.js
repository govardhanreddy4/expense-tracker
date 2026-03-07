export function setupTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  const isDark = localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const applyTheme = (dark) => {
    if (dark) {
      document.body.classList.add('dark');
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
      localStorage.setItem('theme', 'light');
    }
  };

  applyTheme(isDark);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyDark = document.body.classList.contains('dark');
      applyTheme(!isCurrentlyDark);
    });
  }
}
