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
              <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                ${isLogin ? `<button type="button" id="auth-forgot-password" class="text-xs text-primary hover:text-purple-500 transition-colors">Forgot Password?</button>` : ''}
              </div>
              <input type="password" id="auth-password" required class="glass-input" placeholder="••••••••">
            </div>
            <button type="submit" id="auth-submit" class="w-full glass-button py-3 mt-4 bg-primary/80 hover:bg-primary text-white border-primary/50 text-lg">
              ${isLogin ? 'Sign In' : 'Sign Up'}
            </button>
            
            <div class="relative flex py-4 items-center">
              <div class="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
              <span class="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
              <div class="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
            </div>
            
            <button type="button" id="auth-google" class="w-full glass-button py-3 flex justify-center items-center gap-2 hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
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

    // Google Sign in listener
    const googleBtn = document.getElementById('auth-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = 'Signing in...';
        googleBtn.disabled = true;
        
        await window.handleGoogleLogin();
        
        googleBtn.innerHTML = originalText;
        googleBtn.disabled = false;
      });
    }

    // Forgot password listener
    const forgotPwdBtn = document.getElementById('auth-forgot-password');
    if (forgotPwdBtn) {
      forgotPwdBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('auth-email');
        const email = emailInput.value.trim();
        
        if (!email) {
          if (window.showToast) window.showToast('Please enter your email address first', 'error');
          else alert('Please enter your email address first');
          emailInput.focus();
          return;
        }

        const originalText = forgotPwdBtn.textContent;
        forgotPwdBtn.textContent = 'Sending...';
        forgotPwdBtn.disabled = true;
        
        await window.handleForgotPassword(email);
        
        forgotPwdBtn.textContent = originalText;
        forgotPwdBtn.disabled = false;
      });
    }
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
