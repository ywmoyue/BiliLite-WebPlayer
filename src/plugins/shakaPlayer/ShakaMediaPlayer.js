class ShakaMediaPlayer {
  constructor(elementRef, mediaType, shakaPlayer, config) {
    this.elementRef = elementRef;
    this.mediaType = mediaType;
    this.shakaPlayer = shakaPlayer;

    this.config = config;
    this.isEnabled = true;
    this.currentPlaybackRate = 1.0;
    this.loaded = false;
    this.loadedCallback = null;
    this.handleLoadedDataBind = this.handleLoadedData.bind(this);
  }

  async init(mediaData, loadedCallback = null) {
    if (!mediaData.url) {
      this.isEnabled = false;
      if (loadedCallback) loadedCallback();
      return;
    }

    this.loadedCallback = loadedCallback;
    this.elementRef.value.addEventListener(
      "loadeddata",
      this.handleLoadedDataBind
    );

    await this.shakaPlayer.attach(this.elementRef.value);
    this.shakaPlayer.configure(this.config);
    this.shakaPlayer.addEventListener("error", this.onErrorEvent);

    try {
      await this.shakaPlayer.load(mediaData.url, null, mediaData.contentType);
      console.log(`The ${this.mediaType} has now been loaded!`);
    } catch (e) {
      this.onError(e);
    }
  }

  handleLoadedData() {
    this.loaded = true;
    if (this.loadedCallback) {
      this.loadedCallback();
    }
  }

  dispose() {
    try {
      this.elementRef.value.removeEventListener(
        "loadeddata",
        this.handleLoadedDataBind
      );
      this.loadedCallback = null;
    } catch (ex) {
      console.warn(ex);
    }
  }

  onErrorEvent = (event) => {
    this.onError(event.detail);
  };

  onError(error) {
    console.error("Error code", error.code, "object", error);
  }

  setCurrentTime(time) {
    this.elementRef.value.currentTime = time;
  }

  getCurrentTime() {
    return this.elementRef.value.currentTime;
  }

  setPlaybackRate(rate) {
    this.currentPlaybackRate = rate;
    this.elementRef.value.playbackRate = rate;
  }

  getPlaybackRate() {
    return this.elementRef.value.playbackRate;
  }

  play() {
    this.elementRef.value.play();
  }

  pause() {
    this.elementRef.value.pause();
  }

  setVolume(volume) {
    this.elementRef.value.volume = volume;
  }

  getVolume() {
    return this.elementRef.value.volume;
  }

  getStats() {
    const stats = this.shakaPlayer.getStats();
    return {
      width: stats.width,
      height: stats.height,
      decodedFrames: stats.decodedFrames,
      droppedFrames: stats.droppedFrames,
    };
  }
}

export default ShakaMediaPlayer;
