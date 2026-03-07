import { subscribeToTransactions } from '../utils/firestore.js';
import Chart from 'chart.js/auto';

let unsubscribe = null;
let charts = {};

export function renderAnalytics(container, data = null) {
  container.innerHTML = `
    <!-- Top Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="analytics-stats">
      <!-- Injected via JS -->
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="glass-card flex flex-col">
        <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Expenses by Category</h3>
        <div class="w-full h-[300px] relative flex items-center justify-center">
          <canvas id="chart-category-pie"></canvas>
        </div>
      </div>
      <div class="glass-card flex flex-col">
        <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Income vs Expense (This Year)</h3>
        <div class="w-full h-[300px] relative flex items-center justify-center">
           <canvas id="chart-income-expense-bar"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Charts Row 2 -->
    <div class="glass-card mb-6">
      <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Expense Trend (Last 6 Months)</h3>
      <div class="w-full h-[300px] relative flex items-center justify-center">
        <canvas id="chart-monthly-trend"></canvas>
      </div>
    </div>
  `;

  if (unsubscribe) unsubscribe();

  unsubscribe = subscribeToTransactions((transactions) => {
    updateAnalyticsUI(transactions);
  });
}

function updateAnalyticsUI(transactions) {
  const isDark = document.body.classList.contains('dark');
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  // Process data
  let totalIncome = 0;
  let totalExpense = 0;
  
  const categoryTotals = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize last 6 months
  const last6Months = [];
  const monthlyExpenseData = [];
  const monthlyIncomeData = [];
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = monthNames[d.getMonth()] + ' ' + d.getFullYear();
    last6Months.push(mStr);
    monthlyExpenseData.push(0);
    monthlyIncomeData.push(0);
  }

  transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    const d = new Date(t.date);
    const mStr = monthNames[d.getMonth()] + ' ' + d.getFullYear();
    const monthIndex = last6Months.indexOf(mStr);

    if (t.type === 'income') {
      totalIncome += amt;
      if(monthIndex !== -1) monthlyIncomeData[monthIndex] += amt;
    } else {
      totalExpense += amt;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      if(monthIndex !== -1) monthlyExpenseData[monthIndex] += amt;
    }
  });

  // Top Stats
  const statsContainer = document.getElementById('analytics-stats');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="glass flex flex-col p-4 rounded-xl border border-white/20 dark:border-white/5">
        <span class="text-sm text-slate-500">Total Transactions</span>
        <span class="text-2xl font-bold text-slate-800 dark:text-white">${transactions.length}</span>
      </div>
      <div class="glass flex flex-col p-4 rounded-xl border border-white/20 dark:border-white/5">
        <span class="text-sm text-slate-500">Largest Expense</span>
        <span class="text-2xl font-bold text-red-500">₹${Math.max(0, ...transactions.filter(t=>t.type==='expense').map(t=>parseFloat(t.amount))).toFixed(2)}</span>
      </div>
      <div class="glass flex flex-col p-4 rounded-xl border border-white/20 dark:border-white/5">
        <span class="text-sm text-slate-500">Avg Monthly Expense</span>
        <span class="text-2xl font-bold text-slate-800 dark:text-white">₹${(totalExpense / 6).toFixed(2)}</span>
      </div>
      <div class="glass flex flex-col p-4 rounded-xl border border-white/20 dark:border-white/5">
        <span class="text-sm text-slate-500">Savings Rate</span>
        <span class="text-2xl font-bold text-primary">${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : '0.0'}%</span>
      </div>
    `;
  }

  // Common chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: textColor
  };

  // 1. Pie Chart
  const pieCtx = document.getElementById('chart-category-pie');
  if (pieCtx) {
    if (charts.pie) charts.pie.destroy();
    charts.pie = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: ['#4F46E5', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#F97316', '#14B8A6'],
          borderWidth: 0
        }]
      },
      options: {
        ...defaultOptions,
        plugins: {
          legend: { position: 'right', labels: { color: textColor } }
        }
      }
    });
  }

  // 2. Income vs Expense Bar Chart
  const barCtx = document.getElementById('chart-income-expense-bar');
  if (barCtx) {
    if (charts.bar) charts.bar.destroy();
    charts.bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: last6Months,
        datasets: [
          {
            label: 'Income',
            data: monthlyIncomeData,
            backgroundColor: '#22C55E',
            borderRadius: 6
          },
          {
            label: 'Expense',
            data: monthlyExpenseData,
            backgroundColor: '#EF4444',
            borderRadius: 6
          }
        ]
      },
      options: {
        ...defaultOptions,
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: textColor } }
        }
      }
    });
  }

  // 3. Monthly Trend Line Chart
  const lineCtx = document.getElementById('chart-monthly-trend');
  if (lineCtx) {
    if (charts.line) charts.line.destroy();
    charts.line = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: last6Months,
        datasets: [{
          label: 'Total Expenses',
          data: monthlyExpenseData,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#4F46E5',
          pointRadius: 4
        }]
      },
      options: {
        ...defaultOptions,
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
