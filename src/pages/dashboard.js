import { subscribeToTransactions } from '../utils/firestore.js';
import { showToast } from '../utils/toast.js';
import Chart from 'chart.js/auto';

let unsubscribe = null;
let currentChart = null;

export function renderDashboard(container, data = null) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total Balance -->
      <div class="glass-card relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500"></div>
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Balance</h3>
        <p class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 truncate" id="dashboard-balance">₹0.00</p>
      </div>
      
      <!-- Income -->
      <div class="glass-card relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all duration-500"></div>
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Income</h3>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400 truncate" id="dashboard-income">+₹0.00</p>
      </div>
      
      <!-- Expenses -->
      <div class="glass-card relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl group-hover:bg-red-500/30 transition-all duration-500"></div>
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses</h3>
        <p class="text-2xl font-bold text-red-500 dark:text-red-400 truncate" id="dashboard-expenses">-₹0.00</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Widget -->
      <div class="glass-card lg:col-span-2">
        <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Expense Categories</h3>
        <div class="w-full h-64 relative flex items-center justify-center">
           <canvas id="dashboard-chart"></canvas>
        </div>
      </div>
      
      <!-- Recent Transactions -->
      <div class="glass-card flex flex-col h-auto max-h-[400px]">
        <div class="flex items-center justify-between mb-4 shrink-0">
          <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Recent</h3>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3" id="dashboard-recent-tx">
          <div class="text-center text-slate-500 py-4 text-sm">Loading...</div>
        </div>
      </div>
    </div>
  `;

  if (unsubscribe) unsubscribe();

  unsubscribe = subscribeToTransactions((transactions) => {
    updateDashboardUI(transactions);
  });
}

function updateDashboardUI(transactions) {
  let income = 0;
  let expense = 0;

  const recentContainer = document.getElementById('dashboard-recent-tx');
  
  // Sort by date desc
  const sorted = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));

  // Compute Totals
  const categoryTotals = {};
  
  transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === 'income') {
      income += amt;
    } else {
      expense += amt;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
    }
  });

  const balance = income - expense;

  const balanceEl = document.getElementById('dashboard-balance');
  const incomeEl = document.getElementById('dashboard-income');
  const expEl = document.getElementById('dashboard-expenses');

  if(balanceEl) balanceEl.textContent = `₹${balance.toFixed(2)}`;
  if(incomeEl) incomeEl.textContent = `+₹${income.toFixed(2)}`;
  if(expEl) expEl.textContent = `-₹${expense.toFixed(2)}`;

  // Budget Limit Alert logic
  const BUDGET_LIMIT = 1000;
  if (expense > BUDGET_LIMIT) {
    // Only alert once per session normally, but for simplicity we show toast if over limit
    if (!window.budgetAlertShown) {
      showToast(`Warning: Monthly expense exceeds ₹${BUDGET_LIMIT} budget!`, 'warning');
      window.budgetAlertShown = true;
    }
  }

  // Render Recent TX
  if (recentContainer) {
    if (sorted.length === 0) {
      recentContainer.innerHTML = '<div class="text-center text-slate-500 py-4 text-sm">No recent transactions</div>';
    } else {
      recentContainer.innerHTML = sorted.slice(0, 5).map(t => {
        const isInc = t.type === 'income';
        const dateObj = new Date(t.date);
        const dateStr = dateObj.toLocaleDateString();
        return `
          <div class="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-black/5 border border-white/10">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isInc ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isInc ? 'M12 4v16m8-8H4' : 'M20 12H4'}"></path>
                </svg>
              </div>
              <div class="truncate">
                <p class="font-medium text-slate-800 dark:text-white text-sm truncate">${t.description || t.category}</p>
                <p class="text-xs text-slate-500">${dateStr}</p>
              </div>
            </div>
            <div class="font-semibold ${isInc ? 'text-green-500' : 'text-slate-800 dark:text-white'}">
              ${isInc ? '+' : '-'}₹${parseFloat(t.amount).toFixed(2)}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Update Chart
  const ctx = document.getElementById('dashboard-chart');
  if (ctx) {
    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#cbd5e1' : '#475569';
    
    if (currentChart) {
      currentChart.destroy();
    }

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (data.length === 0) {
      labels.push('No Data');
      data.push(1); // placeholder slice
    }

    currentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#4F46E5', '#22C55E', '#EAB308', '#EF4444', 
            '#A855F7', '#F97316', '#14B8A6'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { family: 'Inter' } }
          }
        },
        cutout: '70%',
      }
    });
  }
}
