(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("form[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        if (value) {
          window.location.href = action + "?q=" + encodeURIComponent(value);
        } else {
          window.location.href = action;
        }
      });
    });
  }

  function currentQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-play">▶</span>',
      '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
      '</a>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<div class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</div>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var input = document.getElementById("site-search-page-input");
    var results = document.getElementById("site-search-results");
    var status = document.getElementById("site-search-status");
    if (!input || !results || !status || !window.SEARCH_MOVIES) {
      return;
    }
    input.value = currentQuery();
    function render() {
      var q = input.value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        if (!q) {
          return true;
        }
        return [movie.title, movie.region, movie.genre, movie.year, movie.tags, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(q) !== -1;
      });
      status.textContent = q ? "搜索结果" : "精选片库";
      results.innerHTML = list.slice(0, 120).map(movieCard).join("");
      if (!list.length) {
        results.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
      }
    }
    input.addEventListener("input", render);
    render();
  }

  function initCategoryFilter() {
    var root = document.querySelector("[data-category-filter]");
    if (!root) {
      return;
    }
    var keyword = root.querySelector("[data-filter-keyword]");
    var region = root.querySelector("[data-filter-region]");
    var year = root.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
        var visible = true;
        if (q && text.indexOf(q) === -1) {
          visible = false;
        }
        if (r && card.dataset.region !== r) {
          visible = false;
        }
        if (y && card.dataset.year !== y) {
          visible = false;
        }
        card.style.display = visible ? "" : "none";
      });
    }
    [keyword, region, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  function buildPlayer(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  }

  function initPlayer(source) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var cover = document.querySelector("[data-player-cover]");
      var button = document.querySelector("[data-player-button]");
      if (!video || !source) {
        return;
      }
      var loaded = false;
      function start() {
        if (!loaded) {
          buildPlayer(video, source);
          loaded = true;
        }
        if (cover) {
          cover.classList.add("hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", start);
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  window.MovieSite = {
    player: initPlayer
  };

  ready(function () {
    initMenu();
    initSearchForms();
    initSearchPage();
    initCategoryFilter();
  });
}());
