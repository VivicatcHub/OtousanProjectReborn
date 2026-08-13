import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample(array, count) {
  return shuffle(array).slice(0, count);
}

export function gridFactors(total) {
  const root = Math.sqrt(total);
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i <= total; i++) {
    if (total % i === 0 && Math.abs(i - root) < diff) {
      diff = Math.abs(i - root);
      best = i;
    }
  }
  const other = total / best;
  return [Math.min(best, other), Math.max(best, other)];
}

export function gridColumns(total, narrow = false) {
  if (!total) return 1;
  const [small, big] = gridFactors(total);
  if (!narrow) return big;
  return Math.min(Math.max(small, 2), total);
}

export function weightedSample(array, count, weightOf) {
  const pool = array.map((item) => ({
    item,
    w: Math.max(Number(weightOf(item)) || 0, 0),
  }));
  const n = Math.min(count, pool.length);
  const chosen = [];
  for (let k = 0; k < n; k++) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let idx =
      total <= 0 ? Math.floor(Math.random() * pool.length) : pool.length - 1;
    if (total > 0) {
      let r = Math.random() * total;
      for (let i = 0; i < pool.length; i++) {
        r -= pool[i].w;
        if (r <= 0) {
          idx = i;
          break;
        }
      }
    }
    chosen.push(pool[idx].item);
    pool.splice(idx, 1);
  }
  return chosen;
}
