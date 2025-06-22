import { captureVideoFrame } from "./commonUtils";
import { emitEvent } from "./iframeEvents";

class BasePlayerController {
  constructor(videoPlayer, audioPlayer, avSyncManager) {
    this.videoPlayer = videoPlayer;
    this.audioPlayer = audioPlayer;
    this.avSyncManager = avSyncManager;
    this.transformState = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      flipHorizontal: false,
      flipVertical: false,
    };
    this.reportStatsTimer = null;
  }

  play() {
    console.log("play");
    this.videoPlayer.play();
    this.audioPlayer.play();
    this.startReportStats();
  }

  pause() {
    console.log("pause");
    this.videoPlayer.pause();
    this.audioPlayer.pause();
    this.stopReportStats();
  }

  seek(time) {
    console.log("seek", time);
    this.videoPlayer.setCurrentTime(time);
    this.audioPlayer.setCurrentTime(time);
  }

  setVolume(volume) {
    console.log("setVolume", volume);
    this.videoPlayer.setVolume(volume);
    this.audioPlayer.setVolume(volume);
  }

  getVolume() {
    console.log("getVolume");
    return this.audioPlayer.getVolume();
  }

  setPlaybackRate(rate) {
    console.log("setPlaybackRate", rate);
    this.videoPlayer.setPlaybackRate(rate);
    this.audioPlayer.setPlaybackRate(rate);
  }

  checkAVSync() {
    this.avSyncManager.checkSync();
  }

  reportStats() {
    const stats = this.videoPlayer.getStats();
    emitEvent("stats", stats);
  }

  startReportStats() {
    this.reportStatsTimer = setInterval(() => {
      this.reportStats();
    }, 2000);
    console.log("startReportStats", this.reportStatsTimer);
  }

  stopReportStats() {
    console.log("stopReportStats", this.reportStatsTimer);
    if (this.reportStatsTimer) clearInterval(this.reportStatsTimer);
  }

  /**
   * 上下镜像翻转
   */
  flipVertical() {
    console.log("flipVertical");
    this.transformState.flipVertical = !this.transformState.flipVertical;
    this._applyTransforms();
  }

  /**
   * 左右镜像翻转
   */
  flipHorizontal() {
    console.log("flipHorizontal");
    this.transformState.flipHorizontal = !this.transformState.flipHorizontal;
    this._applyTransforms();
  }

  /**
   * 画面缩放
   * @param {number} scaleFactor 缩放比例 (1 = 100%)
   */
  zoom(scaleFactor) {
    console.log("zoom", scaleFactor);
    this.transformState.scale = Math.max(0.1, scaleFactor); // 限制最小缩放
    this._applyTransforms();
  }

  /**
   * 画面移动
   * @param {number} x 水平移动距离 (像素)
   * @param {number} y 垂直移动距离 (像素)
   */
  move(x, y) {
    console.log("move", x, y);
    this.transformState.translateX += x;
    this.transformState.translateY += y;
    this._applyTransforms();
  }

  /**
   * 重置所有变换
   */
  resetTransforms() {
    console.log("resetTransforms");
    this.transformState = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      flipHorizontal: false,
      flipVertical: false,
    };
    this._applyTransforms();
  }

  /**
   * 打开/关闭画中画模式
   * @returns {Promise} 返回画中画操作的结果
   */
  async togglePictureInPicture() {
    console.log("togglePictureInPicture");
    const videoElement = this.videoPlayer.elementRef.value;

    if (!videoElement) {
      console.error("Video element not found");
      return;
    }

    try {
      if (document.pictureInPictureElement === videoElement) {
        // 如果已经是画中画模式，则退出
        await document.exitPictureInPicture();
        return { success: true, action: "exit" };
      } else {
        // 否则进入画中画模式
        await videoElement.requestPictureInPicture();
        return { success: true, action: "enter" };
      }
    } catch (error) {
      console.error("Picture-in-Picture error:", error);
      return { success: false, error: error.message };
    }
  }

  capture() {
    console.log("capture");
    const videoElement = this.videoPlayer.elementRef.value;

    if (!videoElement) {
      console.error("Video element not found");
      emitEvent("captureImageData", { imageData: "" });
      return;
    }
    try {
      const imageData = captureVideoFrame(videoElement);

      console.log("captureImageData", { imageData });
      emitEvent("captureImageData", { imageData });
    } catch (ex) {
      console.error("capture error", ex);
      emitEvent("captureImageData", { imageData: "" });
    }
  }

  /**
   * 应用所有变换到视频元素
   */
  _applyTransforms() {
    const videoElement = this.videoPlayer.elementRef.value;
    if (!videoElement) return;

    const transforms = [];

    // 缩放
    transforms.push(`scale(${this.transformState.scale})`);

    // 位移
    transforms.push(
      `translate(${this.transformState.translateX}px, ${this.transformState.translateY}px)`
    );

    // 镜像翻转
    if (this.transformState.flipHorizontal) {
      transforms.push("scaleX(-1)");
    }
    if (this.transformState.flipVertical) {
      transforms.push("scaleY(-1)");
    }

    videoElement.style.transform = transforms.join(" ");
    videoElement.style.transformOrigin = "center center";
  }
}

export default BasePlayerController;
