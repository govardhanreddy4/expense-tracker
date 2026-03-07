import { addTransaction } from '../utils/firestore.js';
import { showToast } from '../utils/toast.js';

export function openTransactionModal() {
  const container = document.getElementById('modal-container');
  const backdrop = document.getElementById('modal-backdrop');
  const content = document.getElementById('modal-content');
  
  if (!container) return;

  function closeModal() {
    backdrop.classList.remove('opacity-100');
    content.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
      container.classList.add('hidden');
      container.innerHTML = `<div id="modal-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-md opacity-0 transition-opacity"></div>
      <div id="modal-content" class="relative z-10 w-full max-w-md scale-95 opacity-0 transition-all duration-300"></div>`;
    }, 300);
  }

  // Inject Form UI
  content.innerHTML = `
    <div class="glass-card shadow-2xl relative">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mb-6">Add Transaction</h2>
      
      <form id="tx-form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 mb-2">
          <label class="cursor-pointer relative">
            <input type="radio" name="txType" value="expense" class="peer sr-only" checked>
            <div class="w-full text-center py-2 rounded-xl border border-white/20 glass-button peer-checked:bg-red-500/20 peer-checked:text-red-500 peer-checked:border-red-500/50 transition-all">Expense</div>
          </label>
          <label class="cursor-pointer relative">
            <input type="radio" name="txType" value="income" class="peer sr-only">
            <div class="w-full text-center py-2 rounded-xl border border-white/20 glass-button peer-checked:bg-green-500/20 peer-checked:text-green-500 peer-checked:border-green-500/50 transition-all">Income</div>
          </label>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
          <input type="number" id="tx-amount" step="0.01" required class="glass-input text-xl font-bold" placeholder="0.00">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select id="tx-category" required class="glass-input cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat pr-10">
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Salary">Salary</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input type="date" id="tx-date" required class="glass-input" value="${new Date().toISOString().split('T')[0]}">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
          <input type="text" id="tx-desc" class="glass-input" placeholder="What was this for?">
        </div>
        
        <button type="submit" id="tx-submit" class="w-full glass-button py-3 mt-6 bg-gradient-to-r from-primary/90 to-purple-500/90 hover:from-primary hover:to-purple-500 text-white border-0 shadow-lg text-lg font-medium">
          Save Transaction
        </button>
      </form>
    </div>
  `;

  // Show Modal
  container.classList.remove('hidden');
  // Need slight delay for CSS transitions
  requestAnimationFrame(() => {
    backdrop.classList.add('opacity-100');
    content.classList.add('scale-100', 'opacity-100');
  });

  // Events
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  
  // Auto-switch categories based on type
  const typeRadios = document.getElementsByName('txType');
  const catSelect = document.getElementById('tx-category');
  
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'income') {
        catSelect.innerHTML = `
          <option value="Salary">Salary</option>
          <option value="Freelance">Freelance</option>
          <option value="Investments">Investments</option>
          <option value="Gift">Gift</option>
          <option value="Other">Other</option>
        `;
      } else {
        catSelect.innerHTML = `
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Health">Health</option>
          <option value="Other">Other</option>
        `;
      }
    });
  });

  document.getElementById('tx-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('tx-submit');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const type = document.querySelector('input[name="txType"]:checked').value;
    const data = {
      type,
      amount: parseFloat(document.getElementById('tx-amount').value),
      category: document.getElementById('tx-category').value,
      date: document.getElementById('tx-date').value,
      description: document.getElementById('tx-desc').value
    };

    try {
      await addTransaction(data);
      showToast('Transaction added', 'success');
      closeModal();
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Save Transaction';
    }
  });
}
