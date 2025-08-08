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
    { nombre:"Cebolla y Queso", precio:1500 },
    { nombre:"Humita",          precio:1500 },
  ];
  const tartas = [
    { nombre:"Jamón y Morrón",  precio:1500 }
  ];
  const conos_gustos = ["Jamón","Morrón","Huevo","Choclo","Cebolla","Tomate","Albahaca","Papas Pay"];
  const conos = [
    { nombre:"Cono Pizza",      precio:5500 }
  ];

    // 6) Renderizado del carrito y borrar ítems
  function renderPedido() {
    itemsDiv.innerHTML = '';
    if (!pedido.length) {
      vacioDiv.style.display = 'block';
      totalDiv.textContent    = '';
      return;
    }
    vacioDiv.style.display = 'none';
    let total = 0;
    pedido.forEach((item, i) => {
      total += item.subtotal;
      const el = document.createElement('div');
      el.className = 'pedido-item';
      el.innerHTML = `
        <div class="info">
          <span class="titulo">${item.desc}</span><br>
          ${item.nota ? `<span class="nota">${item.nota}</span><br>` : ''}
          <span class="subtotal">x${item.cant} = $${item.subtotal}</span>
        </div>
        <button class="borrar" onclick="borrarItem(${i})">&times;</button>
      `;
      itemsDiv.appendChild(el);
    });
    totalDiv.textContent = `TOTAL: $${total}`;
  }
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
      initCustomPicker('cs-empanada','empanadaSabor','Seleccioná empanada');
    }
    if (cat === 'Tarta') {
      initCustomPicker('cs-tarta','tartaSabor','Seleccioná tarta');
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
            <div class="select-trigger">Elegí sabor</div>
            <div class="options">${lista}</div>
          </div>
        `;
      } else {
        html = `
          <div class="custom-select">
            <div class="select-trigger">Gusto 1</div>
            <div class="options">${lista}</div>
          </div>
          <div class="custom-select">
            <div class="select-trigger">Gusto 2</div>
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
  window.agregarPizza = function() {
    const tipoP = document.querySelector('input[name="pizzaTamTipo"]:checked').value;
    const tam   = document.getElementById('pizzaTam').value;
    let variedad, precioUnitario;

    if (tam==='chica' || tipoP==='simple') {
      const g  = document.getElementById('pizza1').value;
      variedad      = g;
      const pObj    = pizzas.find(x => x.nombre === g);
      precioUnitario = (tam==='grande') ? pObj.grande : pObj.chica;
    } else {
      const p1    = document.getElementById('pizza1').value;
      const p2    = document.getElementById('pizza2').value;
      const v1    = pizzas.find(x => x.nombre === p1).grande;
      const v2    = pizzas.find(x => x.nombre === p2).grande;
      precioUnitario = Math.round(((v1+v2)/2)/100)*100;
      variedad = `1/2 ${p1} y 1/2 ${p2}`;
    }

    const cant    = parseInt(document.getElementById('pizzaCant').value)||1;
    const nota    = (document.getElementById('pizzaNota')?.value||'').trim();
    const subtotal= precioUnitario * cant;

    pedido.push({ desc:`🍕 Pizza ${variedad} (${tam})`, cant, subtotal, nota });
    renderPedido();
  };

   window.agregarEmpanada = function() {
    const s = document.getElementById('empanadaSabor').value;
    const c = parseInt(document.getElementById('empanadaCant').value)||1;
    const p = empanadas.find(x=>x.nombre===s).precio;
    pedido.push({ desc:`🥟 Empanada ${s}`, cant:c, subtotal:p*c, nota:"" });
    renderPedido();
  };
  window.agregarTarta = function() {
    const s = document.getElementById('tartaSabor').value;
    const c = parseInt(document.getElementById('tartaCant').value)||1;
    const p = tartas.find(x=>x.nombre===s).precio;
    pedido.push({ desc:`🥧 Tarta ${s}`, cant:c, subtotal:p*c, nota:"" });
    renderPedido();
  };

  window.agregarCono = function() {
    const tipo = document.querySelector('input[name="conoTipo"]:checked').value;
    let g = "";
    if (tipo==="1") g = document.getElementById("conoGustos").value;
    else             g = document.getElementById("conoGusto2").value;
    const c = parseInt(document.getElementById("conoCant").value)||1;
    const p = conos[0].precio;
    pedido.push({ desc:`🌯 Cono Pizza (${g})`, cant:c, subtotal:p*c, nota:"" });
    renderPedido();
  };

  // 10) Envío a WhatsApp
    document.getElementById('btn-wsp').addEventListener('click', () => {
    if (!pedido.length) return alert('Tu pedido está vacío.');
    let msg = `Hola, soy ${clienteNombre} y quiero hacer un pedido para (${clienteTipo}).\n\n`;
    if (clienteTipo==='Envío') msg += `Dirección: ${clienteDireccion}\n\n`;
    pedido.forEach(i => {
      const descClean = i.desc.substring(i.desc.indexOf(' ')+1);
      msg += `* (${i.cant}) ${descClean}` + (i.nota?` (${i.nota})`:'') + `.\n`;
    });
    msg += `\n* El envío es aparte del precio que marca la página.`;
    window.open('https://wa.me/5492324674311?text=' + encodeURIComponent(msg), '_blank');
  });
  

  // 11) Render inicial
  renderPedido();
});
