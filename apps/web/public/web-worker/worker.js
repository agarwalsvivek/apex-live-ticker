// worker.js: background thread. Owns the feed, the row store and deduplication.
let ROW_COUNT = 1000;
let TICKS_PER_SEC = 2000; // simulated feed rate
let FLUSH_MS = 16;        // how often a batch is posted

const rows = new Map();   // id -> latest full row
let pending = new Map();  // id -> rows changed since the last batch
let ticks = 0;            // raw ticks behind the next batch
let seq = 0;
let feedTimer = null;
let flushTimer = null;

function seed(count) {
  ROW_COUNT = count;
  for (let i = 0; i < ROW_COUNT; i++) {
    const id = `SYM${i}`;
    rows.set(id, { id, price: +(100 + Math.random() * 400).toFixed(2), change: 0, volume: 0 });
  }
}

// One simulated socket message. With a real WebSocket, this body moves into ws.onmessage.
function onTick() {
  const id = `SYM${Math.floor(Math.random() * ROW_COUNT)}`;
  const prev = rows.get(id);
  const change = +((Math.random() - 0.5) * 2).toFixed(2);
  const next = {
    ...prev,
    price: +(prev.price + change).toFixed(2),
    change,
    volume: prev.volume + Math.floor(Math.random() * 500),
  };
  rows.set(id, next);
  pending.set(id, next); // a repeat tick for the same row overwrites it: dedup
  ticks++;
}

function flush() {
  if (pending.size === 0) return;
  const update = Array.from(pending.values());
  pending = new Map();
  globalThis.postMessage({ type: 'batch', seq: ++seq, update, ticks });
  ticks = 0;
}

function start() {
  stop(false);
  const INTERVAL_MS = 4; // timers clamp to ~4 ms, so emit several ticks per interval
  const perInterval = Math.max(1, Math.round((TICKS_PER_SEC * INTERVAL_MS) / 1000));
  feedTimer = setInterval(() => {
    for (let i = 0; i < perInterval; i++) onTick();
  }, INTERVAL_MS);
  flushTimer = setInterval(flush, FLUSH_MS);
}

function stop(finalFlush = true) {
  clearInterval(feedTimer);
  clearInterval(flushTimer);
  feedTimer = flushTimer = null;
  if (finalFlush) flush();
}

globalThis.onmessage = ({ data: msg }) => {
  switch (msg.type) {
    case 'init':
      seed(msg.rowCount);
      globalThis.postMessage({ type: 'snapshot', rows: Array.from(rows.values()) });
      break;
    case 'start':
      start();
      break;
    case 'stop':
      stop();
      globalThis.postMessage({ type: 'stopped' });
      break;
    case 'config': {
      const running = feedTimer !== null;
      if (msg.ticksPerSec) TICKS_PER_SEC = msg.ticksPerSec;
      if (msg.flushMs) FLUSH_MS = msg.flushMs;
      if (running) start(); // restart timers with the new values; pending rows are kept
      break;
    }
  }
};