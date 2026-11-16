// Rocks, dissolving. The horizons and joints of the weathering profile were
// traced from the photograph ahead of time (img/weathering-profile-ink-paper.png,
// made by draft-01/tools/trace-profile.html?paper&w=900). The tracing is shown
// twice: laid over the photograph, and on its own. Rest the pointer on either
// and both run; take it away and they set again.
(function () {
  const { plate, rng, reduceMotion } = Base;
  const row = document.querySelector(".rocks .row");
  const views = [
    { canvas: document.getElementById("rocks-over"), tint: "#fbfaf7" }, // on the photograph: paper-white lines
    { canvas: document.getElementById("rocks-lines"), tint: null },     // on its own: ink
  ].filter((v) => v.canvas);
  if (!row || !views.length) return;

  const ink = new Image();
  let w0 = 0, h0 = 0, drip = null, melt = 0, want = 0, stamp = -1;

  ink.onload = () => {
    w0 = ink.naturalWidth; h0 = ink.naturalHeight;
    const r = rng(8);
    let v = r();
    // how far each column runs: a smooth random walk with a few long drips
    drip = Float32Array.from({ length: w0 }, () => (v = v * 0.85 + r() * 0.15, 0.25 + v * 0.75 + (r() < 0.04 ? 0.6 : 0)));
    views.forEach((v) => { v.drawn = null; v.plate.dirty = true; });
  };

  function paint(view, t) {
    if (!drip) return;
    if (t !== stamp) { // one step of the melt per frame, however many views are on screen
      const dt = stamp < 0 ? 16 : Math.min(100, t - stamp);
      stamp = t;
      // by the clock, not the frame count: runs over about four seconds, sets again in about one
      melt += (want - melt) * (1 - Math.exp(-dt / (want > melt ? 1300 : 320)));
      if (Math.abs(want - melt) < 0.001) melt = want;
    }
    const { canvas } = view, key = melt + ":" + canvas.width;
    if (view.drawn === key) return; // nothing changed since this view was last drawn
    view.drawn = key;
    const ctx = view.ctx, W = canvas.width, H = canvas.height, m = melt * melt * (3 - 2 * melt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1 - Math.pow(m, 2.2);
    const sx = W / w0;
    for (let c = 0; c < w0; c++) {
      const k = drip[c];
      ctx.drawImage(ink, c, 0, 1, h0, c * sx, Math.pow(m, 1.6) * k * H * 0.9, sx + 0.6, H * (1 + m * k * 0.9));
    }
    ctx.globalAlpha = 1;
    if (view.tint) { // recolour what was just drawn, keeping its shape
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = view.tint;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  views.forEach((v) => {
    v.ctx = v.canvas.getContext("2d");
    v.plate = plate(v.canvas, { draw(t) { paint(v, t); } });
  });
  ink.src = "img/weathering-profile-ink-paper.png";

  const set = (on) => { want = reduceMotion ? 0 : on; views.forEach((v) => (v.plate.dirty = true)); };
  row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") set(1); });
  row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") set(0); });
  row.addEventListener("click", (e) => { if (e.pointerType && e.pointerType !== "mouse") set(want ? 0 : 1); });
})();
