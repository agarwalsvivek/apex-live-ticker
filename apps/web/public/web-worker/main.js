// main.js: main thread. Owns the grid, the inbox and the frame loop.
const MODE = { ASYNC: 'async', SYNC: 'sync' };
let mode = MODE.ASYNC;

const stats = { ticks: 0, batches: 0, frames: 0, gridRecalcs: 0 };

const gridApi = agGrid.createGrid(document.getElementById('grid'), {
  columnDefs: [
    { field: 'id', headerName: 'Symbol' },
    {
      field: 'price',
      cellRenderer: 'agAnimateShowChangeCellRenderer',
      valueFormatter: (p) => p.value?.toFixed(2), // also formats the up/down delta
    },
    { field: 'change', cellStyle: (p) => ({ color: p.value >= 0 ? '#15803d' : '#c81e1e' }) },
    { field: 'volume', sort: 'desc' }, // a sort gives each recalculation real cost
  ],
  defaultColDef: { flex: 1, sortable: true, filter: true },
  getRowId: (p) => p.data.id,     // required: updates are matched to rows by id
  asyncTransactionWaitMillis: 50, // AG Grid's own batch window (async mode)
  onAsyncTransactionsFlushed: () => stats.gridRecalcs++,
});

const worker = new Worker('worker.js');

// ---- inbox + rAF: at most one grid transaction per frame ----
let inbox = new Map(); // id -> latest row since the last frame
let frameRequested = false;

function scheduleFrame() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(applyFrame);
}

function applyFrame() {
  frameRequested = false;
  if (inbox.size === 0) return;
  const update = Array.from(inbox.values());
  inbox = new Map();
  stats.frames++;
  if (mode === MODE.ASYNC) {
    gridApi.applyTransactionAsync({ update });
  } else {
    gridApi.applyTransaction({ update });
    stats.gridRecalcs++;
  }
}

worker.onmessage = ({ data: msg }) => {
  switch (msg.type) {
    case 'snapshot':
      gridApi.setGridOption('rowData', msg.rows);
      document.getElementById('start').disabled = false;
      break;
    case 'batch':
      for (const row of msg.update) inbox.set(row.id, row); // dedup across worker batches
      stats.ticks += msg.ticks;
      stats.batches++;
      scheduleFrame();
      break;
    case 'stopped':
      applyFrame();                     // drain now instead of waiting for a frame
      gridApi.flushAsyncTransactions(); // apply anything AG Grid still holds
      break;
  }
};

worker.onerror = (e) => console.error('Worker failed:', e.message);

// ---- controls ----
function setMode(next) {
  if (next === mode) return;
  if (mode === MODE.ASYNC) gridApi.flushAsyncTransactions(); // keep updates in order
  mode = next;
}

document.getElementById('start').onclick = () => worker.postMessage({ type: 'start' });
document.getElementById('stop').onclick = () => worker.postMessage({ type: 'stop' });
document.getElementById('async').onchange = (e) =>
  setMode(e.target.checked ? MODE.ASYNC : MODE.SYNC);

// ---- once-per-second stats ----
setInterval(() => {
  document.getElementById('stats').textContent =
    `ticks/s ${stats.ticks} · worker batches/s ${stats.batches} · ` +
    `frames applied/s ${stats.frames} · grid recalcs/s ${stats.gridRecalcs}`;
  for (const k in stats) stats[k] = 0;
}, 1000);

worker.postMessage({ type: 'init', rowCount: 1000 });