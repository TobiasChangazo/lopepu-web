// carrito.js

document.addEventListener('DOMContentLoaded', () => {
  // 0) REFERENCIAS Y DATOS GLOBALES
  const infoBox   = document.getElementById('info-box');
  const menuBox   = document.getElementById('menu-box');
  const btnCont   = document.getElementById('btn-continuar');
  const btnBack   = document.getElementById('btn-back');
  const btnExit   = document.getElementById('btn-exit');
  const itemsDiv  = document.getElementById('pedido-items');
  const vacioDiv  = document.getElementById('pedido-vacio');
  const totalDiv  = document.getElementById('pedido-total');
  const pedidoNote = document.getElementById('pedido-note'); // disclaimer envío

  let clienteTipo       = 'Retiro';
  let clienteNombre     = "";
  let clienteDireccion  = "";
  let pedido            = [];

  // Helper: inicializa un dropdown custom dado su contenedor y hidden
  function initCustomPicker(containerId, hiddenId, placeholder) {
    const cs      = document.getElementById(containerId);
    const trigger = cs.querySelector('.select-trigger');
    const opts    = cs.querySelector('.options');

    trigger.textContent = placeholder;
    cs.classList.remove('open');

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      cs.classList.toggle('open');
    });

    document.addEventListener('click', e => {
      if (!cs.contains(e.target)) cs.classList.remove('open');
    });

    opts.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', () => {
        trigger.textContent = opt.textContent;
        cs.classList.remove('open');
        document.getElementById(hiddenId).value = opt.dataset.value;
      });
    });
  }

  // 1) Selector tipo de entrega con botones circulares
  const entregaBtns       = document.querySelectorAll('.entrega-btn');
  const direccionInicial  = document.getElementById('direccion-inicial');
  entregaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      entregaBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      clienteTipo = btn.dataset.tipo;
      direccionInicial.style.display = (clienteTipo === 'Envío') ? 'block' : 'none';

      // Mostrar/ocultar disclaimer de envío
      if (pedidoNote) {
        pedidoNote.style.display = (clienteTipo === 'Envío') ? 'block' : 'none';
      }
    });
  });

  // 2) BOTÓN “Volver” (regresa al form inicial)
  btnBack.onclick = () => {
    menuBox.style.display = 'none';
    infoBox.style.display = 'block';
  };

  // 3) BOTÓN “Volver al menú” (ícono X)
  btnExit.onclick = () => {
    window.location.href = 'index.html';
  };

  // 4) BOTÓN “Continuar” (valida y abre menú)
  btnCont.onclick = () => {
    const nombre = document.getElementById('clienteNombre').value.trim();
    if (!nombre) return alert('Ingresá tu nombre y apellido.');
    clienteNombre = nombre;

    if (clienteTipo === 'Envío') {
      const dir = document.getElementById('clienteDireccion').value.trim();
      if (!dir) return alert('Ingresá la dirección de envío.');
      clienteDireccion = dir;
    } else {
      clienteDireccion = "";
    }

    infoBox.style.display = 'none';
    menuBox.style.display = 'block';

    // actualizar disclaimer al entrar al menú
    if (pedidoNote) {
      pedidoNote.style.display = (clienteTipo === 'Envío') ? 'block' : 'none';
    }
  };

  // 5) DATOS DE PRODUCTOS
  const pizzas = [
    { nombre:"Muzzarella",      grande:8000, chica:5900 },
    { nombre:"Jamón y Morrón",  grande:10000, chica:7200 },
    { nombre:"Jamón Solo",      grande:10000, chica:7200 },
    { nombre:"Jamón y Huevo",   grande:10000, chica:7200 },
    { nombre:"Napolitana",      grande:10000, chica:7200 },
    { nombre:"Fugazzeta",       grande:10000, chica:7200 },
    { nombre:"Cebolla y Tomate", grande:10000, chica:7200 },
    { nombre:"Cebolla y Albahaca", grande:10000, chica:7200 },
    { nombre:"Albahaca",        grande:10000, chica:7200 },
    { nombre:"Capresse",        grande:10000, chica:7200 },
    { nombre:"Calabresa",       grande:10000, chica:7200 },
    { nombre:"Papas Pay",       grande:10000, chica:7200 },
    { nombre:"Choclo",          grande:10000, chica:7200 },
    { nombre:"Huevo Solo",      grande:10000, chica:7200 },
    { nombre:"Ananá",           grande:11500, chica:7600 },
    { nombre:"Anchoa",          grande:11500, chica:7600 },
    { nombre:"Roquefort",       grande:11500, chica:7600 },
    { nombre:"3 Quesos",        grande:11500, chica:7600 },
    { nombre:"Palmito",         grande:11500, chica:7600 }
  ];
  const empanadas = [
    { nombre:"Carne",           precio:1500 },
    { nombre:"Jamón y Queso",   precio:1500 },
    { nombre:"Pollo",           precio:1500 },
    { nombre:"Cebolla y Queso", precio:1500 }
  ];
  const tartas = [
    { nombre:"Jamón y Queso",  precio:10000 }
  ];
  const conos_gustos = ["Jamón","Morrón","Huevo","Choclo","Cebolla","Tomate","Albahaca","Papas Pay"];
  const conos = [
    { nombre:"Cono Pizza",      precio:5500 }
  ];

  // === HELPERS PROMOS ===

  // Lista de "Especiales" (precio grande $10000) — AJUSTÁ si cambiás la carta
  const ESPECIALES_10000 = new Set([
    "Jamón y Morrón","Jamón Solo","Jamón y Huevo","Napolitana","Fugazzeta",
    "Cebolla y Tomate","Cebolla y Albahaca","Albahaca","Capresse",
    "Calabresa","Papas Pay","Choclo","Huevo Solo"
  ]);

  const PRICES = {
    muzzaG: 8000,
    especialG: 10000,
    emp: 1500
  };

  // Devuelve {half:true, p1, p2} si es 1/2 y 1/2, sino {half:false}
  function parseHalf(flavor) {
    if (typeof flavor !== 'string') return { half:false };
    // formato que usa tu app: "1/2 A y 1/2 B"
    const m = flavor.match(/^1\/2\s(.+)\s+y\s+1\/2\s(.+)$/i);
    if (!m) return { half:false };
    return { half:true, p1:m[1].trim(), p2:m[2].trim() };
  }

  // Clasifica una pizza del carrito como 'muzza' | 'especial' | null
  function classifyPizza(item) {
    if (item.type !== 'pizza' || item.size !== 'grande') return null;

    // si es simple
    if (!item.flavor) return null;
    const half = parseHalf(item.flavor);
    if (!half.half) {
      if (item.flavor === 'Muzzarella') return 'muzza';
      if (ESPECIALES_10000.has(item.flavor)) return 'especial';
      return null;
    }
    // 1/2 y 1/2: cuenta como "especial" sólo si AMBOS gustos son especiales $10000
    if (ESPECIALES_10000.has(half.p1) && ESPECIALES_10000.has(half.p2)) return 'especial';
    // si alguno es muzza u otro precio NO lo contamos para promos
    return null;
  }

  // 6) Renderizado del carrito y borrar ítems
  function renderPedido() {
    itemsDiv.innerHTML = '';
    if (!pedido.length) {
      vacioDiv.style.display = 'block';
      totalDiv.textContent   = '';
      const lista = document.getElementById('pedido-lista');
      lista?.querySelectorAll('.promo-line').forEach(n => n.remove());
      return;
    }
    vacioDiv.style.display = 'none';

    // Subtotal del pedido "real"
    let subtotal = pedido.reduce((acc, it) => acc + it.subtotal, 0);

    // === Agrupar visualmente por desc + nota ===
    const groupsMap = new Map();
    pedido.forEach(it => {
      const key = `${it.desc}|${it.nota || ''}`;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, { desc: it.desc, nota: it.nota || '', cant: 0, subtotal: 0 });
      }
      const g = groupsMap.get(key);
      g.cant     += it.cant;
      g.subtotal += it.subtotal;
    });

    // Pintar grupos
    [...groupsMap.entries()].forEach(([key, g]) => {
      const el = document.createElement('div');
      el.className = 'pedido-item';
      el.innerHTML = `
        <div class="info">
          <span class="titulo">${g.desc}</span><br>
          ${g.nota ? `<span class="nota">${g.nota}</span><br>` : ''}
          <span class="subtotal">x${g.cant} = $${g.subtotal}</span>
        </div>
        <button class="borrar" onclick="borrarGrupo('${encodeURIComponent(key)}')">&times;</button>
      `;
      itemsDiv.appendChild(el);
    });

    // === Promos y total con descuento ===
    const { promos, discount } = computePromos(pedido);

    const lista = document.getElementById('pedido-lista');
    lista.querySelectorAll('.promo-line').forEach(n => n.remove());
    promos.forEach(p => {
      const line = document.createElement('div');
      line.className = 'promo-line';
      line.style.cssText = `
        margin: 6px 0 0;
        padding: 6px 8px;
        background:#e8fff0;
        border-left: 4px solid #28a745;
        border-radius: 6px;
        font-weight: 700;
        color:#1b5e20;
      `;
      line.textContent = `PROMO x${p.qty}: ${p.label}`;
      lista.insertBefore(line, totalDiv);
    });

    const total = subtotal - discount;
    totalDiv.textContent = `TOTAL: $${total}`;
  }
  window.borrarGrupo = function(encodedKey){
    const key = decodeURIComponent(encodedKey);
    for (let i = pedido.length - 1; i >= 0; i--) {
      const it = pedido[i];
      const k  = `${it.desc}|${it.nota || ''}`;
      if (k === key) pedido.splice(i, 1);
    }
    renderPedido();
  };

  window.borrarItem = idx => {
    pedido.splice(idx,1);
    renderPedido();
  };

  // 7) Selección de categoría
  document.querySelectorAll('.opcion-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.opcion-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      mostrarOpciones(btn.dataset.cat);
    };
  });

  // 8) Mostrar opciones dinámicas por categoría
  function mostrarOpciones(cat) {
    let html = '';
    if (cat === 'Pizza') {
      html = `
        <div class="detalle-card">
          <label>¿Cómo querés tu Pizza?</label>
          <div style="margin-bottom:8px;">
            <label style="margin-right:18px;">
              <input type="radio" name="pizzaTamTipo" value="simple" checked> 1 Variedad
            </label>
            <label>
              <input type="radio" name="pizzaTamTipo" value="doble"> 1/2 y 1/2 <span style="font-size:.95em;color:#b2b2b2">(sólo grande)</span>
            </label>
          </div>
          <label>Tamaño:</label>
          <select id="pizzaTam">
            <option value="grande">Grande</option>
            <option value="chica">Chica</option>
          </select>
          <div id="pizza-gustos"></div>
          <label>Cantidad:</label>
          <input type="number" id="pizzaCant" value="1" min="1" style="width:70px;">
          <label>Nota (opcional):</label>
          <input type="text" id="pizzaNota" placeholder="ej: sin aceitunas">
          <button class="agregar-btn" onclick="agregarPizza()">Agregar Pizza</button>
        </div>
      `;
    }
    else if (cat === 'Empanada') {
      html = `
        <div class="detalle-card">
          <label>Variedad:</label>
          <div class="custom-select" id="cs-empanada">
            <div class="select-trigger"></div>
            <div class="options">
              ${empanadas.map(x=>`
                <div class="option" data-value="${x.nombre}">${x.nombre}</div>
              `).join('')}
            </div>
          </div>
          <input type="hidden" id="empanadaSabor" name="empanadaSabor" />
          <label>Cantidad:</label>
          <input type="number" id="empanadaCant" value="1" min="1" style="width:70px;">
          <button class="agregar-btn" onclick="agregarEmpanada()">Agregar Empanada</button>
        </div>
      `;
    }
    else if (cat === 'Tarta') {
      html = `
        <div class="detalle-card">
          <label>Variedad:</label>
          <div class="custom-select" id="cs-tarta">
            <div class="select-trigger"></div>
            <div class="options">
              ${tartas.map(x=>`
                <div class="option" data-value="${x.nombre}">${x.nombre}</div>
              `).join('')}
            </div>
          </div>
          <input type="hidden" id="tartaSabor" name="tartaSabor" />
          <label>Cantidad:</label>
          <input type="number" id="tartaCant" value="1" min="1" style="width:70px;">
          <button class="agregar-btn" onclick="agregarTarta()">Agregar Tarta</button>
        </div>
      `;
    }
    else if (cat === 'Cono') {
      html = `
        <div class="detalle-card">
          <label>¿Cuántos gustos?</label>
          <div style="margin-bottom:8px;">
            <label style="margin-right:18px;">
              <input type="radio" name="conoTipo" value="1" checked> 1 Gusto
            </label>
            <label>
              <input type="radio" name="conoTipo" value="2"> 2 Gustos
            </label>
          </div>
          <div id="cono-gustos"></div>
          <label>Cantidad:</label>
          <input type="number" id="conoCant" value="1" min="1" style="width:70px;">
          <button class="agregar-btn" onclick="agregarCono()">Agregar Cono</button>
        </div>
      `;
    }

    document.getElementById('opciones-detalles').innerHTML = html;

    // inicializar pickers
    if (cat === 'Pizza') {
      pizzaGustoPicker();
    }
    if (cat === 'Empanada') {
      initCustomPicker('cs-empanada','empanadaSabor','Elegir sabor');
    }
    if (cat === 'Tarta') {
      initCustomPicker('cs-tarta','tartaSabor','Elegir sabor');
    }
    if (cat === 'Cono') {
      conoGustoPicker();
    }
  }

  // 8) Pickers dinámicos con dropdown oculto hasta click
  function pizzaGustoPicker() {
    const gustosDiv = document.getElementById('pizza-gustos');
    function renderPicker() {
      const tam  = document.getElementById('pizzaTam').value;
      const tipo = document.querySelector('input[name="pizzaTamTipo"]:checked').value;
      let lista = pizzas.map(x => `<div class="option" data-value="${x.nombre}">${x.nombre}</div>`).join('');

      let html = '<label>Variedad:</label>';

      if (tam === 'chica' || tipo === 'simple') {
        html += `
          <div class="custom-select">
            <div class="select-trigger">Seleccioná un gusto</div>
            <div class="options">${lista}</div>
          </div>
        `;
        document.querySelector('input[value="doble"]').disabled = (tam === 'chica');
      } else {
        html += `
          <div class="custom-select">
            <div class="select-trigger">Elegí sabor 1</div>
            <div class="options">${lista}</div>
          </div>
          <div class="custom-select">
            <div class="select-trigger">Elegí sabor 2</div>
            <div class="options">${lista}</div>
          </div>
        `;
        document.querySelector('input[value="doble"]').disabled = false;
      }
      gustosDiv.innerHTML = html;

      // Asociar listeners de cada custom-select
      gustosDiv.querySelectorAll('.custom-select').forEach((cs, idx) => {
        const trigger = cs.querySelector('.select-trigger');
        const opts    = cs.querySelector('.options');

        trigger.addEventListener('click', () => cs.classList.toggle('open'));
        document.addEventListener('click', e => {
          if (!cs.contains(e.target)) cs.classList.remove('open');
        });

        opts.querySelectorAll('.option').forEach(opt => {
          opt.addEventListener('click', () => {
            trigger.textContent = opt.textContent;
            cs.classList.remove('open');
            // asignar hidden input
            const id = (idx === 0) ? 'pizza1' : 'pizza2';
            let hidden = document.getElementById(id);
            if (!hidden) {
              hidden = document.createElement('input');
              hidden.type = 'hidden';
              hidden.id   = id;
              hidden.name = id;
              gustosDiv.appendChild(hidden);
            }
            hidden.value = opt.dataset.value;
          });
        });
      });
    }

    gustosDiv.innerHTML = '';
    renderPicker();
    document.getElementById('pizzaTam').addEventListener('change', renderPicker);
    document.querySelectorAll('input[name="pizzaTamTipo"]')
            .forEach(radio => radio.addEventListener('change', renderPicker));
  }

  function conoGustoPicker() {
    const gustosDiv = document.getElementById('cono-gustos');
    function renderPicker() {
      const tipo = document.querySelector('input[name="conoTipo"]:checked').value;
      let lista = conos_gustos.map(x => `<div class="option" data-value="${x}">${x}</div>`).join('');
      let html = '';

      if (tipo === '1') {
        html = `
          <div class="custom-select">
            <div class="select-trigger">Elegi un sabor</div>
            <div class="options">${lista}</div>
          </div>
        `;
      } else {
        html = `
          <div class="custom-select">
            <div class="select-trigger">Elegir sabor</div>
            <div class="options">${lista}</div>
          </div>
          <div class="custom-select">
            <div class="select-trigger">Elegir sabor</div>
            <div class="options">${lista}</div>
          </div>
        `;
      }
      gustosDiv.innerHTML = html;

      gustosDiv.querySelectorAll('.custom-select').forEach((cs, idx) => {
        const trigger = cs.querySelector('.select-trigger');
        const opts    = cs.querySelector('.options');

        trigger.addEventListener('click', () => cs.classList.toggle('open'));
        document.addEventListener('click', e => {
          if (!cs.contains(e.target)) cs.classList.remove('open');
        });

        opts.querySelectorAll('.option').forEach(opt => {
          opt.addEventListener('click', () => {
            trigger.textContent = opt.textContent;
            cs.classList.remove('open');
            const id = (idx === 0) ? 'conoGustos' : 'conoGusto2';
            let hidden = document.getElementById(id);
            if (!hidden) {
              hidden = document.createElement('input');
              hidden.type = 'hidden';
              hidden.id   = id;
              hidden.name = id;
              gustosDiv.appendChild(hidden);
            }
            hidden.value = opt.dataset.value;
          });
        });
      });
    }

    gustosDiv.innerHTML = '';
    renderPicker();
    document.querySelectorAll('input[name="conoTipo"]')
            .forEach(radio => radio.addEventListener('change', renderPicker));
  }

  // 9) Funciones para agregar productos al pedido
  // === PIZZAS ===
  window.agregarPizza = function() {
    const tipoP = document.querySelector('input[name="pizzaTamTipo"]:checked').value;
    const tam   = document.getElementById('pizzaTam').value;
    let variedad, precioUnitario;

    if (tam === 'chica' || tipoP === 'simple') {
      const g  = document.getElementById('pizza1').value;
      variedad = g;
      const pObj = pizzas.find(x => x.nombre === g);
      precioUnitario = (tam === 'grande') ? pObj.grande : pObj.chica;
    } else {
      const p1 = document.getElementById('pizza1').value;
      const p2 = document.getElementById('pizza2').value;
      const v1 = pizzas.find(x => x.nombre === p1).grande;
      const v2 = pizzas.find(x => x.nombre === p2).grande;
      precioUnitario = Math.round(((v1 + v2) / 2) / 100) * 100;
      variedad = `1/2 ${p1} y 1/2 ${p2}`;
    }

    const cant     = parseInt(document.getElementById('pizzaCant').value) || 1;
    const nota     = (document.getElementById('pizzaNota')?.value || '').trim();
    const subtotal = precioUnitario * cant;

    pedido.push({
      desc: `🍕 Pizza ${variedad} (${tam})`,
      cant,
      subtotal,
      nota,
      // metadatos para promos
      type: 'pizza',
      flavor: variedad,   // ej: "Muzzarella" o "1/2 A y 1/2 B"
      size: tam,          // "grande" | "chica"
      unit: precioUnitario
    });
    renderPedido();
  };

  // === EMPANADAS ===
  window.agregarEmpanada = function() {
    const s = document.getElementById('empanadaSabor').value;
    const c = parseInt(document.getElementById('empanadaCant').value) || 1;
    const p = empanadas.find(x => x.nombre === s).precio;

    pedido.push({
      desc: `🥟 Empanada ${s}`,
      cant: c,
      subtotal: p * c,
      nota: "",
      // metadatos para promos
      type: 'empanada',
      unit: p
    });
    renderPedido();
  };

  // === TARTAS ===
  window.agregarTarta = function() {
    const s = document.getElementById('tartaSabor').value;
    const c = parseInt(document.getElementById('tartaCant').value) || 1;
    const p = tartas.find(x => x.nombre === s).precio;

    pedido.push({
      desc: `🥧 Tarta ${s}`,
      cant: c,
      subtotal: p * c,
      nota: "",
      type: 'tarta',
      unit: p
    });
    renderPedido();
  };

  // === CONOS ===
  window.agregarCono = function() {
    const tipo = document.querySelector('input[name="conoTipo"]:checked').value;
    let g = "";
    if (tipo === "1") g = document.getElementById("conoGustos").value;
    else              g = document.getElementById("conoGusto2").value;

    const c = parseInt(document.getElementById("conoCant").value) || 1;
    const p = conos[0].precio;

    pedido.push({
      desc: `🌯 Cono Pizza (${g})`,
      cant: c,
      subtotal: p * c,
      nota: "",
      type: 'cono',
      unit: p
    });
    renderPedido();
  };

  // Helper robusto: detecta combinadas 1/2 y 1/2
  function esMediaYMedia(texto) {
    const s = (texto || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    // coincide 1/2 (con o sin espacios) o el símbolo ½
    const tieneMedio = /\b1\s*\/\s*2\b|½/.test(s);
    // y que haya dos mitades separadas por " y "
    const tieneDosMitades = /1\s*\/\s*2|½/.test(s) && /\by\b/.test(s);
    return tieneMedio && tieneDosMitades;
  }

  // Envío a WhatsApp — Formato Cliente (condicional Retiro/Envío + total)
document.getElementById('btn-wsp').onclick = function () {
  if (!pedido.length) { alert('Tu pedido está vacío.'); return; }

  const nombre     = (clienteNombre || '').trim() || '(Sin nombre)';
  const direccion  = (clienteDireccion || '').trim() || '';
  const referencia = (typeof clienteReferencia !== 'undefined' ? (clienteReferencia || '').trim() : '');

  // Calculamos total con promos
  const subtotal = pedido.reduce((acc, it) => acc + it.subtotal, 0);
  const { discount, promos } = computePromos(pedido); // función ya definida en tu archivo
  const total = subtotal - discount;
  const fmt   = n => n.toLocaleString('es-AR');

  // Texto de promos en una sola línea (si hay)
  let promosTxt = '';
  if (promos && promos.length) {
    promosTxt = ' (' + promos.map(p => `x${p.qty} Promo ${p.label}`).join(', ') + ')';
  }

  // ==== Cabecera (Dirección/Referencia SOLO si es Envío) ====
  let msg = `Datos del cliente:
• Nombre y apellido: ${nombre}`;
  if (clienteTipo === 'Envío') {
    msg += `\n• Dirección: ${direccion || '(Sin dirección)'}`
    if (referencia) msg += `\n• Referencia: ${referencia}`;
  }
  msg += `

Pedido:
`;

  // --- AGRUPADO para el mensaje (tipo + base + nota) ---
  const grupos = new Map();
  pedido.forEach(it => {
    let base = '';
    const tipo = it.type;
    const nota = (it.nota || '').trim();

    if (tipo === 'pizza') {
      base = (it.flavor || it.desc.replace(/^.*Pizza\s*/, '')).trim();
    } else if (tipo === 'empanada') {
      base = it.desc.replace(/^.*Empanada\s*/, '').trim();
    } else if (tipo === 'tarta') {
      base = it.desc.replace(/^.*Tarta\s*/, '').trim();
    } else if (tipo === 'cono') {
      base = it.desc.match(/\((.*?)\)/)?.[1] || '';
    } else {
      base = it.desc.replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*/u,'').trim();
    }

    const key = `${tipo}|${base}|${nota}`;
    if (!grupos.has(key)) {
      grupos.set(key, { tipo, base, nota, cant: 0, half: (tipo==='pizza' && esMediaYMedia(base)) });
    }
    grupos.get(key).cant += it.cant;
  });

  for (const g of grupos.values()) {
    let linea = '';
    if (g.tipo === 'pizza') {
      linea = g.half ? (g.cant === 1 ? g.base : `${g.cant} x ${g.base}`)
                     : `${g.cant} ${g.base}`;
    } else if (g.tipo === 'empanada') {
      const palabra = g.cant === 1 ? 'Empanada' : 'Empanadas';
      linea = `${g.cant} ${palabra} de ${g.base}`;
    } else if (g.tipo === 'tarta') {
      const palabra = g.cant === 1 ? 'Tarta' : 'Tartas';
      linea = `${g.cant} ${palabra} de ${g.base}`;
    } else if (g.tipo === 'cono') {
      const palabra = g.cant === 1 ? 'Cono Pizza' : 'Conos Pizza';
      linea = `${g.cant} ${palabra}${g.base ? ` (${g.base})` : ''}`;
    } else {
      linea = `${g.cant} ${g.base}`;
    }
    if (g.nota) linea += ` (${g.nota})`;
    msg += `• ${linea}\n`;
  }

  // ==== Pie: SIEMPRE "Total pedido" (reemplaza Medio de Pago) ====
  msg += `\nTotal pedido: $${fmt(total)}${promosTxt}`;

  // Enviar a WhatsApp
  const phone = '5492324674311'; // tu número
  const enc   = encodeURIComponent(msg);
  const isDesktop = !/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  const url = isDesktop
    ? `https://web.whatsapp.com/send?phone=${phone}&text=${enc}`
    : `https://wa.me/${phone}?text=${enc}`;

  window.location.href = url;
};
  
  // ---- PROMOS ----
  // Promo: 1 Muzzarella grande + 6 empanadas a $15.500
  function computePromos(items) {
    // Contadores de recursos
    let muzza = 0;       // pizzas muzza grande
    let especial = 0;    // pizzas especiales grande (o 1/2 + 1/2 especiales)
    let emp = 0;         // empanadas sueltas

    items.forEach(it => {
      if (it.type === 'pizza') {
        const kind = classifyPizza(it); // 'muzza' | 'especial' | null
        if (kind === 'muzza') muzza += it.cant;
        if (kind === 'especial') especial += it.cant;
      } else if (it.type === 'empanada') {
        emp += it.cant;
      }
    });

    const promos = []; // {label, qty}
    let discount = 0;

    // ====== PRIORIDAD: combos con DOCENAS + pizzas ======
    // 1 ESPECIAL + 1 DOC $24500  (normal 10000 + 12*1500=28000 => save 3500)
    let take = Math.min(especial, Math.floor(emp/12));
    if (take > 0) {
      promos.push({ label: "1 ESPECIAL + 1 DOC", qty: take });
      discount += (10000 + 12*1500 - 24500) * take; // 3500
      especial -= take; emp -= take*12;
    }

    // 1 MUZZA + 1 DOC $22500 (normal 8000 + 18000=26000 => save 3500)
    take = Math.min(muzza, Math.floor(emp/12));
    if (take > 0) {
      promos.push({ label: "1 MUZZA + 1 DOC", qty: take });
      discount += (8000 + 12*1500 - 22500) * take; // 3500
      muzza -= take; emp -= take*12;
    }

    // ====== combos con 1/2 doc + pizzas ======
    // 1 ESPECIAL + 1/2 DOC $17500 (normal 10000 + 9000=19000 => save 1500)
    take = Math.min(especial, Math.floor(emp/6));
    if (take > 0) {
      promos.push({ label: "1 ESPECIAL + 1/2 DOC", qty: take });
      discount += (10000 + 6*1500 - 17500) * take; // 1500
      especial -= take; emp -= take*6;
    }

    // 1 MUZZA + 1/2 DOC $15500 (normal 8000 + 9000=17000 => save 1500)
    take = Math.min(muzza, Math.floor(emp/6));
    if (take > 0) {
      promos.push({ label: "1 MUZZA + 1/2 DOC", qty: take });
      discount += (8000 + 6*1500 - 15500) * take; // 1500
      muzza -= take; emp -= take*6;
    }

    // ====== combos sólo pizzas ======
    // 3 MUZZA $22800 (normal 24000 => save 1200)
    take = Math.floor(muzza / 3);
    if (take > 0) {
      promos.push({ label: "3 MUZZA", qty: take });
      discount += (3*8000 - 22800) * take; // 1200
      muzza -= take*3;
    }

    // 2 MUZZA $15400 (normal 16000 => save 600)
    take = Math.floor(muzza / 2);
    if (take > 0) {
      promos.push({ label: "2 MUZZA", qty: take });
      discount += (2*8000 - 15400) * take; // 600
      muzza -= take*2;
    }

    // 3 ESPECIALES $29000 (normal 30000 => save 1000)
    take = Math.floor(especial / 3);
    if (take > 0) {
      promos.push({ label: "3 ESPECIALES", qty: take });
      discount += (3*10000 - 29000) * take; // 1000
      especial -= take*3;
    }

    // 2 ESPECIALES $19000 (normal 20000 => save 1000)
    take = Math.floor(especial / 2);
    if (take > 0) {
      promos.push({ label: "2 ESPECIALES", qty: take });
      discount += (2*10000 - 19000) * take; // 1000
      especial -= take*2;
    }

    // 1 ESPECIAL + 1 MUZZA $17500 (normal 18000 => save 500)
    take = Math.min(especial, muzza);
    if (take > 0) {
      promos.push({ label: "1 ESPECIAL + 1 MUZZA", qty: take });
      discount += ((10000 + 8000) - 17500) * take; // 500
      especial -= take; muzza -= take;
    }

    // ====== packs de empanadas ======
    // 2 DOC $29000 (normal 36000 => save 7000)
    take = Math.floor(emp / 24);
    if (take > 0) {
      promos.push({ label: "2 DOC", qty: take });
      discount += (24*1500 - 29000) * take; // 7000
      emp -= take*24;
    }

    // 1 DOC $15000 (normal 18000 => save 3000)
    take = Math.floor(emp / 12);
    if (take > 0) {
      promos.push({ label: "1 DOC", qty: take });
      discount += (12*1500 - 15000) * take; // 3000
      emp -= take*12;
    }

    // 1/2 DOC $8000 (normal 9000 => save 1000)
    take = Math.floor(emp / 6);
    if (take > 0) {
      promos.push({ label: "1/2 DOC", qty: take });
      discount += (6*1500 - 8000) * take; // 1000
      emp -= take*6;
    }

    return { promos, discount };
  }

  renderPedido();
});
