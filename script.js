// Helper to format PKR
let target = 8500000;

// ===== Google Sheets Configuration =====
// Replace with your Google Sheet ID (the long string in the sheet URL)
// Sheet URL format: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
const GOOGLE_SHEET_ID = '1MTpFRKMaYQaWoAukyTyOKKagiZTtnlIoftWU7w7jO-E'; 

const SHEET_NAMES = {
  contributions: 'Contributions',
  phases: 'Phases',
  expenses: 'Expenses'
};

// Data cache to avoid re-fetching
let _contributionsCache = null;
let _phasesCache = null;

function getSheetCSVUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      let val = values[idx] || '';
      val = val.replace(/^"|"$/g, '').trim();
      row[header] = val;
    });
    rows.push(row);
  }
  return rows;
}

async function fetchContributions() {
  if (_contributionsCache) return _contributionsCache;

  const csvText = await fetch(getSheetCSVUrl(SHEET_NAMES.contributions)).then(r => r.text());
  const raw = parseCSV(csvText);

  _contributionsCache = raw.map(row => ({
    name: row.name || '',
    date: row.date || '',
    amount: parseFloat(row.amount) || 0,
    details: row.details || ''
  }));

  return _contributionsCache;
}

async function fetchPhases() {
  if (_phasesCache) return _phasesCache;

  const [phasesCsv, expensesCsv] = await Promise.all([
    fetch(getSheetCSVUrl(SHEET_NAMES.phases)).then(r => r.text()),
    fetch(getSheetCSVUrl(SHEET_NAMES.expenses)).then(r => r.text())
  ]);

  const phasesRaw = parseCSV(phasesCsv);
  const expensesRaw = parseCSV(expensesCsv);

  const expensesByPhase = {};
  expensesRaw.forEach(row => {
    const pid = parseInt(row.phase_id);
    if (!expensesByPhase[pid]) expensesByPhase[pid] = [];
    expensesByPhase[pid].push({
      item: row.item || '',
      price: parseFloat(row.price) || 0
    });
  });

  _phasesCache = {
    phases: phasesRaw.map(row => ({
      id: parseInt(row.id),
      name: row.name || '',
      description: row.description || '',
      estimated: row.estimated ? parseFloat(row.estimated) : null,
      actual: row.actual ? parseFloat(row.actual) : null,
      status: row.status || 'upcoming',
      order: parseInt(row.order),
      expenses: expensesByPhase[parseInt(row.id)] || []
    }))
  };

  return _phasesCache;
}

function formatPKR(num) {
  return num.toLocaleString('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });
}

// Image Modal Functions
function openImageModal(imageSrc, caption) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  
  modalImage.src = imageSrc;
  modalCaption.textContent = caption;
  modal.style.display = 'block';
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Remove modal from browser history if it was added
  if (window.location.hash === '#modal') {
    window.history.back();
  }
}

