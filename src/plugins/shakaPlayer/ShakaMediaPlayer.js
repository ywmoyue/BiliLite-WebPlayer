class ShakaMediaPlayer {
  constructor(elementRef, mediaType, shakaPlayer, config) {
    this.elementRef = elementRef;
    this.mediaType = mediaType;
    this.shakaPlayer = shakaPlayer;
    this.config = config;
    this.isEnabled = true;
    this.currentPlaybackRate = 1.0;
  }

  async init(mediaData) {
    if (!mediaData.url) {
      this.isEnabled = false;
      return;
    }

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
}

export default ShakaMediaPlayer