(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
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

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        autoplay();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        autoplay();
      });
    }

    show(0);
    autoplay();
  }

  function initCardFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var section = scope.closest(".content-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
      var search = scope.querySelector("[data-card-search]");
      var year = scope.querySelector("[data-card-year]");
      var type = scope.querySelector("[data-card-type]");

      function match(card) {
        var query = search ? search.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okYear = !yearValue || (card.getAttribute("data-year") || "").indexOf(yearValue) !== -1;
        var okType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
        return okQuery && okYear && okType;
      }

      function apply() {
        cards.forEach(function (card) {
          card.classList.toggle("is-hidden", !match(card));
        });
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = [movie.type, movie.year, movie.region].filter(Boolean).map(function (item) {
      return "<span>" + escapeHtml(item) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + escapeAttr(movie.href) + "\" class=\"poster-link\" aria-label=\"" + escapeAttr(movie.title) + "\">",
      "<span class=\"poster-frame\">",
      "<img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"type-pill\">" + escapeHtml(movie.type) + "</span>",
      "<span class=\"year-pill\">" + escapeHtml(movie.year) + "</span>",
      "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<a href=\"" + escapeAttr(movie.href) + "\" class=\"movie-title\">" + escapeHtml(movie.title) + "</a>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"card-tags\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function initGlobalSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = page.querySelector("[data-global-search]");
    var button = page.querySelector("[data-global-search-button]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var data = window.MOVIE_SEARCH_DATA;
      var matched = data.filter(function (movie) {
        if (!query) {
          return true;
        }
        return movie.searchText.indexOf(query) !== -1;
      }).slice(0, 80);
      if (!results) {
        return;
      }
      if (!matched.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
        return;
      }
      results.innerHTML = matched.map(renderSearchCard).join("");
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (button) {
      button.addEventListener("click", apply);
    }
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var message = shell.querySelector("[data-player-message]");
      var source = shell.getAttribute("data-src");
      var hls = null;
      if (!video || !source) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("is-visible");
        }
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.setAttribute("data-ready", "1");
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("播放暂时不可用，请稍后再试");
            }
          });
          video.setAttribute("data-ready", "1");
          return;
        }
        showMessage("当前浏览器暂不支持在线播放");
      }

      function playVideo() {
        attachSource();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            showMessage("点击视频画面即可继续播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function () {
          playVideo();
        });
      }

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      attachSource();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
