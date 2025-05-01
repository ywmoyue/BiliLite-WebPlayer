<template>
  <video
    ref="videoElement"
    id="videoElement"
    width="100%"
    height="100%"
    @loadedmetadata="onLoadedData"
    @timeupdate="onTimeupdate"
    @volumechange="onVolumechange"
    @ended="onEnded"
  ></video>
  <video
    ref="audioElement"
    id="audioElement"
    width="0"
    height="0"
    @loadedmetadata="onAudioLoadedMateData"
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

const videoElement = ref(null);
const audioElement = ref(null);
let playerController = null;

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

const onLoadedData = () => {
  let duration = videoElement.value.duration;
  console.log("duration:", duration);
  if (duration == Infinity) {
    duration = 0;
  }
  emitEvent("loaded", {
    duration,
  });
};

const onAudioLoadedMateData = () => {
  console.log("onAudioLoadedMateData");
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

  const videoPlayer = new ShakaMediaPlayer(
    videoElement,
    "video",
    new shaka.Player(),
    playerConfig
  );

  const audioPlayer = new ShakaMediaPlayer(
    audioElement,
    "audio",
    new shaka.Player(),
    playerConfig
  );

  const avSyncManager = new AVSyncManager(videoPlayer, audioPlayer);
  playerController = new ShakaPlayerController(
    videoPlayer,
    audioPlayer,
    avSyncManager
  );

  // 将控制器方法暴露给window
  window.resume = () => playerController.play();
  window.seek = (time) => playerController.seek(time);
  window.setVolume = (volume) => playerController.setVolume(volume);
  window.getVolume = () => playerController.getVolume();
  window.setRate = (speed) => playerController.setPlaybackRate(speed);
  window.pause = () => playerController.pause();
  window.setCheckAVSyncDiff = (smallDiff, largeDiff) =>
    avSyncManager.setSyncThresholds(smallDiff, largeDiff);

  // 初始化播放器
  await videoPlayer.init(playData.video);
  await audioPlayer.init(playData.audio);
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
