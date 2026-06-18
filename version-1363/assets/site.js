(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function render(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        render(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        render(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        restart();
      });
    }

    render(0);
    restart();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupFiltering() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var input = panel.querySelector('[data-search-input]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-chip]'));
      var result = panel.querySelector('[data-result-count]');
      var activeChip = '全部';

      function cards() {
        return Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      }

      function searchableText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var chip = normalize(activeChip);
        var visible = 0;
        var allCards = cards();

        allCards.forEach(function (card) {
          var text = searchableText(card);
          var queryMatch = !query || text.indexOf(query) !== -1;
          var chipMatch = chip === '全部' || !chip || text.indexOf(chip) !== -1;
          var shouldShow = queryMatch && chipMatch;

          card.classList.toggle('is-hidden', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = visible === allCards.length ? '' : '筛选结果已更新';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chipButton) {
        chipButton.addEventListener('click', function () {
          activeChip = chipButton.getAttribute('data-filter-chip') || '全部';
          chips.forEach(function (button) {
            button.classList.toggle('is-active', button === chipButton);
          });
          apply();
        });
      });

      if (chips[0]) {
        chips[0].classList.add('is-active');
      }

      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFiltering();
  });
}());