// Copy to clipboard functionality
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show success message
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('Copied to clipboard!', 'success');
  });
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    z-index: 10000;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
  `;
  
  // Add keyframe animation
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Smooth scroll to payment details
function scrollToPaymentDetails() {
  const paymentSection = document.getElementById('payment-details');
  if (paymentSection) {
    paymentSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}



// Load and render contributions with accordion
fetchContributions().then(data => {
    const accordionContainer = document.getElementById('contributions-accordion');
    let total = 0;
    
    // Group contributions by month
    const monthlyGroups = {};
    data.forEach(row => {
      const date = new Date(row.date.split('/').reverse().join('-'));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          monthName: monthName,
          contributions: [],
          total: 0
        };
      }
      
      monthlyGroups[monthKey].contributions.push(row);
      monthlyGroups[monthKey].total += row.amount;
      total += row.amount;
    });
    
    // Sort months in descending order (latest first)
    const sortedMonths = Object.keys(monthlyGroups).sort().reverse();
    
    // Create accordion items
    sortedMonths.forEach((monthKey, index) => {
      const monthData = monthlyGroups[monthKey];
      const isLatest = index === 0; // First month (latest) should be expanded
      
      const accordionItem = document.createElement('div');
      accordionItem.className = 'accordion-item';
      
      const accordionHeader = document.createElement('div');
      accordionHeader.className = `accordion-header ${isLatest ? 'active' : ''}`;
      accordionHeader.innerHTML = `
        <div class="accordion-title">
          <span class="month-name">${monthData.monthName}</span>
          <span class="month-total">${formatPKR(monthData.total)}</span>
        </div>
        <div class="accordion-icon">▼</div>
      `;
      
      const accordionContent = document.createElement('div');
      accordionContent.className = `accordion-content ${isLatest ? 'active' : ''}`;
      
      const table = document.createElement('table');
      table.className = 'accordion-table';
      table.innerHTML = `
        <thead>
          <tr><th>Name</th><th>Date</th><th>Amount (PKR)</th></tr>
        </thead>
        <tbody></tbody>
      `;
      
      const tbody = table.querySelector('tbody');
      // Sort contributions within the month by date (latest first) and preserve original order within same day
      const sortedContributions = monthData.contributions.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        
        // If dates are different, sort by date (latest first)
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA; // Descending order (latest first)
        }
        
        // If dates are the same, maintain original order from JSON (bottom entries come first)
        // Since the JSON is already ordered with latest at bottom, we need to reverse the order
        // within the same day to show bottom entries first
        const originalIndexA = data.findIndex(item => 
          item.name === a.name && item.date === a.date && item.amount === a.amount
        );
        const originalIndexB = data.findIndex(item => 
          item.name === b.name && item.date === b.date && item.amount === b.amount
        );
        
        return originalIndexB - originalIndexA; // Higher index (bottom) comes first
      });
      
      sortedContributions.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.name}</td><td>${row.date}</td><td>${formatPKR(row.amount)}</td>`;
        tbody.appendChild(tr);
      });
      
      accordionContent.appendChild(table);
      accordionItem.appendChild(accordionHeader);
      accordionItem.appendChild(accordionContent);
      accordionContainer.appendChild(accordionItem);
      
      // Set initial height for the first (latest) month
      if (isLatest) {
        setTimeout(() => {
          const contentHeight = accordionContent.scrollHeight;
          accordionContent.style.maxHeight = contentHeight + 'px';
        }, 10);
      }
      
      // Add click event for accordion toggle
      accordionHeader.addEventListener('click', () => {
        const isActive = accordionHeader.classList.contains('active');
        
        // Close all other accordion items
        document.querySelectorAll('.accordion-header').forEach(header => {
          header.classList.remove('active');
        });
        document.querySelectorAll('.accordion-content').forEach(content => {
          content.classList.remove('active');
          content.style.maxHeight = '0px';
        });
        
        // Toggle current item
        if (!isActive) {
          accordionHeader.classList.add('active');
          accordionContent.classList.add('active');
          
          // Calculate and set the actual height needed
          setTimeout(() => {
            const contentHeight = accordionContent.scrollHeight;
            accordionContent.style.maxHeight = contentHeight + 'px';
            
            // Wait for the expansion animation to complete before scrolling
            setTimeout(() => {
              // Scroll to the expanded accordion section
              accordionHeader.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              });
            }, 300); // Wait for CSS transition to complete
          }, 10);
        }
      });
    });
    
    // Update total display
    document.getElementById('current-progress').textContent = formatPKR(total);
  });

// Update progress bar and target
document.getElementById('donation-target').textContent = formatPKR(target);
document.getElementById('target-progress').textContent = formatPKR(target);
fetchContributions().then(contribs => {
    let raised = contribs.reduce((sum, c) => sum + c.amount, 0);
    let percent = Math.min(100, (raised / target) * 100);
    document.getElementById('progress-bar-fill').style.width = percent + '%';
  });

