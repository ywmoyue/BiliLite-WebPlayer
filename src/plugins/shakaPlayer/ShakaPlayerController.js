class ShakaPlayerController {
  constructor(videoPlayer, audioPlayer, avSyncManager) {
    this.videoPlayer = videoPlayer;
    this.audioPlayer = audioPlayer;
    this.avSyncManager = avSyncManager;
  }

  play() {
    this.videoPlayer.play();
    this.audioPlayer.play();
  }

  pause() {
    this.videoPlayer.pause();
    this.audioPlayer.pause();
  }

  seek(time) {
    this.videoPlayer.setCurrentTime(time);
    this.audioPlayer.setCurrentTime(time);
  }

  setVolume(volume) {
    this.videoPlayer.setVolume(volume);
    this.audioPlayer.setVolume(volume);
  }

  getVolume() {
    return this.audioPlayer.getVolume();
  }

  setPlaybackRate(rate) {
    this.videoPlayer.setPlaybackRate(rate);
    this.audioPlayer.setPlaybackRate(rate);
  }

  checkAVSync() {
    this.avSyncManager.checkSync();
  }
}

export default ShakaPlayerController