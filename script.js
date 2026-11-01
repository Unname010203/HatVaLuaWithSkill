/**
 * HẠT & LỬA - Landing Page Script
 * Cà phê rang xay thủ công
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Navigation Toggle ---
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteHeader = document.getElementById('header');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      primaryNav.classList.toggle('is-open', !isExpanded);
    });

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (event) => {
      if (!siteHeader.contains(event.target) && primaryNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
      }
    });
  }

  // --- 2. Header Shadow on Scroll ---
  const handleScroll = () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- 3. Form Setup & Date Constraints ---
  const bookingForm = document.getElementById('bookingForm');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const bookingDetailText = document.getElementById('bookingDetailText');
  const resetBookingBtn = document.getElementById('resetBookingBtn');

  // Set minimum date to today (YYYY-MM-DD)
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Pre-fill time with current hour + 1 rounded within 07:00 - 21:00
  if (timeInput) {
    const now = new Date();
    let nextHour = now.getHours() + 1;
    if (nextHour < 7) nextHour = 7;
    if (nextHour > 21) nextHour = 21;
    timeInput.value = `${String(nextHour).padStart(2, '0')}:00`;
  }

  // --- 4. Form Validation Helper Functions ---
  const fields = {
    fullName: {
      input: document.getElementById('fullName'),
      error: document.getElementById('fullNameError'),
      validate: (val) => {
        if (!val.trim()) return 'Vui lòng nhập họ tên.';
        if (val.trim().length < 2) return 'Họ tên quá ngắn.';
        return '';
      }
    },
    phone: {
      input: document.getElementById('phone'),
      error: document.getElementById('phoneError'),
      validate: (val) => {
        const clean = val.replace(/\s+/g, '');
        if (!clean) return 'Vui lòng nhập số điện thoại.';
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        const simplePhoneRegex = /^[0-9]{9,11}$/;
        if (!phoneRegex.test(clean) && !simplePhoneRegex.test(clean)) {
          return 'Số điện thoại không hợp lệ (9–11 chữ số).';
        }
        return '';
      }
    },
    date: {
      input: document.getElementById('date'),
      error: document.getElementById('dateError'),
      validate: (val) => {
        if (!val) return 'Vui lòng chọn ngày.';
        return '';
      }
    },
    time: {
      input: document.getElementById('time'),
      error: document.getElementById('timeError'),
      validate: (val) => {
        if (!val) return 'Vui lòng chọn giờ.';
        const [hours, minutes] = val.split(':').map(Number);
        const timeInMin = hours * 60 + minutes;
        const openMin = 7 * 60; // 7:00
        const closeMin = 22 * 60; // 22:00
        if (timeInMin < openMin || timeInMin > closeMin) {
          return 'Giờ mở cửa quán là 7:00 – 22:00.';
        }
        return '';
      }
    },
    guests: {
      input: document.getElementById('guests'),
      error: document.getElementById('guestsError'),
      validate: (val) => {
        if (!val) return 'Vui lòng nhập số người.';
        const num = Number(val);
        if (isNaN(num) || num < 1 || num > 10) {
          return 'Số người phải từ 1 đến 10.';
        }
        return '';
      }
    }
  };

  // Clear error state on input change
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.input) {
      field.input.addEventListener('input', () => {
        field.input.classList.remove('is-invalid');
        if (field.error) field.error.textContent = '';
      });
    }
  });

  // --- 5. Form Submission ---
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;
      let firstInvalidInput = null;

      Object.keys(fields).forEach(key => {
        const field = fields[key];
        const errorMessage = field.validate(field.input.value);
        if (errorMessage) {
          hasError = true;
          field.input.classList.add('is-invalid');
          if (field.error) field.error.textContent = errorMessage;
          if (!firstInvalidInput) firstInvalidInput = field.input;
        } else {
          field.input.classList.remove('is-invalid');
          if (field.error) field.error.textContent = '';
        }
      });

      if (hasError) {
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      // Collect values
      const name = fields.fullName.input.value.trim();
      const guests = fields.guests.input.value;
      const date = fields.date.input.value;
      const time = fields.time.input.value;

      // Update success card
      if (bookingDetailText) {
        bookingDetailText.innerHTML = `Cảm ơn <strong>${escapeHtml(name)}</strong>! Hạt & Lửa đã ghi nhận đặt bàn cho <strong>${guests} người</strong> vào lúc <strong>${time}</strong> ngày <strong>${formatDate(date)}</strong>.`;
      }

      // Transition to success state
      bookingForm.hidden = true;
      if (bookingSuccess) {
        bookingSuccess.hidden = false;
        bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Reset Booking Form
  if (resetBookingBtn) {
    resetBookingBtn.addEventListener('click', () => {
      bookingForm.reset();
      // Re-trigger default values
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      if (dateInput) dateInput.value = `${yyyy}-${mm}-${dd}`;
      if (timeInput) timeInput.value = '09:00';

      bookingSuccess.hidden = true;
      bookingForm.hidden = false;
      fields.fullName.input.focus();
    });
  }

  // --- Utility Functions ---
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
});
