function sleepAsync(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export { sleepAsync };
