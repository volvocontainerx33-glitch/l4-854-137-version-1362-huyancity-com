(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dots] button'));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('is-active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      dots[index].classList.add('is-active');
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function uniqueValues(cards, attr) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attr) || '';
      value = value.trim();
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return b.localeCompare(a, 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var area = document.querySelector('[data-filter-area]');
    var list = document.querySelector('[data-card-list]');
    if (!area || !list) {
      return;
    }
    var input = area.querySelector('[data-filter-input]');
    var region = area.querySelector('[data-filter-region]');
    var type = area.querySelector('[data-filter-type]');
    var year = area.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    fillSelect(region, uniqueValues(cards, 'data-region'));
    fillSelect(type, uniqueValues(cards, 'data-type'));
    fillSelect(year, uniqueValues(cards, 'data-year'));

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && input) {
      input.value = initial;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          ok = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          ok = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [input, region, type, year].forEach(function (el) {
      if (!el) {
        return;
      }
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