// Load and render work phases
fetchPhases().then(data => {
    const phasesProgressBar = document.getElementById('phases-progress-bar');
    const phasesDetails = document.getElementById('phases-details');
    const phasesPercentage = document.getElementById('phases-percentage');
    
    // Sort phases by order
    const sortedPhases = data.phases.sort((a, b) => a.order - b.order);
    
          fetchContributions().then(contributions => {
      // Calculate total contributions
      const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
      
      // Calculate total spent on all phases with expenses
      const totalPhasesSpent = sortedPhases
        .reduce((sum, phase) => {
          const actualSpent = phase.expenses ? phase.expenses.reduce((expenseSum, expense) => expenseSum + expense.price, 0) : 0;
          return sum + actualSpent;
        }, 0);
      
      // Find the in-progress phase
      const inProgressPhase = sortedPhases.find(phase => phase.status === 'in_progress');
      
      // Calculate total estimated cost for all phases
      const totalEstimatedCost = target;
      
      // Calculate financial completion percentage (collected contributions / total estimated)
      const financialCompletionPercentage = ((totalContributions / totalEstimatedCost) * 100).toFixed(2);
      
      phasesPercentage.textContent = `(${financialCompletionPercentage}%)`;
      
      // Create progress bar steps
      sortedPhases.forEach((phase, index) => {
        // Create step element
        const stepDiv = document.createElement('div');
        stepDiv.className = `phase-step ${phase.status}`;
        
        const circleDiv = document.createElement('div');
        circleDiv.className = 'phase-circle';
        circleDiv.textContent = phase.order;
        
        stepDiv.appendChild(circleDiv);
        phasesProgressBar.appendChild(stepDiv);
        
        // Create phase card
        const cardDiv = document.createElement('div');
        cardDiv.className = `phase-card ${phase.status}`;
        
        const estimatedValue = phase.estimated ? formatPKR(phase.estimated) : 'TBD';
        let actualValue = 'TBD';
        let progressPercentage = 0;
        
        // Calculate actual spent from expenses data for any phase that has expenses
        const actualSpent = phase.expenses ? phase.expenses.reduce((sum, expense) => sum + expense.price, 0) : 0;
        
        if (phase.status === 'completed') {
          actualValue = actualSpent > 0 ? formatPKR(actualSpent) : 'TBD';
          progressPercentage = 100;
        } else if (phase.status === 'in_progress') {
          if (actualSpent > 0) {
            // If phase has expenses, show actual spent
            actualValue = formatPKR(actualSpent);
            progressPercentage = phase.estimated ? Math.min(100, (actualSpent / phase.estimated) * 100) : 0;
          } else if (phase.estimated) {
            // Calculate remaining amount for in-progress phase without expenses
            const remainingAmount = totalContributions - totalPhasesSpent;
            const spentAmount = Math.max(0, Math.min(remainingAmount, phase.estimated));
            actualValue = formatPKR(spentAmount);
            progressPercentage = Math.min(100, (spentAmount / phase.estimated) * 100);
          } else {
            actualValue = 'TBD';
            progressPercentage = 0;
          }
        } else if (phase.status === 'upcoming') {
          if (actualSpent > 0) {
            // If upcoming phase has expenses, show them
            actualValue = formatPKR(actualSpent);
            progressPercentage = phase.estimated ? Math.min(100, (actualSpent / phase.estimated) * 100) : 0;
          } else {
            actualValue = 'TBD';
            progressPercentage = 0;
          }
        }
        
        const statusText = phase.status.replace('_', ' ').toUpperCase();
        
        // Calculate contributions for in-progress phase (excluding first phase spent)
        let contributionsForPhase = 0;
        let contributionsProgressPercentage = 0;
        
        if (phase.status === 'in_progress') {
          // Calculate total spent on completed phases
          const completedPhasesSpent = sortedPhases
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => {
              const actualSpent = p.expenses ? p.expenses.reduce((expenseSum, expense) => expenseSum + expense.price, 0) : 0;
              return sum + actualSpent;
            }, 0);
          
          // Contributions available for this phase = total contributions - completed phases spent
          contributionsForPhase = Math.max(0, totalContributions - completedPhasesSpent);
          contributionsProgressPercentage = phase.estimated ? Math.min(100, (contributionsForPhase / phase.estimated) * 100) : 0;
        }
        
        // Generate progress bars HTML
        let progressBarsHTML = '';
        
        if (phase.status === 'in_progress') {
          progressBarsHTML = `
            <div class="phase-progress-section">
              <div class="progress-bar-group">
                <div class="progress-label">💰 Spent in Progress:</div>
                <div class="phase-progress-container">
                  <div class="phase-progress-bar">
                    <div class="phase-progress-fill ${phase.status}" style="width: ${progressPercentage}%"></div>
                  </div>
                  <div class="phase-progress-text">${progressPercentage.toFixed(1)}%</div>
                </div>
              </div>
              <div class="progress-bar-group">
                <div class="progress-label">💵 Contributions Collected:</div>
                <div class="phase-progress-container">
                  <div class="phase-progress-bar">
                    <div class="phase-progress-fill contributions" style="width: ${contributionsProgressPercentage}%"></div>
                  </div>
                  <div class="phase-progress-text">${contributionsProgressPercentage.toFixed(1)}%</div>
                </div>
                <div class="contributions-amount">${formatPKR(contributionsForPhase)} / ${estimatedValue}</div>
              </div>
            </div>
          `;
        } else {
          progressBarsHTML = `
            <div class="phase-progress-container">
              <div class="phase-progress-bar">
                <div class="phase-progress-fill ${phase.status}" style="width: ${progressPercentage}%"></div>
              </div>
              <div class="phase-progress-text">${progressPercentage.toFixed(1)}%</div>
            </div>
          `;
        }
        
        cardDiv.innerHTML = `
          <h4>Phase ${phase.order}: ${phase.name}</h4>
          <p class="phase-description">${phase.description}</p>
          <div class="phase-financials">
            <div class="phase-estimated">
              <div class="phase-estimated-label">Estimated:</div>
              <div class="phase-estimated-value">${estimatedValue}</div>
            </div>
            <div class="phase-actual">
              <div class="phase-actual-label">Actual Spent:</div>
              <div class="phase-actual-value">${actualValue}</div>
            </div>
          </div>
          <div class="phase-status ${phase.status}">${statusText}</div>
          ${progressBarsHTML}
          <button class="phase-details-btn" onclick="openPhaseModal(${phase.order})">
            📸 View Details
          </button>
        `;
        
        phasesDetails.appendChild(cardDiv);
        
        // Add important message after second phase (before third phase)
        if (phase.order === 2) {
          const messageCard = document.createElement('div');
          messageCard.className = 'phase-important-message';
          messageCard.innerHTML = `
            <div class="message-header">
              <h3>🚨 اہم اپیل - تیسرے فیز کے لیے عطیات کی ضرورت</h3>
              <div class="message-subtitle">Important Appeal - Donations Needed for Third Phase</div>
            </div>
            <div class="message-content">
              <div class="urdu-message">
                <p><strong>میرے بھائیو اور دوستو</strong></p>
                <p><strong>السلام علیکم ورحمۃاللہ وبرکاتہ</strong></p>
                <p>الحمدللہ! اللہ تعالیٰ کے فضل و کرم سے مسجد شریف کا پہلا فیز (بنیاد) اور دوسرا فیز (پانی کا نظام، دیواریں اور چھت) مکمل ہو چکا ہے۔ پہلے فیز پر تقریباً <strong>8,18,250 آٹھ لاکھ اٹھارہ ہزار دو سو پچاس روپے</strong> اور دوسرے فیز پر تقریباً <strong>28,14,210 اٹھائیس لاکھ چودہ ہزار دو سو دس روپے</strong> کی لاگت آئی ہے۔</p>
                <p>سکول میں مسجد کی تعمیر کی ضرورت اس لیے شدت سے محسوس کی جا رہی تھی کیونکہ پرائمری کلاسز تک ناظرہ قرآن کریم نصاب کا لازمی حصہ قرار دیا گیا ہے اور مڈل و ہائی کلاسز میں قرآن مجید ترجمہ وتفسیر کے ساتھ لازمی نصاب کا حصہ بنادیا گیا اس لیے موجودہ نسل کو قرآن کریم کی تعلیم آداب کا خیال کرتے ہوئے باوضو پڑھانا کہ بچوں کی تعلیم کے ساتھ تربیت بھی کی جا سکے تاکہ ہمارے بچے عملی مسلمان بنیں اور معاشرے کے اچھے افراد بن سکیں اور ہمارا معاشرہ ایک اچھا عملی اسلام کا نقشہ پیش کرنے والا معاشرہ تشکیل پاسکے۔</p>
                <p>بچوں کو ظہر کی نماز باجماعت پڑھانا تاکہ بچے پاک صاف رہنا سیکھیں اور بچپن سے نماز کے اور اچھی عادات کے عادی بن سکیں۔ مزید سکول کے قرب میں رہنے والی ابادی کے ہمارے مسلمان بھائی باجماعت نماز پڑھ کر مسجد کی ابادی کا باعث بن سکیں۔</p>
                <p><strong>مسجد پر کل لاگت کا تخمینہ 6,500,000 پینسٹھ لاکھ روپے لگایا گیا ہے۔</strong></p>
                <p><strong>مسجد کے تیسرے فیز کا کام شروع کروانا مقصود ہے</strong> جس میں اندرونی و بیرونی پلستر، فرش کی تکمیل، اور مینار کی تعمیر شامل ہے۔ اس فیز کے لیے سیمنٹ، ریت، پلستر کا سامان، فرش کی ٹائلیں، مینار کی تعمیر کا مواد اور مزدوری کی ضرورت ہے۔</p>
                <p>اس نیک کام میں اپنی آخرت سنوارنے، عزیز واقارب کے ایصال ثواب اور اللہ کے نبی حضرت محمد صلی اللہ علیہ وسلم کے فرمان عالی شان کو سامنے رکھتے ہوئے کہ <strong>"من بنی للہ مسجدا بنی اللہ لہ بیتا فی الجنۃ"</strong> (جس نے اللہ تعالیٰ کی رضا کے لیے اللہ کا گھر (مسجد) بنایا اللہ تعالیٰ اس کے لیے جنت میں گھر بنائے گا) کو مدنظر رکھتے ہوئے <strong>بڑھ چڑھ کر تعاون کیجیئے</strong>۔ اللہ تعالیٰ آپ کو بہت بہت بہترین بدلہ عطا فرمائے گا۔</p>
                <p>اللہ تعالیٰ ہم سب کو اس نیک کام میں بھرپور کردار ادا کرنے اور مالی و جانی ہر اعتبار سے تمام تر صلاحیتوں کو بروئے کار لانے کی توفیق عطا فرمائے۔</p>
                <p><strong>آمین یارب العالمین</strong></p>
              </div>
              <div class="message-actions">
                <button class="donate-urgent-btn" onclick="scrollToPaymentDetails()">
                  💰 فوری عطیہ دیں - Donate Now
                </button>
              </div>
            </div>
          `;
          phasesDetails.appendChild(messageCard);
        }
      });
    }).catch(error => {
      console.error('Error loading contributions:', error);
    });
  })
  .catch(error => {
    console.error('Error loading work phases:', error);
  });

