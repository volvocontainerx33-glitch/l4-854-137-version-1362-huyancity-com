(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function() {
        nav.classList.toggle('open');
        toggle.textContent = nav.classList.contains('open') ? '×' : '☰';
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      function show(next) {
        if (!slides.length) return;
        index = (next + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (prev) prev.addEventListener('click', function() { show(index - 1); });
      if (next) next.addEventListener('click', function() { show(index + 1); });
      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        });
      });
      setInterval(function() { show(index + 1); }, 5000);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
      var input = filterForm.querySelector('[data-search-input]');
      var yearSelect = filterForm.querySelector('[data-filter-year]');
      var typeSelect = filterForm.querySelector('[data-filter-type]');
      var regionSelect = filterForm.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      var empty = document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial && input) input.value = initial;

      function matchText(card, query) {
        if (!query) return true;
        return (card.getAttribute('data-search') || '').toLowerCase().indexOf(query) !== -1;
      }

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;
        cards.forEach(function(card) {
          var ok = matchText(card, query);
          if (ok && year) ok = card.getAttribute('data-year') === year;
          if (ok && type) ok = card.getAttribute('data-type') === type;
          if (ok && region) ok = card.getAttribute('data-region') === region;
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle('show', visible === 0);
      }

      ['input', 'change'].forEach(function(eventName) {
        filterForm.addEventListener(eventName, filter);
      });
      filterForm.addEventListener('submit', function(event) {
        if (filterForm.hasAttribute('data-filter-form')) {
          event.preventDefault();
          filter();
        }
      });
      filter();
    }
  });
})();
