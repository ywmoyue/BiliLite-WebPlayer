const BILILITE_APP_MESSAGE = "[BILILITE_APP_MESSAGE]";
const BILILITE_PLAYER_EVENT = "[BILILITE_PLAYER_EVENT]"

// 发送事件
function emitEvent(eventName, eventData) {
    window.chrome.webview.postMessage({
        type: BILILITE_PLAYER_EVENT,
        event: eventName,
        data: eventData,
    })
}
export { emitEvent};