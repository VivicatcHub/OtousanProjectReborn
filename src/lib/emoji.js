const SIZE = 24;
const CELL = SIZE * 2;

const cache = new Map();

let context;
function getContext() {
  if (context !== undefined) return context;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = CELL * 2;
    canvas.height = SIZE * 2;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.textBaseline = "top";
    ctx.font = `${SIZE}px sans-serif`;
    context = ctx;
  } catch {
    context = null;
  }
  return context;
}

function detect(emoji) {
  const ctx = getContext();
  if (!ctx) return true;

  ctx.clearRect(0, 0, CELL * 2, SIZE * 2);
  ctx.fillStyle = "#ff0000";
  ctx.fillText(emoji, 0, 0);
  ctx.fillStyle = "#0000ff";
  ctx.fillText(emoji, CELL, 0);

  const left = ctx.getImageData(0, 0, CELL, SIZE * 2).data;
  let i = 0;
  while (i < left.length && !left[i + 3]) i += 4;
  if (i >= left.length) return false;

  const x = CELL + ((i / 4) % CELL);
  const y = Math.floor(i / 4 / CELL);
  const right = ctx.getImageData(x, y, 1, 1).data;
  if (left[i] !== right[0] || left[i + 2] !== right[2]) return false;

  if (ctx.measureText(emoji).width > SIZE * 1.5) return false;

  return true;
}

export function emojiSupported(emoji) {
  if (!emoji) return false;
  if (!cache.has(emoji)) cache.set(emoji, detect(emoji));
  return cache.get(emoji);
}
