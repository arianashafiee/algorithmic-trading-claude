// src/pipeline/utils/asyncUtils.js

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withTimeout(operation, timeoutMs, message = 'Operation timed out') {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function clearTimer(timer) {
  if (timer) {
    clearTimeout(timer);
    clearInterval(timer);
  }
}
