/* ============================================================
   MUDENG — Open Recruitment 2026
   Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ===== Intro Loader (hanya berjalan 1x per sesi browser) =====
  //
  // Alur logika:
  // 1. Halaman divisi (tanpa elemen #introLoader):
  //    → Langsung set sessionStorage agar intro tidak muncul saat
  //      pindah ke halaman beranda nanti.
  //
  // 2. Halaman beranda, SUDAH pernah dikunjungi (sessionStorage ada):
  //    → Inline script di index.html sudah menyembunyikan loader
  //      dengan display:none. Di sini kita hapus elemennya dari DOM.
  //
  // 3. Halaman beranda, PERTAMA KALI dikunjungi (sessionStorage kosong):
  //    → Jalankan animasi liquid fill, lalu fade out.
  //    → Simpan flag ke sessionStorage segera agar navigasi keluar
  //      di tengah animasi tidak menyebabkan replay.
  //
  function handleIntroLoader() {
    var loader = document.getElementById('introLoader');
    var alreadyPlayed = sessionStorage.getItem('mudeng_intro_played');

    // --- Skenario 1: Tidak ada loader (halaman divisi) ---
    if (!loader) {
      // Tandai sesi agar intro di beranda tidak muncul
      if (!alreadyPlayed) {
        sessionStorage.setItem('mudeng_intro_played', 'true');
      }
      return;
    }

    // --- Skenario 2: Loader ada, tapi sudah pernah diputar ---
    if (alreadyPlayed) {
      // Inline script sudah menyembunyikan via display:none,
      // sekarang hapus dari DOM sepenuhnya
      loader.remove();
      return;
    }

    // --- Skenario 3: Pertama kali — putar animasi intro ---
    // Set flag SEGERA sebelum animasi selesai, supaya jika user
    // menavigasi keluar saat animasi masih berjalan, intro
    // tidak akan muncul lagi di kunjungan berikutnya
    sessionStorage.setItem('mudeng_intro_played', 'true');

    // Buat efek tetesan liquid
    function createDrips() {
      var wrapper = loader.querySelector('.liquid-text-wrapper');
      if (!wrapper) return;
      var rect = wrapper.getBoundingClientRect();
      for (var i = 0; i < 8; i++) {
        var drip = document.createElement('div');
        drip.className = 'liquid-drip';
        drip.style.left = (rect.left + Math.random() * rect.width) + 'px';
        drip.style.top = (rect.top + rect.height * 0.6 + Math.random() * 20) + 'px';
        drip.style.animationDelay = (0.8 + Math.random() * 1.2) + 's';
        drip.style.width = (3 + Math.random() * 3) + 'px';
        drip.style.height = drip.style.width;
        loader.appendChild(drip);
      }
    }

    setTimeout(createDrips, 600);

    // Fade out setelah animasi selesai (~2.8 detik)
    setTimeout(function () {
      loader.classList.add('fade-out');
      loader.addEventListener('transitionend', function () {
        loader.remove();
      });
    }, 2800);
  }

  // ===== Mobile Menu =====
  function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');

    if (!menuToggle || !mobileMenu) return;

    let menuOpen = false;

    function closeMobileMenu() {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      if (bar1) bar1.style.transform = '';
      if (bar2) bar2.style.opacity = '';
      if (bar3) {
        bar3.style.transform = '';
        bar3.style.width = '';
        bar3.style.marginLeft = '';
      }
    }

    menuToggle.addEventListener('click', function () {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      if (menuOpen) {
        bar1.style.transform = 'rotate(45deg) translateY(8px)';
        bar2.style.opacity = '0';
        bar3.style.transform = 'rotate(-45deg) translateY(-8px)';
        bar3.style.width = '1.5rem';
        bar3.style.marginLeft = '0';
      } else {
        closeMobileMenu();
      }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Expose close function for modal
    window._closeMobileMenu = closeMobileMenu;
    window._isMobileMenuOpen = function () { return menuOpen; };
  }

  // ===== Mobile Divisi Dropdown =====
  window.toggleMobileDivisi = function () {
    var list = document.getElementById('mobileDivisiList');
    var arrow = document.getElementById('mobileDivisiArrow');
    if (!list || !arrow) return;
    if (list.style.maxHeight === '0px' || list.style.maxHeight === '') {
      list.style.maxHeight = '500px';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      list.style.maxHeight = '0px';
      arrow.style.transform = '';
    }
  };

  // ===== Modal =====
  window.openModal = function () {
    var modal = document.getElementById('registrationModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Close mobile menu if open
    if (window._isMobileMenuOpen && window._isMobileMenuOpen()) {
      window._closeMobileMenu();
    }
  };

  window.closeModal = function () {
    var modal = document.getElementById('registrationModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeModal();
  });

  // ===== Scroll Animations (Intersection Observer) =====
  function initScrollAnimations() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-up, .timeline-item').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== Navbar Active State =====
  function initNavbarActiveState() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY + 100;
      sections.forEach(function (section) {
        var top = section.offsetTop;
        var height = section.offsetHeight;
        var id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(function (link) {
            link.classList.remove('text-white', 'bg-white/5');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('text-white', 'bg-white/5');
            }
          });
        }
      });
    });
  }

  // ===== Floating Particles =====
  function createParticles() {
    var container = document.getElementById('particles');
    if (!container) return;
    var colors = ['rgba(108,79,255,0.35)', 'rgba(9, 230, 145, 0.25)', 'rgba(152, 143, 253, 0.25)'];
    for (var i = 0; i < 20; i++) {
      var particle = document.createElement('div');
      particle.classList.add('particle');
      var size = Math.random() * 6 + 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.bottom = '-10px';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 15) + 's';
      container.appendChild(particle);
    }
  }

  // ===== Parallax Scroll Effect =====
  function initParallax() {
    var parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    var ticking = false;

    function updateParallax() {
      var scrollY = window.scrollY;
      parallaxElements.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var rect = el.getBoundingClientRect();
        var elementCenter = rect.top + rect.height / 2;
        var windowCenter = window.innerHeight / 2;
        var offset = (elementCenter - windowCenter) * speed;
        el.style.transform = 'translateY(' + offset + 'px)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });

    // Initial call
    updateParallax();
  }

  // ===== Timeline Progress Line =====
  function initTimelineProgress() {
    var timelineLine = document.querySelector('.timeline-line-fill');
    var timelineContainer = document.querySelector('.timeline-container');
    if (!timelineLine || !timelineContainer) return;

    var ticking = false;

    function updateTimeline() {
      var rect = timelineContainer.getBoundingClientRect();
      var windowHeight = window.innerHeight;
      var containerTop = rect.top;
      var containerHeight = rect.height;

      // Calculate how far we've scrolled through the timeline
      var scrollProgress = (windowHeight - containerTop) / (containerHeight + windowHeight);
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));

      timelineLine.style.height = (scrollProgress * 100) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateTimeline);
        ticking = true;
      }
    });

    // Initial call
    updateTimeline();
  }

  // ===== Smooth Counter Animation for Stats =====
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-counter'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 1500;
          var start = 0;
          var startTime = null;

          function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            var progress = Math.min((currentTime - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            var current = Math.floor(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = target + suffix;
            }
          }

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  // ===== Initialize Everything =====
  function init() {
    initMobileMenu();
    initScrollAnimations();
    initNavbarActiveState();
    createParticles();
    initParallax();
    initTimelineProgress();
    initCounters();
  }

  // Run init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Run intro loader on window load (for font/asset dependency)
  window.addEventListener('load', handleIntroLoader);

})();
