import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib";
import fontkit from "https://cdn.skypack.dev/@pdf-lib/fontkit";

const PATH_PDF   = "/assets/pdf/menu-template.pdf";
const PATH_DATA  = "/assets/menu-data.json";
const PATH_FONT  = "/assets/fonts/Cinzel-Bold.ttf";

const fmtArs = new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0
});

function buildPriceMap(data) {
  const map = new Map();
  for (const sec of data.sections) for (const item of sec.items) {
    map.set(item.id, item.price);
  }
  return map;
}

const FIELD_MAP = {
  muzza_chica: "fld_muzza_chica",
  muzza: "fld_muzza",
  especial_chica: "fld_especial_chica",
  especial: "fld_especial",

  promo_2_muzzas: "fld_promo_2_muzzas",
  promo_3_muzzas: "fld_promo_3_muzzas",
  promo_muzza_6_emp: "fld_promo_muzza_6_emp",
  promo_muzza_12_emp: "fld_promo_muzza_12_emp",
  promo_muzza_especial: "fld_promo_muzza_especial",
  promo_2_especiales: "fld_promo_2_especiales",
  promo_3_especiales: "fld_promo_3_especiales",
  promo_especial_6_emp: "fld_promo_especial_6_emp",
  promo_especial_12_emp: "fld_promo_especial_12_emp",

  emp_unidad: "fld_emp_unidad",
  emp_6: "fld_emp_6",
  emp_12: "fld_emp_12",
  emp_24: "fld_emp_24",

  tarta_jyq: "fld_tarta_jyq",
  cono_pizza: "fld_cono_pizza"
};

async function generateMenuPdfAcroform() {
  const [pdfRes, dataRes, fontRes] = await Promise.all([
    fetch(PATH_PDF),
    fetch(PATH_DATA),
    fetch(PATH_FONT)
  ]);
  const [pdfBytes, data, fontBytes] = [
    new Uint8Array(await pdfRes.arrayBuffer()),
    await dataRes.json(),
    await fontRes.arrayBuffer()
  ];

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const cinzel = await pdfDoc.embedFont(fontBytes, { subset: true });

  const form = pdfDoc.getForm();
  const prices = buildPriceMap(data);

  for (const [id, fieldName] of Object.entries(FIELD_MAP)) {
    const field = form.getTextField(fieldName);
    const val   = prices.get(id);
    if (field && val != null) {
      field.setText(fmtArs.format(val));
      field.updateAppearances(cinzel);
    }
  }

  form.flatten();

  const out = await pdfDoc.save();
  const blob = new Blob([out], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: "menu.pdf" });
  a.click();
  URL.revokeObjectURL(url);
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnMenuPdfAcroform")
    ?.addEventListener("click", generateMenuPdfAcroform);
});