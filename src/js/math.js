// import { w } from './globals.js'

export const between = (a, b, c) => (b < a ? a : b > c ? c : b)
export const isBetween = (a, b, c) => (a <= b && b <= c) || (a >= b && b >= c)
export const rnd = (min, max) => Math.random() * (max - min) + min
export const distP = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2)
export const dist = (a, b) => distP(a.x, a.y, b.x, b.y)

export const angleBetween = (a, b) => Math.atan2(b.y - a.y, b.x - a.x)
export const roundToNearest = (x, precision) =>
  Math.round(x / precision) * precision
export const pick = (a) => a[~~(Math.random() * a.length)]
export const interpolate = (from, to, ratio) =>
  between(0, ratio, 1) * (to - from) + from

// Easing
export const linear = (x) => x
export const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5)

// Modulo centered around zero: the result will be between -y and +y
export const moduloWithNegative = (x, y) => {
  x = x % (y * 2)
  if (x > y) {
    x -= y * 2
  }
  if (x < -y) {
    x += y * 2
  }
  return x
}

export const normalize = (x) => moduloWithNegative(x, Math.PI)

// Make Math global
// Object.getOwnPropertyNames(Math).forEach(n => w[n] = w[n] || Math[n]);

export const TWO_PI = Math.PI * 2
