(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
    var prev = slider.querySelector('[data-slider-prev]');
    var next = slider.querySelector('[data-slider-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        play();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  });

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards(input) {
    var scope = input.closest('main') || document;
    var keyword = normalize(input.value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.local-search-input'));

  searchInputs.forEach(function (input) {
    if (query && input.id === 'searchInput') {
      input.value = query;
    }

    filterCards(input);
    input.addEventListener('input', function () {
      filterCards(input);
    });
  });
})();
