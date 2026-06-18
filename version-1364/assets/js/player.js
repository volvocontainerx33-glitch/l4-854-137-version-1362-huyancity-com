function initMoviePlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var loaded = false;
  var hls = null;

  if (!video || !button || !streamUrl) {
    return;
  }

  function showButton() {
    button.classList.remove('is-hidden');
  }

  function hideButton() {
    button.classList.add('is-hidden');
  }

  function attemptPlay() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showButton();
      });
    }
  }

  function load() {
    if (loaded) {
      attemptPlay();
      return;
    }

    loaded = true;
    hideButton();

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      attemptPlay();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        attemptPlay();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          hls = null;
          loaded = false;
          showButton();
        }
      });
      return;
    }

    video.src = streamUrl;
    attemptPlay();
  }

  button.addEventListener('click', load);

  video.addEventListener('click', function () {
    if (video.paused) {
      load();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideButton);
  video.addEventListener('ended', showButton);
}
