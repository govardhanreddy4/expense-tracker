export function renderAuth(container, data = null) {
  const authContainer = document.getElementById('auth-container');
  if (!authContainer) return;
  
  let isLogin = true;

  function renderInner() {
    authContainer.innerHTML = `
      <div class="glass-card w-full max-w-md relative overflow-hidden backdrop-blur-2xl transition-all duration-300">
        <div class="absolute -right-20 -top-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
        <div class="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mb-2">Expensify</h1>
            <p class="text-slate-500 dark:text-slate-400">${isLogin ? 'Sign in to manage your expenses' : 'Create an account to get started'}</p>
          </div>
          
          <form id="auth-form" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" id="auth-email" required class="glass-input" placeholder="you@example.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input type="password" id="auth-password" required class="glass-input" placeholder="••••••••">
            </div>
            <button type="submit" id="auth-submit" class="w-full glass-button py-3 mt-4 bg-primary/80 hover:bg-primary text-white border-primary/50 text-lg">
              ${isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-slate-500 dark:text-slate-400 text-sm">
              <span id="auth-toggle-text">${isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button id="auth-toggle-btn" class="text-primary hover:text-purple-500 font-medium ml-1 transition-colors">
                ${isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    `;

    // Attach listeners
    document.getElementById('auth-toggle-btn').addEventListener('click', () => {
      isLogin = !isLogin;
      renderInner();
    });

    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const pwd = document.getElementById('auth-password').value;
      const btn = document.getElementById('auth-submit');
      
      const originalText = btn.textContent;
      btn.textContent = 'Please wait...';
      btn.disabled = true;

      let success = false;
      if (isLogin) {
        success = await window.handleLogin(email, pwd);
      } else {
        success = await window.handleSignup(email, pwd);
      }

      if (!success) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  renderInner();
  
  // Hide main layout UI when on auth view
  const sidebar = document.getElementById('sidebar');
  const mainContentNav = document.querySelector('main header');
  const fabAdd = document.getElementById('fab-add');
  if (sidebar) sidebar.style.display = 'none';
  if (mainContentNav) mainContentNav.style.display = 'none';
  if (fabAdd) fabAdd.style.display = 'none';
}
