// 04 · the weathering profile near Seoni. Its horizons and joints were traced
// from the photograph itself (tools/trace-profile.html → img/weathering-profile-ink.png).
// The tracing is drawn over the photograph, the photograph leaves, the tracing melts.
(function () {
  const section = document.getElementById("profile");
  const stage = document.getElementById("profile-stage");
  const img = document.getElementById("profile-img");
  const lines = document.getElementById("profile-lines");
  const q = section.querySelector(".q");
  const ctx = lines.getContext("2d");
  const { clamp, progress, near, rng } = Scroll;
  const ease = (x) => x * x * (3 - 2 * x);

  const ink = new Image();
  let w0 = 0, h0 = 0, drip = null, dpr = 1, last = -1;

  ink.onload = () => {
    w0 = ink.naturalWidth; h0 = ink.naturalHeight;
    // how far each column runs when it melts: a smooth random walk with a few long drips
    const r = rng(8);
    let v = r();
    drip = Float32Array.from({ length: w0 }, () => (v = v * 0.85 + r() * 0.15, 0.25 + v * 0.75 + (r() < 0.04 ? 0.6 : 0)));
    size();
  };
  ink.src = "img/weathering-profile-ink.png";

  function size() {
    const ar = img.naturalWidth / img.naturalHeight || w0 / h0 || 0.75;
    stage.style.aspectRatio = ar;
    dpr = Math.min(devicePixelRatio || 1, 2);
    lines.width = stage.clientWidth * dpr;
    lines.height = stage.clientHeight * dpr;
    last = -1;
  }

  function draw(reveal, melt) {
    const W = lines.width, H = lines.height;
    ctx.clearRect(0, 0, W, H);
    if (!drip || !W || !H) return;
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
    // the page can load at zero size (hidden tab): measure again once there is room
    if (!lines.width && stage.clientWidth) size();
    const p = progress(section);
    if (Math.abs(p - last) < 0.001) return;
    last = p;
    img.style.opacity = clamp(p / 0.04) * (1 - ease(clamp((p - 0.18) / 0.22)));
    const reveal = ease(clamp((p - 0.02) / 0.14));
    const melt = ease(clamp((p - 0.48) / 0.44));
    draw(reveal, melt);
    q.style.opacity = clamp(p / 0.05);
  });

  if (!(img.complete && img.naturalWidth)) img.addEventListener("load", size);
  addEventListener("resize", () => { clearTimeout(size.t); size.t = setTimeout(size, 150); });
})();
