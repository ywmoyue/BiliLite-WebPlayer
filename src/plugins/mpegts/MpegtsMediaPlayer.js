import mpegts from "mpegts.js";

class MpegtsMediaPlayer {
  constructor(elementRef, mediaType, player, config) {
    this.elementRef = elementRef;
    this.mediaType = mediaType;
    this.player = player;
    this.isEnabled = true;
    this.currentPlaybackRate = 1.0;
    this.loaded = false;
    this.loadedCallback = null;
    this.handleLoadedDataBind = this.handleLoadedData.bind(this);
    this.handleStatisticsInfoBind = this.handleStatisticsInfo.bind(this);
    this.handleMediaInfoBind = this.handleMediaInfo.bind(this);
    this.statisticsInfo = {};
    this.mediaInfo = {};
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

    if (this.player) {
      this.player.destroy();
    }

    this.player = mpegts.createPlayer({
      type: mediaData.url.endsWith(".m3u8") ? "hls" : "flv",
      url: mediaData.url,
      isLive: true,
    });
    this.player.on(
      mpegts.Events.STATISTICS_INFO,
      this.handleStatisticsInfoBind
    );
    this.player.on(mpegts.Events.MEDIA_INFO, this.handleMediaInfoBind);

    this.player.attachMediaElement(this.elementRef.value);
    this.player.load();
  }

  handleStatisticsInfo(e) {
    this.statisticsInfo = e;
  }

  handleMediaInfo(e) {
    this.mediaInfo = e;
  }

  handleLoadedData() {
    console.log(`The ${this.mediaType} has now been loaded!`);
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

      this.player.off(
        mpegts.Events.STATISTICS_INFO,
        this.handleStatisticsInfoBind
      );
      this.player.off(mpegts.Events.MEDIA_INFO, this.handleMediaInfoBind);
      this.loadedCallback = null;
    } catch (ex) {
      console.warn(ex);
    }
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
    return {
      droppedFrames: this.statisticsInfo.droppedFrames,
      decodedFrames: this.statisticsInfo.decodedFrames,
      bpsAudio: this.statisticsInfo.bps_audio,
      bpsVideo: this.statisticsInfo.bps_video,
      speed: `${this.statisticsInfo.speed.toFixed(2)} KB/s`,
      height: this.mediaInfo.height,
      width: this.mediaInfo.width,
      audioCodec: this.mediaInfo.audioCodec,
      videoCodec: this.mediaInfo.videoCodec,
    };
  }
}

export default MpegtsMediaPlayer;
