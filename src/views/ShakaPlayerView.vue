<template>
  <video
    ref="videoElement"
    id="videoElement"
    width="100%"
    height="100%"
    @timeupdate="onTimeupdate"
    @volumechange="onVolumechange"
    @ended="onEnded"
  ></video>
  <video
    ref="audioElement"
    id="audioElement"
    width="0"
    height="0"
    @volumechange="onVolumechange"
  ></video>
</template>

<script setup>
import { onMounted, ref } from "vue";
import shaka from "shaka-player";
import { emitEvent } from "../plugins/iframeEvents";
import ShakaMediaPlayer from "../plugins/shakaPlayer/ShakaMediaPlayer";
import ShakaPlayerController from "../plugins/shakaPlayer/ShakaPlayerController";
import AVSyncManager from "../plugins/AVSyncManager";

window.shaka = shaka;

const viewName = "ShakaPlayerView";
console.log(viewName);
const videoElement = ref(null);
const audioElement = ref(null);
const players = {};

let playerController = null;

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    console.log("页面恢复前台");
    // 如果存在音视频两个播放器，则将视频进度设置为音频进度
    if (
      players.videoPlayer &&
      players.audioPlayer &&
      players.videoPlayer.isEnabled &&
      players.audioPlayer.isEnabled
    ) {
      const audioTime = players.audioPlayer.getCurrentTime();
      players.videoPlayer.setCurrentTime(audioTime);
    }
    // 恢复音视频进度同步计时器
    if (playerController) {
      playerController.checkAVSync();
    }
  } else {
    console.log("页面进入后台");
    // 暂停音视频进度同步计时器
    if (playerController && playerController.avSyncManager) {
      playerController.avSyncManager.resetSyncState();
    }
  }
});

const getPlayDataFromQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mpdUrlBase64 = urlParams.get("playData");

  console.log("playDataBase64：", mpdUrlBase64);
  const binaryStr = atob(mpdUrlBase64);
  const bytes = Uint8Array.from(binaryStr, (m) => m.codePointAt(0));
  const playDataStr = new TextDecoder("utf-8").decode(bytes);
  const parseData = JSON.parse(playDataStr);
  console.log("playData:", parseData);
  return parseData;
};

const onTimeupdate = (e) => {
  emitEvent("positionChanged", videoElement.value.currentTime);
  playerController.checkAVSync();
};

const onEnded = () => {
  emitEvent("ended");
};

const onVolumechange = (e) => {
  console.log("volumeChanged", audioElement.value.volume);
  emitEvent("volumeChanged", audioElement.value.volume);
};

const initApp = async () => {
  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) {
    console.error("Browser not supported!");
    return;
  }

  const sample = {
    video: { url: "", contentType: "video/mp4" },
    audio: { url: "", contentType: "audio/mp3" },
  };

  const playData = {
    video: { ...sample.video, ...getPlayDataFromQuery().video },
    audio: { ...sample.audio, ...getPlayDataFromQuery().audio },
  };

  const playerConfig = {
    streaming: { bufferingGoal: 30 },
  };

  if (players.videoPlayer != null) {
    players.videoPlayer.dispose();
    players.videoPlayer = null;
  }
  if (players.audioPlayer != null) {
    players.audioPlayer.dispose();
    players.audioPlayer = null;
  }
  players.videoPlayer = new ShakaMediaPlayer(
    videoElement,
    "video",
    new shaka.Player(),
    playerConfig
  );

  players.audioPlayer = new ShakaMediaPlayer(
    audioElement,
    "audio",
    new shaka.Player(),
    playerConfig
  );

  const avSyncManager = new AVSyncManager(
    players.videoPlayer,
    players.audioPlayer
  );
  playerController = new ShakaPlayerController(
    players.videoPlayer,
    players.audioPlayer,
    avSyncManager
  );

  window.playerController = playerController;

  // 将控制器方法暴露给window
  window.resume = () => playerController.play();
  window.seek = (time) => playerController.seek(time);
  window.setVolume = (volume) => playerController.setVolume(volume);
  window.getVolume = () => playerController.getVolume();
  window.setRate = (speed) => playerController.setPlaybackRate(speed);
  window.pause = () => playerController.pause();
  window.setCheckAVSyncDiff = (smallDiff, largeDiff) =>
    avSyncManager.setSyncThresholds(smallDiff, largeDiff);

  let videoLoaded = false;
  let audioLoaded = false;

  const checkLoaded = () => {
    if (videoLoaded && audioLoaded) {
      const duration =
        videoElement.value.duration === Infinity
          ? 0
          : videoElement.value.duration;
      emitEvent("loaded", { duration });
    }
  };

  await Promise.all([
    players.videoPlayer.init(playData.video, () => {
      videoLoaded = true;
      checkLoaded();
    }),
    players.audioPlayer.init(playData.audio, () => {
      audioLoaded = true;
      checkLoaded();
    }),
  ]);

  // If both are disabled (no URLs), still emit loaded
  if (!players.videoPlayer.isEnabled && !players.audioPlayer.isEnabled) {
    emitEvent("loaded", { duration: 0 });
  }
};

onMounted(() => {
  initApp();
});

window.initApp = initApp;
</script>

<style>
#videoElement {
  width: 100%;
  height: 100%;
  background: black;
}
</style>
