// Helper to format PKR
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

// Image Slider functionality
class ImageSlider {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.track = document.getElementById('slider-track');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.dotsContainer = document.getElementById('slider-dots');
    
    this.init();
  }
  
  init() {
    this.loadSlides();
    this.setupEventListeners();
    this.updateSlider();
  }
  
  loadSlides() {
    // List of images and videos
    const mediaItems = [
      // 3d-mpas
      { src: 'images/inauguration.jpeg', type: 'image' },
      { src: 'images/3d-mpas/WhatsApp Image 2025-06-19 at 4.00.07 PM.jpeg', type: 'image' },
      { src: 'images/3d-mpas/WhatsApp Image 2025-06-19 at 4.00.06 PM (1).jpeg', type: 'image' },
      { src: 'images/3d-mpas/WhatsApp Image 2025-06-19 at 4.00.06 PM.jpeg', type: 'image' },
      // current-progress
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (10).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (9).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (8).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (7).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (6).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (5).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (4).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (3).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (2).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM (1).jpeg', type: 'image' },
      { src: 'images/current-progress/WhatsApp Image 2025-06-19 at 3.57.01 PM.jpeg', type: 'image' },
      // Videos
      { src: 'images/videos/WhatsApp Video 2025-06-19 at 3.56.59 PM.mp4', type: 'video' },
      { src: 'images/videos/WhatsApp Video 2025-06-19 at 3.57.00 PM.mp4', type: 'video' },
      { src: 'images/videos/WhatsApp Video 2025-06-19 at 3.57.03 PM.mp4', type: 'video' }
    ];
    
    mediaItems.forEach((item, index) => {
      const element = item.type === 'image' ? 
        this.createImageElement(item.src) : 
        this.createVideoElement(item.src);
      
      this.slides.push(element);
      this.track.appendChild(element);
      
      // Create dot
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });
  }
  
  createImageElement(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Gallery Image';
    return img;
  }
  
  createVideoElement(src) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.muted = true;
    return video;
  }
  
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
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Auto-play (optional)
    setInterval(() => this.nextSlide(), 5000);
  }
  
  handleSwipe(startX, endX) {
    const threshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }
  
  prevSlide() {
    this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.slides.length - 1;
    this.updateSlider();
  }
  
  nextSlide() {
    this.currentSlide = this.currentSlide < this.slides.length - 1 ? this.currentSlide + 1 : 0;
    this.updateSlider();
  }
  
  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlider();
  }
  
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
}

// Load and render contributions with accordion
fetch('contributions.json?v=7')
  .then(res => res.json())
  .then(data => {
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
      monthData.contributions.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.name}</td><td>${row.date}</td><td>${formatPKR(row.amount)}</td>`;
        tbody.appendChild(tr);
      });
      
      accordionContent.appendChild(table);
      accordionItem.appendChild(accordionHeader);
      accordionItem.appendChild(accordionContent);
      accordionContainer.appendChild(accordionItem);
      
      // Add click event for accordion toggle
      accordionHeader.addEventListener('click', () => {
        const isActive = accordionHeader.classList.contains('active');
        
        // Close all other accordion items
        document.querySelectorAll('.accordion-header').forEach(header => {
          header.classList.remove('active');
        });
        document.querySelectorAll('.accordion-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
          accordionHeader.classList.add('active');
          accordionContent.classList.add('active');
        }
      });
    });
    
    // Update total display
    document.getElementById('current-progress').textContent = formatPKR(total);
  });

// Load and render expenses
fetch('expenses.json?v=7')
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector('#expenses-table tbody');
    let total = 0;
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.item}</td><td>${formatPKR(row.price)}</td>`;
      tbody.appendChild(tr);
      total += row.price;
    });
    let target = 6500000;
    document.getElementById('expenses-total').textContent = formatPKR(total) + " / " + formatPKR(target);
    document.getElementById('donation-target').textContent = formatPKR(target);//formatPKR(total);
    document.getElementById('target-progress').textContent = formatPKR(target);
    // Update progress bar
    fetch('contributions.json?v=7')
      .then(res => res.json())
      .then(contribs => {
        let raised = contribs.reduce((sum, c) => sum + c.amount, 0);
        let percent = Math.min(100, (raised / target) * 100);
        document.getElementById('progress-bar-fill').style.width = percent + '%';
      });
  });

