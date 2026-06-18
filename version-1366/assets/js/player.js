(function() {
  function initPlayer() {
    var shell = document.querySelector('[data-player]');
    if (!shell || typeof videoSource === 'undefined') return;
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video) return;
      if (started) {
        video.play().catch(function() {});
        return;
      }
      started = true;
      if (cover) cover.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSource;
        video.addEventListener('loadedmetadata', function() {
          video.play().catch(function() {});
        }, { once: true });
        video.load();
      } else if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(videoSource);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
      } else {
        video.src = videoSource;
        video.play().catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
      var button = cover.querySelector('button');
      if (button) {
        button.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }
    }
    if (video) {
      video.addEventListener('click', function() {
        if (!started) start();
      });
    }
  }

  if (document.readyState !== 'loading') {
    initPlayer();
  } else {
    document.addEventListener('DOMContentLoaded', initPlayer);
  }
})();
