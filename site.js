// Shopease Foods — minimal site JS (no dependencies)
(function () {
  // Flag JS availability — reveal-on-scroll styles only apply under html.js
  document.documentElement.classList.add('js');

  // Mobile nav
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // Header shadow on scroll
  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  // Scroll reveal — auto-tag the building blocks of every section, then
  // fade them up as they enter the viewport. Card grids reveal child-by-child
  // with a gentle stagger. Degrades to fully visible without JS or with
  // reduced motion (see styles.css).
  if ('IntersectionObserver' in window) {
    var GRIDS = '.cards6, .promises, .orders3, .steps, .reviews, .survey-points';
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    function reveal(el) { el.classList.add('reveal'); io.observe(el); }

    var blocks = document.querySelectorAll(
      '.section .wrap > *, .truststrip-in, .hero-copy, .hero-photo'
    );
    blocks.forEach(function (el) {
      if (el.matches && el.matches(GRIDS)) {
        // Stagger the cards inside the grid instead of fading the whole row at once.
        var kids = el.children, i;
        for (i = 0; i < kids.length; i++) {
          kids[i].style.setProperty('--rd', (Math.min(i, 6) * 70) + 'ms');
          reveal(kids[i]);
        }
      } else {
        reveal(el);
      }
    });
  }

  // Scroll-spy — highlight the nav link for the section currently in view.
  if ('IntersectionObserver' in window) {
    var navAnchors = [].slice.call(
      document.querySelectorAll('.nav-links > a[href^="#"]:not(.btn)')
    );
    var byId = {};
    navAnchors.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id) byId[id] = a;
    });
    var sections = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navAnchors.forEach(function (a) { a.classList.remove('active'); });
            var a = byId[entry.target.id];
            if (a) a.classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

})();
