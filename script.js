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
fetch('contributions.json?v=1')
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
fetch('expenses.json')
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
    document.getElementById('expenses-total').textContent = formatPKR(total);
    document.getElementById('donation-target').textContent = formatPKR(total);
    document.getElementById('target-progress').textContent = formatPKR(total);
    // Update progress bar
    fetch('contributions.json')
      .then(res => res.json())
      .then(contribs => {
        let raised = contribs.reduce((sum, c) => sum + c.amount, 0);
        let percent = Math.min(100, (raised / total) * 100);
        document.getElementById('progress-bar-fill').style.width = percent + '%';
      });
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