// Load and render work phases
fetch('work-phases.json?v=1')
  .then(res => res.json())
  .then(data => {
    const phasesProgressBar = document.getElementById('phases-progress-bar');
    const phasesDetails = document.getElementById('phases-details');
    const phasesPercentage = document.getElementById('phases-percentage');
    
    // Sort phases by order
    const sortedPhases = data.phases.sort((a, b) => a.order - b.order);
    
    // Load contributions and expenses to calculate in-progress phase spending
    Promise.all([
      fetch('contributions.json?v=13').then(res => res.json()),
      fetch('expenses.json?v=14').then(res => res.json())
    ]).then(([contributions, expenses]) => {
      // Calculate total contributions
      const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
      
      // Calculate total spent on completed phases
      const completedPhasesSpent = sortedPhases
        .filter(phase => phase.status === 'completed')
        .reduce((sum, phase) => sum + (phase.actual || 0), 0);
      
      // Find the in-progress phase
      const inProgressPhase = sortedPhases.find(phase => phase.status === 'in_progress');
      
      // Calculate completion percentage including in-progress phase progress
      const totalPhases = sortedPhases.length;
      let completedPhases = 0;
      let inProgressContribution = 0;
      
      sortedPhases.forEach(phase => {
        if (phase.status === 'completed') {
          completedPhases++;
        } else if (phase.status === 'in_progress' && phase.estimated) {
          // Calculate progress contribution for in-progress phase
          const remainingAmount = totalContributions - completedPhasesSpent;
          const spentAmount = Math.max(0, Math.min(remainingAmount, phase.estimated));
          const phaseProgress = Math.min(1, spentAmount / phase.estimated);
          inProgressContribution = phaseProgress;
        }
      });
      
      // Calculate overall completion percentage
      const completionPercentage = ((completedPhases + inProgressContribution) / totalPhases * 100).toFixed(1);
      phasesPercentage.textContent = `(${completionPercentage}%)`;
      
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
        
        if (phase.status === 'completed') {
          actualValue = phase.actual ? formatPKR(phase.actual) : 'TBD';
          progressPercentage = 100;
        } else if (phase.status === 'in_progress' && phase.estimated) {
          // Calculate remaining amount for in-progress phase
          const remainingAmount = totalContributions - completedPhasesSpent;
          const spentAmount = Math.max(0, Math.min(remainingAmount, phase.estimated));
          actualValue = formatPKR(spentAmount);
          progressPercentage = Math.min(100, (spentAmount / phase.estimated) * 100);
        } else if (phase.status === 'upcoming') {
          progressPercentage = 0;
        }
        
        const statusText = phase.status.replace('_', ' ').toUpperCase();
        
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
          <div class="phase-progress-container">
            <div class="phase-progress-bar">
              <div class="phase-progress-fill ${phase.status}" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="phase-progress-text">${progressPercentage.toFixed(1)}%</div>
          </div>
        `;
        
        phasesDetails.appendChild(cardDiv);
        
        // Add important message after first phase (before second phase)
        if (phase.order === 1) {
          const messageCard = document.createElement('div');
          messageCard.className = 'phase-important-message';
          messageCard.innerHTML = `
            <div class="message-header">
              <h3>🚨 اہم اپیل - دوسرے فیز کے لیے عطیات کی ضرورت</h3>
              <div class="message-subtitle">Important Appeal - Donations Needed for Second Phase</div>
            </div>
            <div class="message-content">
              <div class="urdu-message">
                <p><strong>میرے بھائیو اور دوستو</strong></p>
                <p><strong>السلام علیکم ورحمۃاللہ وبرکاتہ</strong></p>
                <p>جیسا کہ آپ اس بات سے سوشل میڈیا کے ذریعہ سے بخوبی آگاہ ہی ہوں گے کہ گورنمنٹ پائلٹ سیکنڈری سکول سیاکھ میں مسجد شریف کے منصوبے کی بنیاد رکھ دی گئی ہے جس پر تقریباً <strong>8,00,000 آٹھ لاکھ روپے</strong> سے زیادہ کی لاگت آئی ہے۔</p>
                <p>سکول میں مسجد کی تعمیر کی ضرورت اس لیے شدت سے محسوس کی جا رہی تھی کیونکہ پرائمری کلاسز تک ناظرہ قرآن کریم نصاب کا لازمی حصہ قرار دیا گیا ہے اور مڈل و ہائی کلاسز میں قرآن مجید ترجمہ وتفسیر کے ساتھ لازمی نصاب کا حصہ بنادیا گیا اس لیے موجودہ نسل کو قرآن کریم کی تعلیم آداب کا خیال کرتے ہوئے باوضو پڑھانا کہ بچوں کی تعلیم کے ساتھ تربیت بھی کی جا سکے تاکہ ہمارے بچے عملی مسلمان بنیں اور معاشرے کے اچھے افراد بن سکیں اور ہمارا معاشرہ ایک اچھا عملی اسلام کا نقشہ پیش کرنے والا معاشرہ تشکیل پاسکے۔</p>
                <p>بچوں کو ظہر کی نماز باجماعت پڑھانا تاکہ بچے پاک صاف رہنا سیکھیں اور بچپن سے نماز کے اور اچھی عادات کے عادی بن سکیں۔ مزید سکول کے قرب میں رہنے والی ابادی کے ہمارے مسلمان بھائی باجماعت نماز پڑھ کر مسجد کی ابادی کا باعث بن سکیں۔</p>
                <p><strong>مسجد پر کل لاگت کا تخمینہ 6,500,000 پینسٹھ لاکھ روپے لگایا گیا ہے۔</strong></p>
                <p><strong>مسجد کے دوسرے فیز کا کام شروع کروانا مقصود ہے</strong> جس کے لیے زمین دوز پانی کی ٹینکی، پانی کی نئی پائپ لائن، پانی کی موٹر، دیواروں کی چنائی اور مسجد کی چھت ڈالنے کے لیے سامان (سیمنٹ، سریا، اینٹ، بجری، ریت، شٹرنگ اور مزدوری تعمیر) کی ضرورت ہے جس پر <strong>2,450,000 ساڑھے چوبیس لاکھ روپے</strong> کی لاگت کا تخمینہ لگایا گیا ہے۔</p>
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
    });
  })
  .catch(error => {
    console.error('Error loading work phases:', error);
  });

// Initialize everything when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Initialize image slider
  new ImageSlider();
  
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