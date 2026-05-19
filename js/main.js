/* BeneDive.com — interactions UI minimales */
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

  // ----- Bubble decoration on hero ---------------------------------------
  var bubbles = document.querySelector('.bubbles');
  if (bubbles) {
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('span');
      var size = 6 + Math.random() * 22;
      b.style.width = b.style.height = size + 'px';
      b.style.left = (Math.random() * 100) + '%';
      b.style.animationDuration = (8 + Math.random() * 14) + 's';
      b.style.animationDelay = (Math.random() * 8) + 's';
      bubbles.appendChild(b);
    }
  }

  // ----- Smooth-scroll for in-page anchors -------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ----- Update copyright year -------------------------------------------
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
