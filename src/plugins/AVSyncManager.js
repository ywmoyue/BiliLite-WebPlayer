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
    console.log("checkSync", this.isSyncing, now - this.lastSyncTime < this.syncCooldown);
    
    // 如果正在同步或处于冷却期，直接返回
    if (this.isSyncing || now - this.lastSyncTime < this.syncCooldown) return;

    const videoTime = this.videoPlayer.getCurrentTime();
    const audioTime = this.audioPlayer.getCurrentTime();
    const diff = videoTime - audioTime;
    console.log("diff", diff);

    // 如果差异很小，不需要处理
    if (Math.abs(diff) < this.syncThresholdSmall) {
      this.resetSyncState(); // 确保状态被正确重置
      return;
    }

    this.isSyncing = true;
    this.lastSyncTime = now;

    try {
      // 清除之前的定时器
      if (this.syncTimeoutId) {
        clearTimeout(this.syncTimeoutId);
        this.syncTimeoutId = null;
      }

      if (Math.abs(diff) >= this.syncThresholdLarge) {
        // 大偏差 - 直接跳跃
        console.log(`大偏差同步: 跳跃音频到视频位置 (差异: ${diff.toFixed(3)}s)`);
        this.audioPlayer.setCurrentTime(videoTime);
        this.resetSyncState(); // 立即重置状态
      } else {
        // 小偏差 - 调整播放速率
        const syncRate = this.calculateSyncRate(diff, this.videoPlayer.currentPlaybackRate);
        console.log(`小偏差同步: 调整音频速率为 ${syncRate.toFixed(2)}x (差异: ${diff.toFixed(3)}s)`);

        this.audioPlayer.setPlaybackRate(syncRate);

        // 设置定时器检查同步状态
        this.syncTimeoutId = setTimeout(() => {
          const newDiff = this.videoPlayer.getCurrentTime() - this.audioPlayer.getCurrentTime();
          
          if (Math.abs(newDiff) < this.syncThresholdSmall) {
            console.log(`同步完成，恢复音频速率为 ${this.videoPlayer.currentPlaybackRate}x`);
            this.resetSyncState();
          } else {
            // 如果仍然不同步，继续调整
            console.log(`同步未完成，继续调整 (新差异: ${newDiff.toFixed(3)}s)`);
            this.isSyncing = false; // 关键修正：重置同步状态
            this.checkSync();       // 然后重新检查
          }
          this.syncTimeoutId = null;
        }, 500);
      }
    } catch (error) {
      console.error("同步过程中出错:", error);
      this.resetSyncState();
    }
  }

  resetAudioRate() {
    this.audioPlayer.setPlaybackRate(this.videoPlayer.currentPlaybackRate);
  }

  resetSyncState() {
    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
      this.syncTimeoutId = null;
    }
    this.resetAudioRate();
    this.isSyncing = false;
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

  setSyncThresholds(smallDiff, largeDiff) {
    this.syncThresholdSmall = smallDiff;
    this.syncThresholdLarge = largeDiff;
  }
}

export default AVSyncManager;
