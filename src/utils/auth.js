import { auth } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';
import { showToast } from './toast.js';

export let currentUser = null;

export function setupAuth(router) {
  const authContainer = document.getElementById('auth-container');
  const sidebar = document.getElementById('sidebar');
  const mainContentNav = document.querySelector('main header');
  const fabAdd = document.getElementById('fab-add');
  const logoutBtn = document.getElementById('logout-btn');

  // Listen to Auth State
  if (auth) {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      
      if (user) {
        // Logged In
        document.getElementById('user-greeting').textContent = 'Hi, ' + (user.displayName || user.email.split('@')[0]);
        
        // Hide auth, show app UI
        if(authContainer) authContainer.classList.add('hidden');
        if(sidebar) {
          sidebar.classList.remove('hidden');
          sidebar.classList.add('md:flex'); // Restore original md:flex
        }
        if(mainContentNav) mainContentNav.classList.remove('hidden');
        if(fabAdd) fabAdd.classList.remove('hidden');
        
        router.navigate('dashboard');
      } else {
        // Logged Out
        if(authContainer) authContainer.classList.remove('hidden');
        if(sidebar) {
          sidebar.classList.add('hidden');
          sidebar.classList.remove('md:flex');
        }
        if(mainContentNav) mainContentNav.classList.add('hidden');
        if(fabAdd) fabAdd.classList.add('hidden');
        
        router.navigate('auth');
      }
    });

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await signOut(auth);
          showToast('Logged out successfully', 'success');
        } catch (error) {
          showToast(error.message, 'error');
        }
      });
    }
  } else {
    // MOCK BEHAVIOR IF FIREBASE IS NOT CONFIGURED
    console.log("Using mock Auth behavior");
    if(authContainer) authContainer.classList.add('hidden');
    if(sidebar) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('md:flex');
    }
    if(mainContentNav) mainContentNav.classList.remove('hidden');
    if(fabAdd) mainContentNav.classList.remove('hidden');
    router.navigate('dashboard');
  }
}

// Attach these to window so auth.js page can use them since it is rendered dynamically
window.handleLogin = async (email, password) => {
  if (!auth) { showToast('Mock login success', 'success'); return true; }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Logged in successfully', 'success');
    return true;
  } catch (error) {
    showToast(error.message, 'error');
    return false;
  }
};

window.handleSignup = async (email, password) => {
  if (!auth) { showToast('Mock signup success', 'success'); return true; }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast('Account created successfully', 'success');
    return true;
  } catch (error) {
    showToast(error.message, 'error');
    return false;
  }
};
