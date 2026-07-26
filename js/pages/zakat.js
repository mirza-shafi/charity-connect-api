import { store } from '../store.js';

export function renderZakat(container, queryParams) {
  const zakatSettings = store.getZakatSettings ? store.getZakatSettings() : { nisabValue: 500, lastUpdated: '2026-07-01' };
  const nisab = zakatSettings.nisabValue || 500;
  const lastUpdated = zakatSettings.lastUpdated || '2026-07-01';

  container.innerHTML = `
    <style>
      /* ── Hero ── */
      .zakat-hero {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #1a5632) 100%);
        padding: 72px 0 64px;
        text-align: center;
        color: #fff;
      }
      .zakat-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          repeating-conic-gradient(
            rgba(255,255,255,.04) 0% 25%,
            transparent 0% 50%
          ) 0 0 / 60px 60px;
        pointer-events: none;
      }
      .zakat-hero::after {
        content: '';
        position: absolute;
        bottom: -40px; right: -40px;
        width: 260px; height: 260px;
        border-radius: 50%;
        background: rgba(255,255,255,.06);
        pointer-events: none;
      }
      .zakat-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,.15);
        backdrop-filter: blur(6px);
        padding: 6px 18px;
        border-radius: 100px;
        font-size: .82rem;
        font-weight: 600;
        letter-spacing: .4px;
        margin-bottom: 18px;
        text-transform: uppercase;
      }
      .zakat-hero h1 {
        font-family: 'Outfit', sans-serif;
        font-size: 2.75rem;
        font-weight: 800;
        margin: 0 0 14px;
        letter-spacing: -.5px;
      }
      .zakat-hero p {
        max-width: 620px;
        margin: 0 auto;
        font-size: 1.1rem;
        opacity: .88;
        line-height: 1.65;
      }

      /* ── Layout ── */
      .zakat-layout {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 36px;
        align-items: start;
        padding: 48px 0 64px;
      }
      @media (max-width: 1024px) {
        .zakat-layout { grid-template-columns: 1fr; }
        .zakat-results-panel { position: static !important; }
      }

      /* ── Form Section ── */
      .zakat-section-card {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        padding: 32px;
        margin-bottom: 28px;
      }
      .zakat-section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }
      .zakat-section-icon {
        width: 44px; height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        flex-shrink: 0;
      }
      .zakat-section-icon.assets {
        background: rgba(34,197,94,.12);
        color: #22c55e;
      }
      .zakat-section-icon.liabilities {
        background: rgba(239,68,68,.12);
        color: #ef4444;
      }
      .zakat-section-header h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0;
        color: var(--text);
      }
      .zakat-section-header p {
        font-size: .85rem;
        color: var(--text-muted);
        margin: 2px 0 0;
      }

      .zakat-field {
        margin-bottom: 20px;
      }
      .zakat-field:last-child { margin-bottom: 0; }
      .zakat-field-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: .92rem;
        color: var(--text);
        margin-bottom: 6px;
      }
      .zakat-field-label i {
        font-size: .8rem;
        color: var(--text-muted);
        opacity: .7;
      }
      .zakat-field-helper {
        font-size: .78rem;
        color: var(--text-muted);
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .zakat-input-wrap {
        position: relative;
      }
      .zakat-input-wrap .currency-symbol {
        position: absolute;
        left: 14px; top: 50%; transform: translateY(-50%);
        font-size: .92rem;
        font-weight: 700;
        color: var(--text-muted);
        pointer-events: none;
      }
      .zakat-input {
        width: 100%;
        padding: 12px 16px 12px 36px;
        border: 1.5px solid var(--border);
        border-radius: var(--radius, 10px);
        background: var(--bg, #f8fafb);
        color: var(--text);
        font-size: .95rem;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 500;
        transition: border-color .2s, box-shadow .2s;
        box-sizing: border-box;
      }
      .zakat-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(34,197,94,.12);
      }
      .zakat-input::placeholder { color: var(--text-muted); opacity: .5; }

      /* ── Results Panel ── */
      .zakat-results-panel {
        position: sticky;
        top: 100px;
      }
      .zakat-results-card {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        padding: 0;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,.08);
        backdrop-filter: blur(12px);
      }
      .zakat-results-header {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, #1a5632) 100%);
        padding: 24px 28px;
        color: #fff;
        text-align: center;
      }
      .zakat-results-header h3 {
        font-family: 'Outfit', sans-serif;
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0 0 4px;
      }
      .zakat-results-header p {
        font-size: .8rem;
        opacity: .75;
        margin: 0;
      }
      .zakat-results-body {
        padding: 28px;
      }
      .zakat-result-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--border);
        font-size: .92rem;
      }
      .zakat-result-row:last-of-type { border-bottom: none; }
      .zakat-result-row .label {
        color: var(--text-muted);
        font-weight: 500;
      }
      .zakat-result-row .value {
        font-weight: 700;
        color: var(--text);
        font-family: 'Outfit', sans-serif;
      }
      .zakat-result-row .value.positive { color: #22c55e; }
      .zakat-result-row .value.negative { color: #ef4444; }

      /* Nisab progress */
      .zakat-nisab-section {
        margin: 20px 0;
        padding: 16px;
        background: var(--bg, #f8fafb);
        border-radius: var(--radius, 10px);
      }
      .zakat-nisab-labels {
        display: flex;
        justify-content: space-between;
        font-size: .78rem;
        color: var(--text-muted);
        margin-bottom: 8px;
        font-weight: 600;
      }
      .zakat-progress-track {
        width: 100%;
        height: 10px;
        background: var(--border);
        border-radius: 100px;
        overflow: hidden;
        position: relative;
      }
      .zakat-progress-fill {
        height: 100%;
        border-radius: 100px;
        transition: width .5s cubic-bezier(.4,0,.2,1), background .3s;
        min-width: 0;
      }
      .zakat-nisab-status {
        text-align: center;
        font-size: .82rem;
        font-weight: 600;
        margin-top: 8px;
      }

      /* Big Zakat amount */
      .zakat-amount-display {
        text-align: center;
        padding: 24px 16px;
        margin: 16px 0 0;
        background: linear-gradient(135deg, rgba(34,197,94,.08) 0%, rgba(16,185,129,.05) 100%);
        border-radius: var(--radius, 10px);
        border: 1.5px solid rgba(34,197,94,.18);
      }
      .zakat-amount-display .label-small {
        font-size: .78rem;
        text-transform: uppercase;
        letter-spacing: .8px;
        color: var(--text-muted);
        font-weight: 700;
        margin-bottom: 6px;
      }
      .zakat-amount-display .big-amount {
        font-family: 'Outfit', sans-serif;
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--accent, #f59e0b);
        line-height: 1.1;
      }
      .zakat-amount-display .rate-note {
        font-size: .78rem;
        color: var(--text-muted);
        margin-top: 6px;
      }
      .zakat-not-due {
        text-align: center;
        padding: 24px 16px;
        margin: 16px 0 0;
        background: var(--bg, #f8fafb);
        border-radius: var(--radius, 10px);
        border: 1.5px solid var(--border);
      }
      .zakat-not-due i {
        font-size: 1.8rem;
        color: var(--text-muted);
        opacity: .5;
        margin-bottom: 10px;
      }
      .zakat-not-due p {
        font-size: .9rem;
        color: var(--text-muted);
        font-weight: 500;
        line-height: 1.5;
        margin: 0;
      }

      .zakat-donate-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 16px 24px;
        margin-top: 20px;
        border: none;
        border-radius: var(--radius, 10px);
        font-size: 1rem;
        font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        cursor: pointer;
        transition: all .25s;
        letter-spacing: .2px;
      }
      .zakat-donate-btn.active {
        background: linear-gradient(135deg, var(--accent, #f59e0b) 0%, #d97706 100%);
        color: #fff;
        box-shadow: 0 4px 16px rgba(245,158,11,.3);
      }
      .zakat-donate-btn.active:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(245,158,11,.4);
      }
      .zakat-donate-btn.disabled {
        background: var(--border);
        color: var(--text-muted);
        cursor: not-allowed;
        opacity: .6;
      }

      /* ── Education Cards ── */
      .zakat-edu-section {
        padding: 0 0 80px;
      }
      .zakat-edu-title {
        text-align: center;
        margin-bottom: 40px;
      }
      .zakat-edu-title h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--text);
        margin: 0 0 10px;
      }
      .zakat-edu-title p {
        color: var(--text-muted);
        font-size: 1rem;
        margin: 0;
      }
      .zakat-edu-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      @media (max-width: 768px) {
        .zakat-edu-grid { grid-template-columns: 1fr; }
      }
      .zakat-edu-card {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        padding: 32px 28px;
        transition: transform .25s, box-shadow .25s;
      }
      .zakat-edu-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 36px rgba(0,0,0,.08);
      }
      .zakat-edu-card-icon {
        width: 56px; height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        margin-bottom: 20px;
      }
      .zakat-edu-card h4 {
        font-family: 'Outfit', sans-serif;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text);
        margin: 0 0 10px;
      }
      .zakat-edu-card p {
        color: var(--text-muted);
        font-size: .88rem;
        line-height: 1.65;
        margin: 0;
      }
    </style>

    <!-- ═══════ Hero ═══════ -->
    <section class="zakat-hero">
      <div class="container">
        <div class="zakat-hero-badge">
          <i class="fa-solid fa-moon"></i>
          Islamic Finance Tool
        </div>
        <h1>Zakat Calculator</h1>
        <p>Calculate your obligatory Zakat with precision. Zakat purifies your wealth and is one of the five pillars of Islam — a duty upon every eligible Muslim.</p>
      </div>
    </section>

    <!-- ═══════ Calculator ═══════ -->
    <div class="container">
      <div class="zakat-layout">

        <!-- Left: Form -->
        <div class="zakat-form-col">

          <!-- Assets -->
          <div class="zakat-section-card">
            <div class="zakat-section-header">
              <div class="zakat-section-icon assets">
                <i class="fa-solid fa-coins"></i>
              </div>
              <div>
                <h3>Your Assets</h3>
                <p>Enter the current value of each asset category</p>
              </div>
            </div>

            ${buildField('zakat-cash', 'Cash & Bank Accounts', 'fa-solid fa-wallet', 'Total cash in hand, savings, checking, and current accounts.')}
            ${buildField('zakat-gold', 'Gold Value', 'fa-solid fa-gem', 'Weight in grams × current market rate. Include jewelry intended for investment.')}
            ${buildField('zakat-silver', 'Silver Value', 'fa-solid fa-ring', 'Weight in grams × current market rate.')}
            ${buildField('zakat-business', 'Business Inventory', 'fa-solid fa-store', 'Merchandise, stock-in-trade, raw materials held for sale.')}
            ${buildField('zakat-investments', 'Investments', 'fa-solid fa-chart-line', 'Stocks, mutual funds, ETFs, cryptocurrency, and other liquid investments.')}
            ${buildField('zakat-other', 'Other Zakatable Assets', 'fa-solid fa-hand-holding-dollar', 'Rental income receivable, outstanding loans you've given, and similar receivables.')}
          </div>

          <!-- Liabilities -->
          <div class="zakat-section-card">
            <div class="zakat-section-header">
              <div class="zakat-section-icon liabilities">
                <i class="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div>
                <h3>Your Liabilities</h3>
                <p>Deductible debts and obligations due within the year</p>
              </div>
            </div>

            ${buildField('zakat-debt', 'Short-Term Debts', 'fa-solid fa-money-bill-transfer', 'Personal loans, installments, and debts due within the next 12 months.')}
            ${buildField('zakat-credit', 'Credit Card Balances', 'fa-solid fa-credit-card', 'Outstanding balances on all credit cards as of today.')}
            ${buildField('zakat-other-liab', 'Other Deductible Liabilities', 'fa-solid fa-receipt', 'Taxes owed, wages payable, and other immediate financial obligations.')}
          </div>
        </div>

        <!-- Right: Results Panel -->
        <div class="zakat-results-panel">
          <div class="zakat-results-card">
            <div class="zakat-results-header">
              <h3><i class="fa-solid fa-calculator" style="margin-right:8px;"></i> Zakat Summary</h3>
              <p>Nisab updated ${formatDate(lastUpdated)}</p>
            </div>
            <div class="zakat-results-body" id="zakat-results-body">
              <!-- Populated by JS -->
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════ Educational Section ═══════ -->
    <div class="container zakat-edu-section">
      <div class="zakat-edu-title">
        <h2>Understanding Zakat</h2>
        <p>Essential knowledge about this pillar of Islam</p>
      </div>
      <div class="zakat-edu-grid">

        <div class="zakat-edu-card">
          <div class="zakat-edu-card-icon" style="background:rgba(34,197,94,.1);color:#22c55e;">
            <i class="fa-solid fa-heart"></i>
          </div>
          <h4>What is Zakat?</h4>
          <p>Zakat is the third pillar of Islam — a mandatory act of worship requiring eligible Muslims to donate 2.5% of their qualifying wealth annually. It purifies one's earnings, promotes social equity, and helps alleviate poverty in the community.</p>
        </div>

        <div class="zakat-edu-card">
          <div class="zakat-edu-card-icon" style="background:rgba(99,102,241,.1);color:#6366f1;">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <h4>Who Must Pay?</h4>
          <p>Zakat is obligatory on every sane, adult Muslim whose net zakatable wealth meets or exceeds the Nisab threshold for a full lunar year. Both men and women who meet the criteria are required to fulfill this duty.</p>
        </div>

        <div class="zakat-edu-card">
          <div class="zakat-edu-card-icon" style="background:rgba(245,158,11,.1);color:#f59e0b;">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <h4>Nisab Explained</h4>
          <p>Nisab is the minimum amount of wealth a Muslim must possess before Zakat becomes obligatory. It is traditionally measured as the value of 87.48 grams of gold or 612.36 grams of silver — whichever is lower — to benefit more recipients.</p>
        </div>

      </div>
    </div>
  `;

  // ── Wire up inputs and perform initial calculation ──
  const inputIds = [
    'zakat-cash', 'zakat-gold', 'zakat-silver',
    'zakat-business', 'zakat-investments', 'zakat-other',
    'zakat-debt', 'zakat-credit', 'zakat-other-liab'
  ];

  inputIds.forEach(id => {
    const el = container.querySelector('#' + id);
    if (el) {
      el.addEventListener('input', () => recalculate());
    }
  });

  recalculate(); // initial render of results

  // ── Recalculate ──
  function recalculate() {
    const val = (id) => {
      const el = container.querySelector('#' + id);
      return el ? (parseFloat(el.value) || 0) : 0;
    };

    const assets = {
      cash: val('zakat-cash'),
      gold: val('zakat-gold'),
      silver: val('zakat-silver'),
      business: val('zakat-business'),
      investments: val('zakat-investments'),
      other: val('zakat-other'),
    };

    const liabilities = {
      debt: val('zakat-debt'),
      credit: val('zakat-credit'),
      otherLiab: val('zakat-other-liab'),
    };

    const totalAssets = Object.values(assets).reduce((s, v) => s + v, 0);
    const totalLiabilities = Object.values(liabilities).reduce((s, v) => s + v, 0);
    const netWealth = Math.max(0, totalAssets - totalLiabilities);
    const zakatDue = netWealth >= nisab;
    const zakatAmount = zakatDue ? netWealth * 0.025 : 0;
    const progress = nisab > 0 ? Math.min((netWealth / nisab) * 100, 100) : 0;

    const progressColor = zakatDue
      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
      : 'linear-gradient(90deg, var(--accent, #f59e0b), #d97706)';

    const resultsBody = container.querySelector('#zakat-results-body');
    if (!resultsBody) return;

    resultsBody.innerHTML = `
      <div class="zakat-result-row">
        <span class="label">Total Assets</span>
        <span class="value positive">$${formatNum(totalAssets)}</span>
      </div>
      <div class="zakat-result-row">
        <span class="label">Total Liabilities</span>
        <span class="value negative">−$${formatNum(totalLiabilities)}</span>
      </div>
      <div class="zakat-result-row" style="border-bottom:2px solid var(--border);padding-bottom:16px;">
        <span class="label" style="font-weight:700;color:var(--text);">Net Zakatable Wealth</span>
        <span class="value" style="font-size:1.1rem;">$${formatNum(netWealth)}</span>
      </div>

      <div class="zakat-nisab-section">
        <div class="zakat-nisab-labels">
          <span>Your Wealth</span>
          <span>Nisab: $${formatNum(nisab)}</span>
        </div>
        <div class="zakat-progress-track">
          <div class="zakat-progress-fill" style="width:${progress}%;background:${progressColor};"></div>
        </div>
        <div class="zakat-nisab-status" style="color:${zakatDue ? '#22c55e' : 'var(--text-muted)'};">
          ${zakatDue
            ? '<i class="fa-solid fa-circle-check" style="margin-right:4px;"></i> Your wealth meets the Nisab threshold'
            : '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i> ' + (progress > 0 ? Math.round(progress) + '% towards Nisab' : 'Enter your assets above')}
        </div>
      </div>

      ${zakatDue ? `
        <div class="zakat-amount-display">
          <div class="label-small">Your Zakat Due</div>
          <div class="big-amount">$${formatNum(zakatAmount)}</div>
          <div class="rate-note">2.5% of net zakatable wealth</div>
        </div>
      ` : `
        <div class="zakat-not-due">
          <i class="fa-solid fa-hand-holding-heart"></i>
          <p>Zakat is not obligatory on your current wealth. You may still give voluntary Sadaqah to earn reward.</p>
        </div>
      `}

      <button
        class="zakat-donate-btn ${zakatDue ? 'active' : 'disabled'}"
        id="zakat-donate-btn"
        ${zakatDue ? '' : 'disabled'}
      >
        <i class="fa-solid fa-hand-holding-heart"></i>
        Donate My Zakat Now
      </button>
    `;

    // Bind donate button
    const donateBtn = container.querySelector('#zakat-donate-btn');
    if (donateBtn && zakatDue) {
      donateBtn.addEventListener('click', () => {
        window.location.hash = `/zakat-donate?amount=${zakatAmount.toFixed(2)}`;
      });
    }
  }
}

// ── Helpers ──

function buildField(id, label, icon, helper) {
  return `
    <div class="zakat-field">
      <label class="zakat-field-label" for="${id}">
        <i class="${icon}"></i>
        ${label}
      </label>
      <div class="zakat-field-helper">${helper}</div>
      <div class="zakat-input-wrap">
        <span class="currency-symbol">$</span>
        <input
          type="number"
          id="${id}"
          class="zakat-input"
          placeholder="0.00"
          value="0"
          min="0"
          step="any"
        />
      </div>
    </div>
  `;
}

function formatNum(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
