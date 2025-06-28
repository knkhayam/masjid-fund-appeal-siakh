// Helper to format PKR
function formatPKR(num) {
  return num.toLocaleString('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });
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

// Load and render contributions
fetch('contributions.json?v=4')
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector('#contributions-table tbody');
    let total = 0;
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.name}</td><td>${row.date}</td><td>${formatPKR(row.amount)}</td>`;
      tbody.appendChild(tr);
      total += row.amount;
    });
    document.getElementById('contributions-total').textContent = formatPKR(total);
    document.getElementById('current-progress').textContent = formatPKR(total);
  });

// Load and render expenses
fetch('expenses.json?v=6')
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
    fetch('contributions.json?v=6')
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
      fetch('expenses.json?v=13').then(res => res.json())
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