class AVSyncManager {
  constructor(videoPlayer, audioPlayer) {
    this.videoPlayer = videoPlayer;
    this.audioPlayer = audioPlayer;
    this.syncThresholdSmall = 0.1; // 小偏差阈值(秒)
    this.syncThresholdLarge = 0.5; // 大偏差阈值(秒)
    this.isSyncing = false;
    this.lastSyncTime = 0;
    this.syncCooldown = 1000; // 同步冷却时间(毫秒)
    this.syncTimeoutId = null; // 用于存储定时器ID
  }

  checkSync() {
    if (!this.videoPlayer.isEnabled || !this.audioPlayer.isEnabled) return;

    const now = Date.now();

    const videoTime = this.videoPlayer.getCurrentTime();
    const audioTime = this.audioPlayer.getCurrentTime();
    const diff = videoTime - audioTime;

    let audioRate = this.videoPlayer.currentPlaybackRate;

    // 如果差异很小，不需要处理
    if (Math.abs(diff) < this.syncThresholdSmall) {
      this.audioPlayer.setPlaybackRate(audioRate);
      return;
    }

    try {
      if (Math.abs(diff) >= this.syncThresholdLarge) {
        // 大偏差 - 直接跳跃
        console.log(
          `大偏差同步: 跳跃音频到视频位置 (差异: ${diff.toFixed(3)}s)`
        );
        this.audioPlayer.setCurrentTime(videoTime);
        this.audioPlayer.setPlaybackRate(audioRate);
      } else {
        // 小偏差 - 调整播放速率
        audioRate = this.calculateSyncRate(diff, audioRate);
        console.log(
          `小偏差同步: 调整音频速率为 ${audioRate.toFixed(
            2
          )}x (差异: ${diff.toFixed(3)}s)`
        );

        this.audioPlayer.setPlaybackRate(audioRate);
      }
    } catch (error) {
      console.error("同步过程中出错:", error);
      this.audioPlayer.setPlaybackRate(audioRate);
    }
  }

  calculateSyncRate(diff, baseRate) {
    // 基础加速/减速因子(基于差异大小)
    const factor = Math.min(Math.abs(diff) * 5, 0.5);

    if (diff > 0) {
      return Math.min(baseRate + factor, 2.0);
    } else {
      return Math.max(0.5, baseRate - factor);
    }
  }

  setSyncThresholds(syncThresholdSmall, syncThresholdLarge) {
    console.info("设置同步偏差阈值:", syncThresholdSmall, syncThresholdLarge);
    this.syncThresholdSmall = syncThresholdSmall; // 小偏差阈值(秒)
    this.syncThresholdLarge = syncThresholdLarge; // 大偏差阈值(秒)
  }
}

export default AVSyncManager;
