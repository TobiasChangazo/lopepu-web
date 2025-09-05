const PATH_DATA = "/assets/menu-data.json";

// Caja relativa para los dígitos (no el "$"), afinada para plantillas 1280×850
const ROI = { leftPct: 0.47, topPct: 0.79, widthPct: 0.43, heightPct: 0.16, align: "center" };
const DEBUG_ROI = false;

const PROMO_TEMPLATES = {
  promo_2_muzzas:        "/assets/promos/2-muzzas.png",
  promo_3_muzzas:        "/assets/promos/3-muzzas.png",
  promo_muzza_6_emp:     "/assets/promos/muzza-6-emp.png",
  promo_muzza_12_emp:    "/assets/promos/muzza-12-emp.png",
  promo_muzza_especial:  "/assets/promos/muzza-especial.png",
  promo_2_especiales:    "/assets/promos/2-especiales.png",
  promo_3_especiales:    "/assets/promos/3-especiales.png",
  promo_especial_6_emp:  "/assets/promos/especial-6-emp.png",
  promo_especial_12_emp: "/assets/promos/especial-12-emp.png"
};

const fmtDigits = new Intl.NumberFormat("es-AR", { style: "decimal", maximumFractionDigits: 0 });

function loadImage(src){ return new Promise((res, rej) => {
  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => res(img); img.onerror = rej; img.src = src;
});}

function fitFont(ctx, text, family, maxPx, boxW, minPx=32){
  let s = maxPx;
  while (s >= minPx){
    ctx.font = `700 ${s}px ${family}`;
    if (ctx.measureText(text).width <= boxW) return s;
    s -= 2;
  }
  return minPx;
}

async function renderPromo(id){
  const data = await (await fetch(PATH_DATA)).json();
  const sec  = data.sections.find(s => s.id === "promos");
  const item = sec.items.find(i => i.id === id);
  if (!item) throw new Error(`Promo no encontrada: ${id}`);

  const img = await loadImage(PROMO_TEMPLATES[id]);
  const cv  = document.createElement("canvas");
  const cx  = cv.getContext("2d");
  cv.width  = img.width; cv.height = img.height;
  cx.drawImage(img, 0, 0);

  const roi = {
    x: Math.round(cv.width  * ROI.leftPct),
    y: Math.round(cv.height * ROI.topPct),
    w: Math.round(cv.width  * ROI.widthPct),
    h: Math.round(cv.height * ROI.heightPct)
  };
  if (DEBUG_ROI){
    cx.strokeStyle = "rgba(0,0,255,.5)"; cx.lineWidth = 2;
    cx.strokeRect(roi.x, roi.y, roi.w, roi.h);
  }

  const digits = fmtDigits.format(item.price);
  await document.fonts.load(`700 120px "ErasITC-Bold"`);

  const px = fitFont(cx, digits, "ErasITC-Bold", Math.floor(roi.h*0.8), roi.w);
  cx.font = `700 ${px}px ErasITC-Bold`;
  cx.fillStyle = "#000";
  cx.textBaseline = "middle";
  cx.textAlign = ROI.align === "center" ? "center" : ROI.align === "right" ? "right" : "left";

  const cy = roi.y + roi.h/2;
  const cxpos = ROI.align === "center" ? roi.x + roi.w/2 : ROI.align === "right" ? roi.x + roi.w : roi.x;

  cx.lineWidth = Math.max(4, Math.round(px/18));
  cx.strokeStyle = "rgba(0,0,0,0.25)";
  cx.strokeText(digits, cxpos, cy);
  cx.fillText(digits, cxpos, cy);

  cv.toBlob(b => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `${id}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png", 1.0);
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-promo-id]").forEach(btn => {
    btn.addEventListener("click", () => renderPromo(btn.dataset.promoId));
  });
  document.getElementById("btnAllPromos")?.addEventListener("click", async () => {
    for (const id of Object.keys(PROMO_TEMPLATES)) await renderPromo(id);
  });
});