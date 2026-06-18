(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        menuButton.textContent = open ? "×" : "☰";
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    });

    document.querySelectorAll(".search-scope").forEach(function (scope) {
      var input = scope.querySelector(".js-search-input");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .category-overview-card"));
      var filters = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var empty = scope.querySelector(".empty-state");
      var activeFilter = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var tags = (card.getAttribute("data-tags") || "").toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || tags.indexOf(activeFilter.toLowerCase()) !== -1 || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var showCard = matchQuery && matchFilter;
          card.hidden = !showCard;
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      filters.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          filters.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    });
  });
})();
