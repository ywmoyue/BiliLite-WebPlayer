function sleepAsync(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function captureVideoFrame(videoElement) {
  let canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png");
  return imageData;
}

export { sleepAsync, captureVideoFrame };
