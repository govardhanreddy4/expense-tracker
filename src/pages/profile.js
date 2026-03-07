import { currentUser } from '../utils/auth.js';
import { updatePassword } from 'firebase/auth';
import { showToast } from '../utils/toast.js';

export function renderProfile(container, data = null) {
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Guest User';
  const userEmail = currentUser?.email || 'guest@example.com';

  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="glass-card mb-6 flex flex-col items-center">
        <div class="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4 border-4 border-white/20 dark:border-white/5 shadow-inner">
          <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-1" id="profile-name">${userName}</h2>
        <p class="text-slate-500 dark:text-slate-400 mb-6" id="profile-email">${userEmail}</p>
        
        <div class="w-full grid grid-cols-2 gap-4 mt-2">
          <div class="glass border border-white/10 p-4 text-center">
            <p class="text-sm text-slate-500">Member Since</p>
            <p class="font-semibold text-slate-800 dark:text-white">${new Date().getFullYear()}</p>
          </div>
          <div class="glass border border-white/10 p-4 text-center">
            <p class="text-sm text-slate-500">Account Type</p>
            <p class="font-semibold text-primary">Free</p>
          </div>
        </div>
      </div>
      
      <div class="glass-card">
        <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Change Password</h3>
        <form id="change-password-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">New Password</label>
            <input type="password" required class="glass-input" id="profile-new-pwd" placeholder="••••••••">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input type="password" required class="glass-input" id="profile-confirm-pwd" placeholder="••••••••">
          </div>
          <button type="submit" id="pwd-submit" class="w-full glass-button py-3 mt-2 bg-primary/80 hover:bg-primary text-white border-primary/50">
            Update Password
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const np1 = document.getElementById('profile-new-pwd').value;
    const np2 = document.getElementById('profile-confirm-pwd').value;
    const btn = document.getElementById('pwd-submit');

    if (np1 !== np2) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!currentUser) {
      showToast('Mock: Password changed', 'success');
      document.getElementById('change-password-form').reset();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Updating...';

    try {
      await updatePassword(currentUser, np1);
      showToast('Password updated successfully', 'success');
      document.getElementById('change-password-form').reset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Password';
    }
  });
}
