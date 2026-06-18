(function () {
  var HLS_CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.20/hls.min.js'
  ];

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureHls() {
    if (window.Hls) {
      return window.Hls;
    }

    for (var index = 0; index < HLS_CDN_URLS.length; index += 1) {
      try {
        await loadScript(HLS_CDN_URLS[index]);
        if (window.Hls) {
          return window.Hls;
        }
      } catch (error) {
      }
    }

    return null;
  }

  function setStatus(container, message) {
    var status = container.querySelector('[data-player-status]');

    if (status) {
      status.textContent = message;
    }
  }

  async function attachSource(container, video, source) {
    if (!source) {
      setStatus(container, '暂时无法播放，请稍后重试。');
      return false;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      return true;
    }

    var Hls = await ensureHls();

    if (Hls && Hls.isSupported()) {
      return new Promise(function (resolve) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve(true);
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus(container, '暂时无法播放，请稍后重试。');
            hls.destroy();
            resolve(false);
          }
        });

        video._hlsInstance = hls;
      });
    }

    video.src = source;
    video.load();
    return true;
  }

  function setupPlayer(container) {
    var video = container.querySelector('video[data-src]');
    var button = container.querySelector('.player-start');

    if (!video || !button) {
      return;
    }

    async function start() {
      button.disabled = true;
      setStatus(container, '正在准备播放...');

      var attached = await attachSource(container, video, video.getAttribute('data-src'));

      if (!attached) {
        button.disabled = false;
        return;
      }

      container.classList.add('is-ready');

      try {
        await video.play();
      } catch (error) {
        setStatus(container, '请再次点击视频播放。');
      }
    }

    button.addEventListener('click', start, { once: true });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
}());
