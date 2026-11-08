// 04 · the weathering profile near Seoni. Its horizons and joints are traced
// from the photograph itself, then the photograph leaves and the tracing melts.
(function () {
  const section = document.getElementById("profile");
  const stage = document.getElementById("profile-stage");
  const img = document.getElementById("profile-img");
  const lines = document.getElementById("profile-lines");
  const q = section.querySelector(".q");
  const ctx = lines.getContext("2d");
  const { clamp, progress, near, rng } = Scroll;
  const ease = (x) => x * x * (3 - 2 * x);

  let ink = null, w0 = 0, h0 = 0, drip = null, dpr = 1, last = -1;

  function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[y * w + clamp(x, 0, w - 1)];
      for (let x = 0; x < w; x++) {
        tmp[y * w + x] = acc / (2 * r + 1);
        acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
      for (let y = 0; y < h; y++) {
        out[y * w + x] = acc / (2 * r + 1);
        acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
      }
    }
    return out;
  }
  const quantile = (a, q) => { const s = Float32Array.from(a).sort(); return s[Math.floor(q * (s.length - 1))]; };

  // horizon contours (banded colour field) + joints (strong luminance edges)
  function trace() {
    const nw = img.naturalWidth, nh = img.naturalHeight;
    w0 = 360; h0 = Math.round((w0 * nh) / nw);
    const c = document.createElement("canvas");
    c.width = w0; c.height = h0;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w0, h0);
    const d = cx.getImageData(0, 0, w0, h0).data;
    const N = w0 * h0, lum = new Float32Array(N), field = new Float32Array(N), sky = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      lum[i] = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
      field[i] = 0.55 * lum[i] + 0.9 * ((r - b) / 255);
      sky[i] = b >= r && lum[i] > 0.45 ? 1 : 0; // pale blue-grey: cloud, not rock
    }
    const skyBlur = boxBlur(Float32Array.from(sky), w0, h0, 6);
    let F = boxBlur(boxBlur(field, w0, h0, 5), w0, h0, 4);
    const lo = quantile(F, 0.02), hi = quantile(F, 0.98);
    const level = new Uint8Array(N);
    for (let i = 0; i < N; i++) level[i] = Math.floor(clamp((F[i] - lo) / (hi - lo)) * 5.99);
    const G = boxBlur(lum, w0, h0, 1);
    const mag = new Float32Array(N);
    for (let y = 1; y < h0 - 1; y++) {
      for (let x = 1; x < w0 - 1; x++) {
        const i = y * w0 + x;
        const gx = G[i - w0 + 1] + 2 * G[i + 1] + G[i + w0 + 1] - G[i - w0 - 1] - 2 * G[i - 1] - G[i + w0 - 1];
        const gy = G[i + w0 - 1] + 2 * G[i + w0] + G[i + w0 + 1] - G[i - w0 - 1] - 2 * G[i - w0] - G[i - w0 + 1];
        mag[i] = Math.hypot(gx, gy);
      }
    }
    const edgeCut = quantile(mag, 0.93);
    ink = document.createElement("canvas");
    ink.width = w0; ink.height = h0;
    const ix = ink.getContext("2d");
    const out = ix.createImageData(w0, h0);
    for (let y = 0; y < h0 - 1; y++) {
      for (let x = 0; x < w0 - 1; x++) {
        const i = y * w0 + x;
        if (skyBlur[i] > 0.35) continue;
        const horizon = level[i] !== level[i + 1] || level[i] !== level[i + w0];
        const joint = mag[i] > edgeCut;
        if (!horizon && !joint) continue;
        out.data[i * 4] = horizon ? 237 : 236;
        out.data[i * 4 + 1] = horizon ? 169 : 230;
        out.data[i * 4 + 2] = horizon ? 74 : 214;
        out.data[i * 4 + 3] = horizon ? 255 : 150;
      }
    }
    ix.putImageData(out, 0, 0);
    const r = rng(8);
    let v = r();
    drip = Float32Array.from({ length: w0 }, () => (v = v * 0.85 + r() * 0.15, 0.25 + v * 0.75 + (r() < 0.04 ? 0.6 : 0)));
    size();
  }

  function size() {
    const ar = img.naturalWidth / img.naturalHeight || 0.75;
    stage.style.aspectRatio = ar;
    dpr = Math.min(devicePixelRatio || 1, 2);
    lines.width = stage.clientWidth * dpr;
    lines.height = stage.clientHeight * dpr;
    last = -1;
  }

  function draw(reveal, melt) {
    const W = lines.width, H = lines.height;
    ctx.clearRect(0, 0, W, H);
    if (!ink) return;
    ctx.globalAlpha = 1 - Math.pow(melt, 2.2);
    ctx.imageSmoothingEnabled = true;
    const sx = W / w0, sh = Math.max(1, Math.floor(h0 * reveal));
    for (let c = 0; c < w0; c++) {
      const k = drip[c];
      const drop = Math.pow(melt, 1.6) * k * H * 0.9;
      const stretch = 1 + melt * k * 0.9;
      ctx.drawImage(ink, c, 0, 1, sh, c * sx, drop, sx + 0.6, (sh / h0) * H * stretch);
    }
    ctx.globalAlpha = 1;
  }

  Scroll.on(() => {
    if (!near(section, 0.2)) return;
    const p = progress(section);
    if (Math.abs(p - last) < 0.001) return;
    last = p;
    img.style.opacity = clamp(p / 0.04) * (1 - ease(clamp((p - 0.18) / 0.22)));
    const reveal = ease(clamp((p - 0.02) / 0.14));
    const melt = ease(clamp((p - 0.48) / 0.44));
    draw(reveal, melt);
    q.style.opacity = clamp(p / 0.05);
  });

  if (img.complete && img.naturalWidth) trace();
  else img.addEventListener("load", trace);
  addEventListener("resize", () => { clearTimeout(size.t); size.t = setTimeout(size, 150); });
})();
