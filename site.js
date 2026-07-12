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

// Lead popup — Grocery Bill Challenge + free Family Freezer Plan guide.
// Shows once per 7 days, after 60s on page or on exit intent (desktop).
// Skipped on survey/contact pages (they already capture leads).
(function () {
  var path = location.pathname;
  if (/survey\.html|contact\.html/.test(path)) return;
  var KEY = 'se_popup_ts', DONE = 'se_popup_done';
  try {
    if (localStorage.getItem(DONE)) return;
    var ts = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (ts && (Date.now() - ts) < 7 * 24 * 3600 * 1000) return;
  } catch (e) { return; }

  var BOOK = 'https://links.thinkrr.ai/widget/booking/PTESF2YVJpmEamD4VFZ0';
  var GUIDE = 'assets/Shopease_Family_Freezer_Plan.pdf';
  var API = 'https://shopease-web-uwyl.onrender.com/api/public/contact';
  var shown = false, readyAt = Date.now() + 15000;

  function build() {
    var ov = document.createElement('div');
    ov.className = 'sepop-overlay';
    ov.innerHTML =
      '<div class="sepop" role="dialog" aria-modal="true" aria-label="An offer from Shopease Foods">' +
      '<button class="sepop-close" aria-label="Close">&times;</button>' +
      '<p class="eyebrow">The Full Freezer Guarantee</p>' +
      '<h3>Your first order comes with $100 off. Consider this your invitation.</h3>' +
      '<p>You pick every item. Priced to your budget in writing before you spend a dollar. Loved by your family or we replace it. Price locked three years. Complete the free consult and your <strong>$100 New Family Credit</strong> is applied to your first order.</p>' +
      '<div class="sepop-ctas">' +
      '<a class="btn btn-gold" href="' + BOOK + '">Book My Free Consult</a>' +
      '<a class="btn btn-ghost" href="survey.html">Take the 2-Minute Survey</a>' +
      '</div>' +
      '<div class="sepop-div">or grab the free guide</div>' +
      '<form class="sepop-form" novalidate>' +
      '<input type="text" name="hp" style="display:none" tabindex="-1" autocomplete="off">' +
      '<input type="text" name="name" placeholder="Your name" required>' +
      '<input type="tel" name="phone" placeholder="Phone" required>' +
      '<input type="email" name="email" placeholder="Email (optional)">' +
      '<label class="chk"><input type="checkbox" name="c1" required> You can text or email me about my request. (Required)</label>' +
      '<label class="chk"><input type="checkbox" name="c2"> Send me occasional offers and tips. Unsubscribe anytime.</label>' +
      '<button class="btn btn-gold" type="submit">Send Me the Family Freezer Plan</button>' +
      '<p class="sepop-note">Free PDF guide. New families only, one credit per household. Shopease Foods Inc., Peterborough ON.</p>' +
      '</form></div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add('show'); });
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}

    function close() { ov.classList.remove('show'); setTimeout(function(){ ov.remove(); }, 300); }
    ov.querySelector('.sepop-close').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });

    ov.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      if (f.hp.value) return;
      if (!f.name.value.trim() || !f.phone.value.trim() || !f.c1.checked) {
        f.reportValidity(); return;
      }
      var parts = f.name.value.trim().split(/\s+/);
      var payload = {
        first_name: parts.shift() || '',
        last_name: parts.join(' '),
        phone: f.phone.value.trim(),
        email: f.email.value.trim(),
        postal: '',
        message: 'Website popup: claimed the $100 New Family Credit and requested The Family Freezer Plan guide.',
        consent_nonmkt: true,
        consent_mkt: !!f.c2.checked
      };
      fetch(API, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }).catch(function(){});
      try { localStorage.setItem(DONE, '1'); } catch (err) {}
      var box = ov.querySelector('.sepop');
      box.innerHTML =
        '<button class="sepop-close" aria-label="Close">&times;</button>' +
        '<p class="eyebrow">You\u2019re all set</p>' +
        '<h3>Here\u2019s your Family Freezer Plan.</h3>' +
        '<p>Your $100 New Family Credit is noted, and a Food Planner will confirm it when they reach out. The guide is yours either way:</p>' +
        '<div class="sepop-ctas">' +
        '<a class="btn btn-gold" href="' + GUIDE + '" target="_blank" rel="noopener">Download the Guide (PDF)</a>' +
        '<a class="btn btn-ghost" href="survey.html">Take the 2-Minute Survey</a>' +
        '</div>';
      box.querySelector('.sepop-close').addEventListener('click', close);
    });
  }

  function trigger() { if (!shown) { shown = true; build(); } }
  setTimeout(trigger, 60000);
  document.addEventListener('mouseout', function (e) {
    if (Date.now() < readyAt) return;
    if (!e.relatedTarget && e.clientY <= 0) trigger();
  });
})();
