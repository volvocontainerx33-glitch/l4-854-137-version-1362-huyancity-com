(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var shell = document.querySelector("[data-hero]");
        if (!shell) {
            return;
        }
        var slides = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-dot]"));
        var prev = shell.querySelector("[data-hero-prev]");
        var next = shell.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        shell.addEventListener("mouseenter", stop);
        shell.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initLocalFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!inputs.length && !region && !year)) {
            return;
        }

        function apply() {
            var query = inputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean).join(" ");
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-title") || "";
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    ok = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        if (region) {
            region.addEventListener("change", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    function cardHtml(movie) {
        return [
            '<a class="movie-card" href="', movie.url, '">',
            '<span class="poster-wrap">',
            '<img src="', movie.cover, '" alt="', escapeHtml(movie.title), '" loading="lazy">',
            '<span class="poster-type">', escapeHtml(movie.type), '</span>',
            '<span class="poster-year">', escapeHtml(movie.year), '</span>',
            '<span class="poster-play">▶</span>',
            '</span>',
            '<span class="card-body">',
            '<strong>', escapeHtml(movie.title), '</strong>',
            '<em>', escapeHtml(movie.oneLine), '</em>',
            '<span class="card-meta">', escapeHtml(movie.region), ' · ', escapeHtml(movie.genre), '</span>',
            '</span>',
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

    function initGlobalSearch() {
        var input = document.querySelector("[data-global-search]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-global-empty]");
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }

        function render(list) {
            results.innerHTML = list.map(cardHtml).join("");
            if (empty) {
                empty.classList.toggle("show", list.length === 0);
            }
        }

        function apply() {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                render(window.SEARCH_MOVIES.slice(0, 36));
                if (empty) {
                    empty.classList.remove("show");
                }
                return;
            }
            var words = query.split(/\s+/).filter(Boolean);
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return words.every(function (word) {
                    return movie.text.indexOf(word) !== -1;
                });
            }).slice(0, 120);
            render(matched);
        }

        input.addEventListener("input", apply);
        apply();
    }

    window.initMoviePlayer = function (src) {
        var video = document.getElementById("movie-video");
        var cover = document.getElementById("player-cover");
        if (!video || !src) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    maxBufferLength: 30
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function start() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initLocalFilters();
        initGlobalSearch();
    });
})();
