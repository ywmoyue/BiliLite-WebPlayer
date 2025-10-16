<template>
  <div
    id="danmakuContainer"
    style="
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    "
  ></div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import DanmuJs from "danmu.js";
import { emitEvent } from "../plugins/iframeEvents";

const viewName = "DanmakuPlayerView";
console.log(viewName);

let danmujs = null;
let isPaused = false;

const getPlayDataFromQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const playDataBase64 = urlParams.get("playData");
  console.log("playDataBase64：", playDataBase64);

  const binaryStr = atob(playDataBase64);
  const bytes = Uint8Array.from(binaryStr, (m) => m.codePointAt(0));
  const playDataStr = new TextDecoder("utf-8").decode(bytes);
  const parseData = JSON.parse(playDataStr);
  console.log("playData:", parseData);
  return parseData;
};

const initDanmaku = () => {
  const container = document.getElementById("danmakuContainer");

  // 从URL参数获取配置
  const config = {};

  danmujs = new DanmuJs({
    container: container,
    containerStyle: {
      zIndex: 100,
      background: "transparent",
    },
    area: {
      start: config.areaStart || 0,
      end: config.areaEnd || 1,
      lines: config.lines || undefined,
    },
    channelSize: config.channelSize || 0,
    mouseControl: config.mouseControl || false,
    mouseControlPause: config.mouseControlPause || false,
    defaultOff: config.defaultOff || true,
    chaseEffect: config.chaseEffect !== false,
  });

  // 监听弹幕事件
  if (config.mouseControl) {
    danmujs.on("bullet_hover", function (data) {
      emitEvent("bullet_hover", data);
    });
  }

  // 初始化弹幕数据
  if (config.comments && config.comments.length > 0) {
    danmujs.updateComments(config.comments);
  }

  danmujs.start();
  emitEvent("danmaku_loaded");
};

// 暴露给window的方法
window.danmaku = {
  // 基本控制
  start: () => {
    if (danmujs) {
      danmujs.start();
      isPaused = false;
    }
  },
  pause: () => {
    if (danmujs) {
      danmujs.pause();
      isPaused = true;
    }
  },
  play: () => {
    if (danmujs) {
      danmujs.play();
      isPaused = false;
    }
  },
  stop: () => {
    if (danmujs) {
      danmujs.stop();
      isPaused = false;
    }
  },

  // 弹幕管理
  sendComment: (comment) => {
    if (danmujs) {
      danmujs.sendComment(comment);
    }
  },
  updateComments: (commentsBase64) => {
    if (danmujs) {
      const binaryStr = atob(commentsBase64);
      const bytes = Uint8Array.from(binaryStr, (m) => m.codePointAt(0));
      const commentsStr = new TextDecoder("utf-8").decode(bytes);
      const parseData = JSON.parse(commentsStr);
      for (const element of parseData) {
        element.style["line-height"] = 1;
        element.start = element.start * 1000;
        element.txt = element.start + "";
      }
      console.warn("updateComments", parseData);
      danmujs.updateComments(parseData);
    }
  },
  setCommentDuration: (id, duration) => {
    if (danmujs) {
      danmujs.setCommentDuration(id, duration);
    }
  },
  setAllDuration: (mode, duration) => {
    if (danmujs) {
      danmujs.setAllDuration(mode, duration);
    }
  },
  setPlayRate: (mode, rate) => {
    if (danmujs) {
      danmujs.setPlayRate(mode, rate);
    }
  },
  setCommentID: (oldID, newID) => {
    if (danmujs) {
      danmujs.setCommentID(oldID, newID);
    }
  },

  // 显示控制
  hide: (mode) => {
    if (danmujs) {
      danmujs.hide(mode);
    }
  },
  show: (mode) => {
    if (danmujs) {
      danmujs.show(mode);
    }
  },
  setArea: (area) => {
    if (danmujs) {
      danmujs.setArea(area);
    }
  },
  setOpacity: (opacity) => {
    if (danmujs) {
      danmujs.setOpacity(opacity);
    }
  },
  setFontSize: (size, channelSize) => {
    if (danmujs) {
      danmujs.setFontSize(size, channelSize);
    }
  },
  setCommentLike: (id, likeConfig) => {
    if (danmujs) {
      danmujs.setCommentLike(id, likeConfig);
    }
  },

  // 状态获取
  getStatus: () => {
    return danmujs ? danmujs.status : "closed";
  },
  getState: () => {
    return danmujs ? danmujs.state : null;
  },

  // 清理
  clear: () => {
    if (danmujs) {
      danmujs.updateComments([]);
    }
  },
};

onMounted(() => {
  initDanmaku();
});

onUnmounted(() => {
  if (danmujs) {
    danmujs.stop();
    danmujs = null;
  }
});
</script>

<style>
#danmakuContainer {
  pointer-events: none;
}

body {
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0); /* 完全透明背景 */
  overflow: hidden; /* 隐藏滚动条 */
  font-family: Arial, sans-serif; /* 可更改字体 */
  color: white; /* 默认白色文字 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 文字阴影增强可读性 */
}

#app {
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0); /* 完全透明背景 */
  overflow: hidden; /* 隐藏滚动条 */
  font-family: Arial, sans-serif; /* 可更改字体 */
  color: white; /* 默认白色文字 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 文字阴影增强可读性 */
}
</style>
