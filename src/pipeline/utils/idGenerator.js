// src/pipeline/utils/idGenerator.js

function sanitizePart(value) {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createId(prefix = 'id', parts = []) {
  const safePrefix = sanitizePart(prefix) || 'id';
  const safeParts = parts.map(sanitizePart).filter(Boolean);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 11);

  return [safePrefix, ...safeParts, timestamp, random].join('_');
}

export function createMessageId(sourceId = null) {
  return createId('msg', sourceId ? [sourceId] : []);
}

export function createBatchId() {
  return createId('batch');
}

export function createJobId() {
  return createId('job');
}
