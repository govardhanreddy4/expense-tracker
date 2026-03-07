import { subscribeToTransactions, deleteTransaction } from '../utils/firestore.js';
import { showToast } from '../utils/toast.js';

let unsubscribe = null;
let allTransactions = [];

export function renderTransactions(container, data = null) {
  container.innerHTML = `
    <div class="glass-card mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div class="relative w-full sm:w-64">
        <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" id="tx-search" placeholder="Search..." class="glass-input pl-10">
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button id="tx-export-btn" class="glass-button px-4 py-2 flex items-center justify-center text-sm font-medium gap-2 text-primary hover:text-purple-500 whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
        <select id="tx-type-filter" class="glass-input cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat pr-10">
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
    </div>
    
    <div class="glass-card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/5">
              <th class="p-4 font-semibold text-slate-700 dark:text-slate-300">Date & Desc</th>
              <th class="p-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
              <th class="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount</th>
              <th class="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody id="transactions-list">
            <tr><td colspan="4" class="p-8 text-center text-slate-500">Loading transactions...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (unsubscribe) unsubscribe();

  unsubscribe = subscribeToTransactions((transactions) => {
    allTransactions = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
    renderList();
  });

  // Filters & Export
  document.getElementById('tx-search').addEventListener('input', renderList);
  document.getElementById('tx-type-filter').addEventListener('change', renderList);
  document.getElementById('tx-export-btn').addEventListener('click', () => exportToCSV(allTransactions));
  
  // Expose delete to window as it's easier to call from inline HTML
  window.handleDeleteTx = async (id) => {
    if(confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        showToast('Transaction deleted', 'success');
      } catch (e) {
        showToast(e.message, 'error');
      }
    }
  };
}

function renderList() {
  const tbody = document.getElementById('transactions-list');
  if(!tbody) return;

  const searchTerm = document.getElementById('tx-search').value.toLowerCase();
  const typeFilter = document.getElementById('tx-type-filter').value;

  const filtered = allTransactions.filter(t => {
    const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm) || 
                          t.category.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-500">No transactions found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const isInc = t.type === 'income';
    const dateStr = new Date(t.date).toLocaleDateString();
    return `
      <tr class="border-b border-white/10 dark:border-white/5 hover:bg-white/5 dark:hover:bg-black/20 transition-colors">
        <td class="p-4">
          <div class="font-medium text-slate-800 dark:text-white">${t.description || t.category}</div>
          <div class="text-xs text-slate-500">${dateStr}</div>
        </td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 dark:bg-black/30 text-slate-700 dark:text-slate-300 border border-white/20 dark:border-white/5">
            ${t.category}
          </span>
        </td>
        <td class="p-4 text-right font-semibold ${isInc ? 'text-green-500' : 'text-slate-800 dark:text-white'}">
          ${isInc ? '+' : '-'}₹${parseFloat(t.amount).toFixed(2)}
        </td>
        <td class="p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button onclick="window.handleDeleteTx('${t.id}')" class="p-2 text-slate-400 hover:text-red-500 transition-colors glass-button bg-transparent border-none shadow-none rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function exportToCSV(transactions) {
  if (transactions.length === 0) {
    showToast('No data to export', 'error');
    return;
  }
  
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.category,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('Export successful', 'success');
}
