(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

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

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    show(0);
    start();
  }

  function initSearchAndFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-item"));
      var empty = scope.querySelector("[data-empty]");
      var activeFilter = "all";

      if (!items.length) {
        return;
      }

      function itemText(item) {
        return [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-genre") || "",
          item.getAttribute("data-category") || "",
          item.textContent || ""
        ].join(" ").toLowerCase();
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        items.forEach(function (item) {
          var text = itemText(item);
          var itemCategory = item.getAttribute("data-category") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchFilter = activeFilter === "all" || itemCategory === activeFilter || text.indexOf(activeFilter) !== -1;
          var show = matchKeyword && matchFilter;
          item.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var message = player.parentElement ? player.parentElement.querySelector("[data-player-message]") : null;
      var stream = player.getAttribute("data-stream") || "";
      var attached = false;
      var instance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function attach() {
        if (attached || !video || !stream) {
          return;
        }

        attached = true;

        if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          instance.loadSource(stream);
          instance.attachMedia(video);
          instance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放暂时不可用，请稍后重试。");
            }
          });
          return;
        }

        video.src = stream;
      }

      function play() {
        if (!video) {
          return;
        }
        attach();
        var attempt = video.play();
        player.classList.add("is-playing");
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            setMessage("请再次点击播放。");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
            player.classList.remove("is-playing");
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          setMessage("");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            player.classList.remove("is-playing");
          }
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchAndFilters();
    initPlayers();
  });
})();
