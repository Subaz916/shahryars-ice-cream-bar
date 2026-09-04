/* ══════════════════════════════════════════════════
   Shahryar's Ice Cream Bar — Script
   ══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Preloader ── */
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => preloader.classList.add('hidden');
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 300);
  } else {
    window.addEventListener('load', () => setTimeout(hidePreloader, 300));
  }
  setTimeout(hidePreloader, 2500);

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const updateActiveNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ── Mobile menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  const closeMobileMenu = () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  };

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });

  /* ── Scroll reveal ── */
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ── Staggered reveal for grid children ── */
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, i) => {
          child.style.transitionDelay = `${i * 80}ms`;
          child.classList.add('revealed');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  staggerContainers.forEach(el => staggerObserver.observe(el));

  /* ── Scroll-to-top ── */
  const toTopBtn = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    toTopBtn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Floating contact toggle ── */
  const fabWrap = document.getElementById('fabWrap');
  const fabToggle = document.getElementById('fabToggle');
  fabToggle.addEventListener('click', () => {
    fabWrap.classList.toggle('open');
  });
  fabWrap.querySelectorAll('.fab-act').forEach(act => {
    act.addEventListener('click', () => {
      fabWrap.classList.remove('open');
    });
  });

  /* ── Menu card hover tilt ── */
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      card.style.transform = `translateY(-3px) perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Counter animation ── */
  const counterElements = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));

  /* ── Parallax on hero blobs ── */
  const blobs = document.querySelectorAll('.hero-blobs .blob');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    blobs.forEach((blob, i) => {
      const speed = (i + 1) * 0.04;
      blob.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });

  /* ── Subtle parallax on hero photo ── */
  const heroShot = document.querySelector('.hero-shot img');
  if (heroShot) {
    window.addEventListener('scroll', () => {
      heroShot.style.transform = `translateY(${window.scrollY * 0.06}px) scale(1.05)`;
    }, { passive: true });
  }

  /* ── Highlight today's day pill (Asia/Karachi) ── */
  const pills = document.querySelectorAll('#dayPills li');
  if (pills.length) {
    const DAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      weekday: 'short'
    }).format(new Date());
    const today = DAYS[weekday];
    pills.forEach(li => {
      li.classList.toggle('today', parseInt(li.dataset.day, 10) === today);
    });
  }

  /* ── Reviews carousel ── */
  const carouselViewport = document.getElementById('reviewsViewport');
  const carouselTrack = document.getElementById('reviewsTrack');
  if (carouselViewport && carouselTrack) {
    const cardsArr = Array.from(carouselTrack.children);
    const baseGap = 24;
    const prevBtn = document.getElementById('revPrev');
    const nextBtn = document.getElementById('revNext');
    const dotsWrap = document.getElementById('revDots');

    let index = 0;
    let perView = 3;
    let maxIndex = 0;
    let cardW = 340;
    let timer = null;
    let resizing = null;

    const getGap = () => {
      const style = window.getComputedStyle(carouselTrack);
      const raw = style.columnGap || style.gap;
      const parsed = parseFloat(raw);
      return isNaN(parsed) ? baseGap : parsed;
    };

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
        dot.addEventListener('click', () => {
          index = i;
          render(true);
          restartTimer();
        });
        dotsWrap.appendChild(dot);
      }
      updateDots();
    };

    const updateDots = () => {
      const dots = dotsWrap.children;
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === index);
      }
    };

    const render = (animate) => {
      const gap = getGap();
      carouselTrack.style.transition = animate ? '' : 'none';
      carouselTrack.style.transform = `translateX(-${index * (cardW + gap)}px)`;
      updateDots();
    };

    const setup = () => {
      const gap = getGap();
      const available = carouselViewport.clientWidth;
      perView = available < 620 ? 1 : available < 980 ? 2 : 3;
      perView = Math.min(perView, cardsArr.length);
      cardW = (available - gap * (perView - 1)) / perView;
      cardsArr.forEach(c => { c.style.width = `${cardW}px`; });
      maxIndex = cardsArr.length - perView;
      index = Math.min(index, maxIndex);
      buildDots();
      render(false);
    };

    const restartTimer = () => {
      if (timer) { clearInterval(timer); }
      timer = setInterval(advance, 4000);
    };

    const advance = () => {
      if (index < maxIndex) {
        index++;
        render(true);
      } else {
        carouselTrack.classList.add('is-fading');
        setTimeout(() => {
          index = 0;
          render(false);
          carouselTrack.classList.remove('is-fading');
          updateDots();
        }, 360);
      }
    };

    const back = () => {
      if (index > 0) {
        index--;
        render(true);
      } else {
        carouselTrack.classList.add('is-fading');
        setTimeout(() => {
          index = maxIndex;
          render(false);
          carouselTrack.classList.remove('is-fading');
          updateDots();
        }, 360);
      }
    };

    prevBtn.addEventListener('click', () => { back(); restartTimer(); });
    nextBtn.addEventListener('click', () => { advance(); restartTimer(); });

    carouselViewport.addEventListener('mouseenter', () => { if (timer) { clearInterval(timer); timer = null; } });
    carouselViewport.addEventListener('mouseleave', restartTimer);
    carouselViewport.addEventListener('touchstart', () => { if (timer) { clearInterval(timer); timer = null; } }, { passive: true });
    carouselViewport.addEventListener('touchend', restartTimer, { passive: true });

    window.addEventListener('resize', () => {
      clearTimeout(resizing);
      resizing = setTimeout(setup, 120);
    });

    setup();
    restartTimer();
  }

});