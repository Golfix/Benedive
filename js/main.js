/* BeneDive.com — interactions UI */
(function () {
  'use strict';

  // ----- Mobile nav toggle ------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----- Particules flottantes (hero v2) ---------------------------------
  var particles = document.querySelector('.particles');
  if (particles) {
    for (var i = 0; i < 22; i++) {
      var s = document.createElement('span');
      var size = 2 + Math.random() * 5;
      s.style.width = s.style.height = size + 'px';
      s.style.left = (Math.random() * 100) + '%';
      s.style.animationDuration = (10 + Math.random() * 16) + 's';
      s.style.animationDelay = (Math.random() * 10) + 's';
      s.style.opacity = (.2 + Math.random() * .6).toFixed(2);
      particles.appendChild(s);
    }
  }

  // ----- Bulle hero legacy (autres pages) --------------------------------
  var bubbles = document.querySelector('.bubbles');
  if (bubbles) {
    for (var j = 0; j < 14; j++) {
      var b = document.createElement('span');
      var sz = 6 + Math.random() * 22;
      b.style.width = b.style.height = sz + 'px';
      b.style.left = (Math.random() * 100) + '%';
      b.style.animationDuration = (8 + Math.random() * 14) + 's';
      b.style.animationDelay = (Math.random() * 8) + 's';
      bubbles.appendChild(b);
    }
  }

  // ----- Smooth scroll ---------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ----- Scroll reveal (IntersectionObserver) ----------------------------
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    // fallback : tout visible
    reveals.forEach(function (r) { r.classList.add('is-visible'); });
  }

  // ----- Counters animés -------------------------------------------------
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    var formatNum = function (n, suffix) {
      var s = Math.round(n).toLocaleString('fr-FR');
      return s + (suffix || '');
    };
    var animate = function (el) {
      var target = parseFloat(el.dataset.counter);
      var suffix = el.dataset.suffix || '';
      var duration = 1400;
      var startTime = null;
      var step = function (ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatNum(eased * target, suffix);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animate(en.target);
          io2.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io2.observe(c); });
  }

  // ----- Marquee : duplicate content for seamless loop -------------------
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  });

  // ----- Année dynamique -------------------------------------------------
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

})();