// Initialize everything when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  
  // Setup donate now button
  const donateBtn = document.getElementById('donate-now-btn');
  if (donateBtn) {
    donateBtn.addEventListener('click', scrollToPaymentDetails);
  }
  
  // Setup share button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', sharePage);
  }
  
  // Setup image modal events
  const modal = document.getElementById('imageModal');
  if (modal) {
    // Close modal on any click (background, image, or caption)
    modal.addEventListener('click', function(e) {
      closeImageModal();
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        closeImageModal();
      }
    });
    
    // Handle browser back button for mobile
    let modalOpened = false;
    const originalOpenImageModal = openImageModal;
    openImageModal = function(imageSrc, caption) {
      originalOpenImageModal(imageSrc, caption);
      modalOpened = true;
      
      // Add to browser history
      const currentUrl = window.location.href;
      const modalUrl = currentUrl + '#modal';
      window.history.pushState({ modal: true }, '', modalUrl);
    };
    
    // Listen for popstate (back button)
    window.addEventListener('popstate', function(e) {
      if (modalOpened && modal.style.display === 'block') {
        closeImageModal();
        modalOpened = false;
      }
    });
  }
  
  // Setup phase modal events
  const phaseModal = document.getElementById('phaseModal');
  if (phaseModal) {
    // Close modal on background click
    phaseModal.addEventListener('click', function(e) {
      if (e.target === phaseModal) {
        closePhaseModal();
      }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && phaseModal.style.display === 'block') {
        closePhaseModal();
      }
    });
  }
  
  // Add click event to payment section for better UX
  const paymentSection = document.getElementById('payment-details');
  if (paymentSection) {
    paymentSection.addEventListener('click', (e) => {
      // If clicking on the section background, scroll to top of section
      if (e.target === paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});

// Share functionality
function sharePage() {
  const shareData = {
    title: 'Masjid Fundraiser Appeal - Government Pilot Secondary School SIAKH',
    text: 'Help us build a masjid at Government Pilot Secondary School SIAKH. Your donation is a sadaqah jariyah (ongoing charity) that will benefit generations to come.',
    url: window.location.href
  };

  // Check if Web Share API is supported (mobile browsers)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    navigator.share(shareData)
      .then(() => {
        showNotification('Shared successfully!', 'success');
      })
      .catch((error) => {
        console.log('Error sharing:', error);
        fallbackShare();
      });
  } else {
    // Fallback for desktop or unsupported browsers
    fallbackShare();
  }
}

// Fallback share method
function fallbackShare() {
  const url = window.location.href;
  const text = 'Help us build a masjid at Government Pilot Secondary School SIAKH. Your donation is a sadaqah jariyah (ongoing charity) that will benefit generations to come.';
  
  // Try to copy URL to clipboard
  copyToClipboard(url);
  showNotification('URL copied! You can now share it manually.', 'info');
  
  // Also try to open WhatsApp Web if possible
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(whatsappUrl, '_blank');
}

// Phase Modal Functions
let currentPhase = null;
let phaseSlider = null;

function openPhaseModal(phaseOrder) {
  currentPhase = phaseOrder;
  const modal = document.getElementById('phaseModal');
  const title = document.getElementById('phaseModalTitle');
  const description = document.getElementById('phaseModalDescription');
  
  // Get phase data
  fetchPhases().then(data => {
      const phase = data.phases.find(p => p.order === phaseOrder);
      if (phase) {
        title.textContent = `Phase ${phase.order}: ${phase.name}`;
        description.textContent = phase.description;
        
        // Load phase images
        loadPhaseImages(phaseOrder);
        
        // Load phase expenses
        loadPhaseExpenses(phase);
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add to browser history for back button support
        window.history.pushState({ modal: 'phase', phase: phaseOrder }, '', `#phase-${phaseOrder}`);
        
        // Initialize phase slider
        setTimeout(() => {
          initializePhaseSlider();
        }, 100);
      }
    });
}

function closePhaseModal() {
  const modal = document.getElementById('phaseModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  currentPhase = null;
  phaseSlider = null;
  
  // Remove from browser history if it was added
  if (window.location.hash.startsWith('#phase-')) {
    window.history.back();
  }
}

// Add event listener for back button
window.addEventListener('popstate', function(event) {
  if (event.state && event.state.modal === 'phase') {
    // Back button was pressed while modal was open, close it
    closePhaseModal();
  }
});

function loadPhaseImages(phaseOrder) {
  const track = document.getElementById('phase-slider-track');
  const dotsContainer = document.getElementById('phase-slider-dots');
  
  // Clear existing content
  track.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  // Show images for phase 1 and phase 2, show "coming soon" for others
  if (phaseOrder === 1) {
    // 3D map images first, then current progress images
    var imageFiles = [
      // Current Progress Images
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (10).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (9).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (8).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (7).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (6).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (5).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (4).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (3).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (2).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM (1).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.01 PM.jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (1).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (10).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (11).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (2).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (3).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (4).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (5).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (6).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (7).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (8).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM (9).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.02 PM.jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (1).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (2).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (3).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (4).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (5).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (6).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM (7).jpeg',
      'images/current-progress/phase-1/WhatsApp Image 2025-06-19 at 3.57.03 PM.jpeg'
    ];
  } else if (phaseOrder === 2) {
    // Phase 2 - Current Progress Images
    var imageFiles = [
      // Original WhatsApp images
      'images/current-progress/phase-2/WhatsApp Image 2025-07-27 at 10.57.16 AM.jpeg',
      'images/current-progress/phase-2/WhatsApp Image 2025-07-27 at 10.57.16 AM (1).jpeg',
      'images/current-progress/phase-2/WhatsApp Image 2025-07-27 at 10.57.18 AM.jpeg',
      'images/current-progress/phase-2/WhatsApp Image 2025-07-27 at 10.57.23 AM.jpeg',
      'images/current-progress/phase-2/WhatsApp Image 2025-07-27 at 10.57.25 AM.jpeg',
      // New numbered images (6-15)
      'images/current-progress/phase-2/6.jpeg',
      'images/current-progress/phase-2/7.jpeg',
      'images/current-progress/phase-2/8.jpeg',
      'images/current-progress/phase-2/9.jpeg',
      'images/current-progress/phase-2/10.jpeg',
      'images/current-progress/phase-2/11.jpeg',
      'images/current-progress/phase-2/12.jpeg',
      'images/current-progress/phase-2/13.jpeg',
      'images/current-progress/phase-2/14.jpeg',
      'images/current-progress/phase-2/15.jpeg',
      // Lantern images
      'images/current-progress/phase-2/lanter1.jpeg',
      'images/current-progress/phase-2/lanter2.jpeg'
    ];
  }
  
  // Process imageFiles if we have them (for phase 1 or 2)
  if (phaseOrder === 1 || phaseOrder === 2) {
    imageFiles.forEach((imagePath, index) => {
      const img = document.createElement('img');
      img.src = imagePath;
      img.alt = `Phase ${phaseOrder} Image ${index + 1}`;
      track.appendChild(img);
      
      // Create dot
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.addEventListener('click', () => phaseSlider.goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  } else {
    // Show "coming soon" message for other phases
    const comingSoonDiv = document.createElement('div');
    comingSoonDiv.className = 'coming-soon-message';
    comingSoonDiv.innerHTML = `
      <div class="coming-soon-content">
        <div class="coming-soon-icon">📸</div>
        <h3>Pictures Coming Soon</h3>
        <p>Phase ${phaseOrder} pictures will be available once work begins.</p>
        <p class="urdu-text">فیز ${phaseOrder} کی تصاویر کام شروع ہونے کے بعد دستیاب ہوں گی۔</p>
      </div>
    `;
    track.appendChild(comingSoonDiv);
    
    // Hide slider controls since there's only one "slide"
    const prevBtn = document.getElementById('phase-prev-btn');
    const nextBtn = document.getElementById('phase-next-btn');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }
}

function loadPhaseExpenses(phase) {
  const tbody = document.querySelector('#phase-expenses-table tbody');
  const totalCell = document.getElementById('phase-expenses-total');
  
  // Clear existing content
  tbody.innerHTML = '';
  
  let total = 0;
  
  if (phase.expenses && phase.expenses.length > 0) {
    phase.expenses.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.item}</td><td>${formatPKR(row.price)}</td>`;
      tbody.appendChild(tr);
      total += row.price;
    });
  } else {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="2" style="text-align: center; color: #ccc; font-style: italic;">No expenses recorded yet</td>`;
    tbody.appendChild(tr);
  }
  
  totalCell.textContent = formatPKR(total);
}

function initializePhaseSlider() {
  const track = document.getElementById('phase-slider-track');
  const prevBtn = document.getElementById('phase-prev-btn');
  const nextBtn = document.getElementById('phase-next-btn');
  const dotsContainer = document.getElementById('phase-slider-dots');
  
  if (!track || track.children.length === 0) return;
  
  phaseSlider = {
    currentSlide: 0,
    slides: Array.from(track.children),
    track: track,
    prevBtn: prevBtn,
    nextBtn: nextBtn,
    dotsContainer: dotsContainer,
    
    init() {
      this.setupEventListeners();
      this.updateSlider();
    },
    
    setupEventListeners() {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
      this.nextBtn.addEventListener('click', () => this.nextSlide());
      
      // Touch/swipe support
      let startX = 0;
      let endX = 0;
      
      this.track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });
      
      this.track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        this.handleSwipe(startX, endX);
      });
    },
    
    handleSwipe(startX, endX) {
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    },
    
    prevSlide() {
      this.currentSlide = Math.max(0, this.currentSlide - 1);
      this.updateSlider();
    },
    
    nextSlide() {
      this.currentSlide = Math.min(this.slides.length - 1, this.currentSlide + 1);
      this.updateSlider();
    },
    
    goToSlide(index) {
      this.currentSlide = index;
      this.updateSlider();
    },
    
    updateSlider() {
      const offset = -this.currentSlide * 100;
      this.track.style.transform = `translateX(${offset}%)`;
      
      // Update dots
      const dots = this.dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentSlide);
      });
      
      // Update button states
      this.prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
      this.nextBtn.style.opacity = this.currentSlide === this.slides.length - 1 ? '0.5' : '1';
    }
  };
  
  phaseSlider.init();
} 