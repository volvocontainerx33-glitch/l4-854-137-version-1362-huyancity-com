(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function openMenu() {
    var button = qs("[data-menu-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function bindFilters() {
    var scope = qs("[data-filter-scope]");
    if (!scope) return;
    var input = qs("[data-filter-input]", scope);
    var year = qs("[data-filter-year]", scope);
    var region = qs("[data-filter-region]", scope);
    var cards = qsa("[data-card]", scope);

    function apply() {
      var word = normalize(input && input.value);
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        var passWord = !word || haystack.indexOf(word) !== -1;
        var passYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var passRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        card.classList.toggle("card-hidden", !(passWord && passYear && passRegion));
      });
    }

    [input, year, region].forEach(function (item) {
      if (item) item.addEventListener("input", apply);
      if (item) item.addEventListener("change", apply);
    });
  }

  function initPlayer() {
    var box = qs("[data-player]");
    if (!box) return;
    var video = qs("video", box);
    var overlay = qs(".player-overlay", box);
    var stream = box.getAttribute("data-stream");
    var attached = false;
    if (!video || !stream) return;

    function attach() {
      if (attached) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      video.controls = true;
      if (overlay) overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    }

    if (overlay) overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached) play();
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<a class="movie-card" href="./' + item.file + '" data-card data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-region="' + escapeHtml(item.region) + '" data-genre="' + escapeHtml(item.genre) + '">',
      '<span class="poster-wrap">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-play">▶</span>',
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '</span>',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<span class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</span>',
      '<span class="card-tags">' + tags + '</span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initSearch() {
    var results = qs("[data-search-results]");
    var input = qs("[data-search-box]");
    var form = qs("[data-search-form]");
    if (!results || !input || !window.SEARCH_INDEX) return;

    function params() {
      return new URLSearchParams(window.location.search);
    }

    function setQuery(value) {
      var url = new URL(window.location.href);
      if (value) url.searchParams.set("q", value);
      else url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    }

    function render() {
      var query = normalize(input.value);
      var items = window.SEARCH_INDEX.filter(function (item) {
        if (!query) return true;
        return normalize([
          item.title,
          item.oneLine,
          item.region,
          item.type,
          item.genre,
          (item.tags || []).join(" ")
        ].join(" ")).indexOf(query) !== -1;
      });
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有匹配到相关影片</div>';
        return;
      }
      results.innerHTML = '<div class="movie-grid">' + items.map(cardTemplate).join("") + '</div>';
    }

    input.value = params().get("q") || "";
    render();
    input.addEventListener("input", function () {
      setQuery(input.value.trim());
      render();
    });
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        setQuery(input.value.trim());
        render();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    openMenu();
    bindFilters();
    initPlayer();
    initSearch();
  });
})();
