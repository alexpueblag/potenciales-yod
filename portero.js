/* PORTERO YOD · capa compartida de accesos y bitácora
 * - Captura ?sesion=TOKEN de la liga mágica y lo guarda como credencial (viaja como k).
 * - Si no hay credencial, superpone un gate por CORREO (liga mágica) con botón de WhatsApp.
 * - Bitácora codificada por visita: ● entrada · ◉ abrió caso · ✎ guardó · ⚑ estado
 *   · ☎ WhatsApp · ⤓ export · (Nm ×E) minutos y eventos al cerrar.
 */
(() => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbzCoMIKfgiKELs0efVYE0q20UfPXif-6rvfjZlCPgVuTTIljFqsMrUa9uE_4E18QHgB/exec';
  const LSC = 'pyod_clave_v1';
  const GCID = '920448126277-couctb56pjm4p5vm0tebsj1g592heka9.apps.googleusercontent.com';   // OAuth client_id (público) — 'PENDIENTE' oculta el botón de Google
  const pagina = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  const SIN_GATE = !!(document.currentScript && document.currentScript.dataset && document.currentScript.dataset.singate !== undefined);
  const MODO_SUAVE = !!(document.currentScript && document.currentScript.dataset && document.currentScript.dataset.gate === 'suave');
  const CODIGO = { index: 'PT', mapa: 'MP', macrolotes: 'MA', mixto: 'MX', unifamiliar: 'UN', residencial: 'RE', patrimonial: 'PA', 'track-alysa': 'TA', 'track-maria': 'TM', 'track-codesarrollos': 'TC', accesos: 'AC' }[pagina] || pagina.slice(0, 2).toUpperCase();

  /* 1) canje de liga: ?sesion=TOKEN → credencial local */
  const q = new URLSearchParams(location.search);
  const st = q.get('sesion');
  if (st) {
    localStorage.setItem(LSC, st);
    q.delete('sesion');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  }

  /* 2) bitácora codificada */
  const buf = []; const t0 = Date.now(); let nueva = 1, nEv = 0, cerrado = false;
  const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const d0 = new Date();
  const ev = s => { if (s) { buf.push(String(s).replace(/\s+/g, '·').slice(0, 40)); nEv++; } };
  ev(d0.getDate() + MES[d0.getMonth()] + '·' + d0.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) + '·' + CODIGO + '●');
  const openId = new URLSearchParams(location.search).get('open');
  if (openId) ev('◉…' + String(openId).slice(-5));
  document.addEventListener('click', e => {
    const b = e.target.closest('button,a'); if (!b) return;
    if (b.id === 'gGuardarSolo' || b.id === 'gGuardarEnviar') ev('✎' + (document.getElementById('gPalabra')?.value || ''));
    else if (b.id === 'btnWhats') ev('☎');
    else if (b.id === 'exportJson') ev('⤓');
    else if (b.dataset && b.dataset.estado) ev('⚑' + b.dataset.estado.slice(0, 4));
    else if (b.id === 'btnAbrirPalabra') ev('◉' + (document.getElementById('abrirPalabra')?.value || ''));
    else if (b.classList.contains('lt-item')) ev('◉' + (b.querySelector('.dt')?.textContent.split(' ·')[0] || ''));
    else if (b.classList.contains('pp-a')) ev('◉pin');
    else if (b.id === 'btnNuevo') ev('∅nuevo');
  }, true);
  function flush(fin) {
    const k = localStorage.getItem(LSC); if (!k || !buf.length || cerrado) return;
    let txt = buf.splice(0).join(' ');
    if (fin) { txt += ' (' + Math.max(1, Math.round((Date.now() - t0) / 6e4)) + 'm ×' + nEv + ')'; cerrado = true; }
    const body = JSON.stringify({ k, tipo: 'bitacora', eventos: txt, nueva, request_id: (crypto.randomUUID?.() || Date.now() + '' + Math.random()) });
    nueva = 0;
    if (fin && navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    else fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body }).catch(() => {});
  }
  setTimeout(() => flush(false), 5000);
  setInterval(() => { if (buf.length) flush(false); }, 45000);
  addEventListener('pagehide', () => flush(true));

  /* 3) gate por correo (liga mágica) */
  function overlayCorreo() {
    if (document.getElementById('porteroGate')) return;
    const dv = document.createElement('div'); dv.id = 'porteroGate';
    dv.innerHTML = `
    <style>
      #porteroGate{position:fixed;inset:0;z-index:900;background:#0a0a0cf2;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'Manrope',-apple-system,sans-serif}
      .pg-box{width:min(370px,94vw);text-align:center;background:#131317;border:1px solid rgba(255,255,255,.16);border-radius:18px;padding:24px 20px;color:#f4f1ea}
      .pg-box h2{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:26px;margin:0 0 4px}
      .pg-box p{color:#8a8780;font-size:12px;margin:0 0 16px;line-height:1.5}
      .pg-box input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:11px;padding:12px;color:#f4f1ea;font:inherit;font-size:14px;text-align:center}
      .pg-box input:focus{outline:2px solid #c9a96e66;border-color:#c9a96e}
      .pg-btn{width:100%;margin-top:9px;background:#c9a96e;color:#0a0a0c;border:0;border-radius:11px;padding:12px;font:inherit;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      .pg-btn.ws{background:#25D366;display:none}
      .pg-msg{font-size:12px;font-weight:700;min-height:18px;margin-top:10px;color:#e0c590}
      .pg-alt{margin-top:12px;font-size:10.5px;color:#8a8780;background:none;border:0;text-decoration:underline;cursor:pointer;font-family:inherit}
    </style>
    <div class="pg-box">
      <h2>Boards YOD</h2>
      <p>Escribe tu correo: si tienes acceso te mando una <b>liga mágica</b> (sin contraseñas) que te abre todo por 90 días.</p>
      <input type="email" id="pgCorreo" placeholder="tucorreo@…" autocomplete="email">
      <button class="pg-btn" id="pgEnviar">Enviarme la liga</button>
      <button class="pg-btn ws" id="pgWs">Pedir acceso por WhatsApp</button>
      <div id="pgGoogle" style="margin-top:10px;display:flex;justify-content:center"></div>
      <div class="pg-msg" id="pgMsg"></div>
      <button class="pg-alt" id="pgClave">Tengo una clave del equipo</button>
    </div>`;
    document.body.appendChild(dv);
    const $ = id => document.getElementById(id);
    $('pgEnviar').onclick = async () => {
      const correo = $('pgCorreo').value.trim();
      if (!correo || correo.indexOf('@') < 1) { $('pgMsg').textContent = 'Escribe un correo válido'; return; }
      $('pgEnviar').disabled = true; $('pgMsg').textContent = 'Verificando…';
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ tipo: 'acceso-solicitar', correo, destino: location.href.split('#')[0], request_id: (crypto.randomUUID?.() || Date.now() + '') }) }).then(x => x.json());
        if (r.ok && r.autorizado) { $('pgMsg').textContent = '📬 Liga enviada: revisa tu correo y ábrela en este dispositivo.'; }
        else if (r.ok && !r.autorizado) {
          $('pgMsg').textContent = 'Ese correo aún no tiene acceso — pídelo por WhatsApp:';
          const ws = $('pgWs'); ws.style.display = 'block';
          ws.onclick = () => window.open('https://wa.me/' + (r.whatsapp || '525518331100') + '?text=' + encodeURIComponent('Hola Alejandro, solicito acceso a los boards YOD (' + pagina + '). Mi correo: ' + correo), '_blank');
        } else $('pgMsg').textContent = 'No se pudo: ' + (r.error || 'reintenta');
      } catch (e) { $('pgMsg').textContent = 'Sin conexión — reintenta'; }
      $('pgEnviar').disabled = false;
    };
    $('pgCorreo').addEventListener('keydown', e => { if (e.key === 'Enter') $('pgEnviar').click(); });
    $('pgClave').onclick = () => dv.remove();   // deja al descubierto el gate de clave del board
    // botón "Continuar con Google" (si hay client_id configurado)
    if (GCID && GCID !== 'PENDIENTE') {
      const arma = () => {
        try {
          google.accounts.id.initialize({ client_id: GCID, callback: async resp => {
            $('pgMsg').textContent = 'Verificando con Google…';
            try {
              const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ tipo: 'acceso-google', credential: resp.credential, request_id: (crypto.randomUUID?.() || Date.now() + '') }) }).then(x => x.json());
              if (r.ok && r.autorizado && r.token) { localStorage.setItem(LSC, r.token); $('pgMsg').textContent = '✓ Dentro — cargando…'; location.reload(); }
              else if (r.ok && !r.autorizado) { $('pgMsg').textContent = 'Tu cuenta de Google aún no tiene acceso — pídelo por WhatsApp:'; const ws = $('pgWs'); ws.style.display = 'block'; ws.onclick = () => window.open('https://wa.me/' + (r.whatsapp || '525518331100') + '?text=' + encodeURIComponent('Hola Alejandro, solicito acceso a los boards YOD (' + pagina + ').'), '_blank'); }
              else $('pgMsg').textContent = 'No se pudo con Google: ' + (r.error || 'reintenta');
            } catch (e) { $('pgMsg').textContent = 'Sin conexión — reintenta'; }
          } });
          google.accounts.id.renderButton(document.getElementById('pgGoogle'), { theme: 'outline', size: 'large', text: 'continue_with', locale: 'es', width: 280 });
        } catch (e) {}
      };
      if (window.google && google.accounts) arma();
      else { const sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; sc.onload = arma; document.head.appendChild(sc); }
    }
  }
  function engancharGates() {
    // modo suave (boards con gate propio): nunca tapar; solo ofrecer la liga dentro de su gate
    if (MODO_SUAVE) { const iv = setInterval(() => { const g = document.getElementById('gate') || document.getElementById('mapGate'); if (g && g.offsetParent !== null) { const caja = g.querySelector('.gate-box, .mg-box') || g.firstElementChild; if (caja && !caja.querySelector('.pg-alt2')) { const b = document.createElement('button'); b.className = 'pg-alt2'; b.textContent = '○ Entrar con mi correo (liga mágica)'; b.style.cssText = 'display:block;margin:12px auto 0;font-size:11px;color:#c9a96e;background:none;border:0;text-decoration:underline;cursor:pointer;font-family:inherit'; b.onclick = () => overlayCorreo(); caja.appendChild(b); } } }, 1200); setTimeout(() => clearInterval(iv), 20000); return; }
    // sin credencial → gate de correo encima de todo
    if (!localStorage.getItem(LSC)) { if (!SIN_GATE) overlayCorreo(); return; }
    // con credencial pero si el gate del board reaparece (clave vieja), ofrecer la liga
    setTimeout(() => {
      const g = document.getElementById('gate') || document.getElementById('mapGate');
      if (g && !g.classList.contains('off')) {
        const caja = g.querySelector('.gate-box, .mg-box');
        if (caja && !caja.querySelector('.pg-alt2')) {
          const b = document.createElement('button');
          b.className = 'pg-alt2'; b.textContent = '○ Entrar con mi correo (liga mágica)';
          b.style.cssText = 'margin-top:12px;font-size:11px;color:#e0c590;background:none;border:0;text-decoration:underline;cursor:pointer;font-family:inherit';
          b.onclick = () => overlayCorreo();
          caja.appendChild(b);
        }
      }
    }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', engancharGates);
  else engancharGates();

  /* 4) engrane de admin: valida la credencial una vez por pestaña; si el rol es admin
   *    muestra ⚙️ (accesos); si el token ya murió, limpia y vuelve a pedir el gate. */
  async function engraneAdmin() {
    const k = localStorage.getItem(LSC); if (!k || pagina === 'accesos') return;
    let rol = '';
    try {
      const cache = JSON.parse(sessionStorage.getItem('pyod_rol') || 'null');
      if (cache && cache.f === k.slice(0, 14)) rol = cache.rol;
      else {
        const r = await fetch(ENDPOINT + '?recurso=canje&t=' + encodeURIComponent(k)).then(x => x.json());
        if (r && r.ok) { rol = r.rol || 'vista'; sessionStorage.setItem('pyod_rol', JSON.stringify({ f: k.slice(0, 14), rol })); }
        else if (r && r.ok === false && r.error === 'liga') {
          localStorage.removeItem(LSC); sessionStorage.removeItem('pyod_rol');
          if (!SIN_GATE && !MODO_SUAVE) overlayCorreo();
          return;
        }
      }
    } catch (e) { return; }
    if (rol !== 'admin' || document.getElementById('engraneBtn')) return;
    const b = document.createElement('button');
    b.id = 'engraneBtn'; b.type = 'button'; b.textContent = '⚙️';
    b.title = 'Accesos · quién entra a qué (solo tú lo ves)';
    b.style.cssText = 'position:fixed;right:14px;bottom:64px;z-index:1300;width:42px;height:42px;border-radius:50%;border:1px solid var(--lineaf,rgba(255,255,255,.16));background:var(--card,#131317);color:var(--text,#f4f1ea);font-size:17px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center';
    b.onclick = () => { location.href = 'https://alexpueblag.github.io/potenciales-yod/accesos.html'; };
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', engraneAdmin);
  else engraneAdmin();
})();

/* ================== TEMA CLARO / OSCURO ==================
 * Arranca según la configuración del sistema del usuario (prefers-color-scheme)
 * y se puede cambiar con el botón flotante; el gusto se guarda por dispositivo. */
(() => {
  const LST = 'yod_tema';
  const css = `
  [data-tema="claro"]{--bg:#f4f1e9;--card:#ffffff;--surface:rgba(0,0,0,.04);--text:#1a1814;--muted:#857c6d;--suave:#5f594e;--linea:rgba(0,0,0,.10);--lineaf:rgba(0,0,0,.20);--box:rgba(0,0,0,.05);
    --gold:#b3873f;--goldc:#7d5f1e;--blue:#2f5fc0;--teal:#0f7e95;--pink:#b8455e;--orange:#9c6410;--purple:#5f55c2;--green:#2e7d44;--red:#c23a34;
    --crema:#f4f1e9;--crema-2:#ece7db;--oro:#b3873f;--oro-d:#7d5f1e;--tinta:#1a1814;--tinta-2:#5f594e;
    --c-macrolotes:#b3873f;--c-vertical:#2f5fc0;--c-unifamiliar:#2e7d44;--c-residencial:#0f7e95;--c-patrimonial:#5f55c2;
    --negro:#1a1814;--arena:#ece7db;--piedra:#857c6d;--carbon:#5f594e;--verde:#2e7d44;--amar:#9c6410;--rojo:#c23a34;--rojoclaro:#b8455e;--azul:#7d5f1e;--oro:#b3873f;--oroc:#7d5f1e}
  [data-tema="claro"] body{background:linear-gradient(rgba(0,0,0,.014) 1px,transparent 1px) 0 0/60px 60px,linear-gradient(90deg,rgba(0,0,0,.014) 1px,transparent 1px) 0 0/60px 60px,var(--bg);color:var(--text)}
  [data-tema="claro"] .sticky-header,[data-tema="claro"] header{background:rgba(244,241,233,.95)!important;border-bottom-color:#b3873f66!important;box-shadow:0 4px 18px rgba(0,0,0,.08)!important}
  [data-tema="claro"] .hero{background:linear-gradient(160deg,#ffffff,#f0ebe0)!important}
  [data-tema="claro"] .ppp{background:linear-gradient(160deg,#ffffff,#f3eee4)!important}
  [data-tema="claro"] .drawer{background:#f0ece1}
  [data-tema="claro"] .json-editor{background:#f6f3ec;color:#4a4438}
  [data-tema="claro"] .factor-tooltip{background:#fff;color:#1a1814;border-color:rgba(0,0,0,.22)}
  [data-tema="claro"] .factor-tooltip b{color:#1a1814}
  [data-tema="claro"] #toast{background:#fff;color:#1a1814;box-shadow:0 10px 30px rgba(0,0,0,.25)}
  [data-tema="claro"] .panel{background:rgba(255,255,255,.94)}
  [data-tema="claro"] .pie{background:rgba(255,255,255,.8)}
  [data-tema="claro"] #listaTodos{background:rgba(255,255,255,.98)}
  [data-tema="claro"] .lt-tipo{background:#efe9dc}
  [data-tema="claro"] .pg-box,[data-tema="claro"] .mg-box,[data-tema="claro"] .sheet{background:#fff;color:#1a1814}
  [data-tema="claro"] #porteroGate{background:rgba(244,241,233,.96)}
  [data-tema="claro"] #mapGate{background:rgba(244,241,233,.88)}
  [data-tema="claro"] #gate{background:var(--bg)}
  [data-tema="claro"] .gate-box img,[data-tema="claro"] .brandrow img,[data-tema="claro"] header img{filter:brightness(0) opacity(.82)!important}
  [data-tema="claro"] .viz-card{background:#14141a!important;border-color:#2c2c34!important}
  [data-tema="claro"] .viz-card .k{color:#9a958a!important}
  [data-tema="claro"] .suelo-bar{background:rgba(0,0,0,.18)}
  [data-tema="claro"] .urban-hud{border-top-color:rgba(0,0,0,.12)!important;border-bottom-color:rgba(0,0,0,.12)!important}
  [data-tema="claro"] .urban-item b{color:var(--text)}
  [data-tema="claro"] .hud-row{color:#4a453c!important;border-bottom-color:rgba(0,0,0,.12)!important}
  [data-tema="claro"] .lectura{color:#4a4438}
  [data-tema="claro"] .reference-strip{background:#2e7d440f;border-color:#2e7d4440;color:#3f5c42}
  [data-tema="claro"] .reference-strip b{color:#2e6b3a}
  [data-tema="claro"] .partner-guide{background:#b3873f14;color:#6d5426}
  [data-tema="claro"] .partner-guide b{color:#5a431a}
  [data-tema="claro"] .clave-banner{color:#8a6a2a}
  [data-tema="claro"] .notas-log,[data-tema="claro"] .micro-readout,[data-tema="claro"] .formula-detail,[data-tema="claro"] .proforma-card,[data-tema="claro"] .u-visitas{background:rgba(0,0,0,.035)}
  [data-tema="claro"] .land-mode,[data-tema="claro"] .waterfall-step,[data-tema="claro"] .advanced-board,[data-tema="claro"] details.advanced{background:rgba(0,0,0,.03)}
  [data-tema="claro"] .land-mode.active{background:#b3873f1f}
  [data-tema="claro"] .val-display,[data-tema="claro"] .edit-pill{background:rgba(0,0,0,.06);color:var(--text)}
  [data-tema="claro"] input[type=range]::-webkit-slider-runnable-track{background:rgba(0,0,0,.14)}
  [data-tema="claro"] input[type=range]::-webkit-slider-thumb{background:#3a352c}
  [data-tema="claro"] .gate-box input,[data-tema="claro"] .seg-row input,[data-tema="claro"] .fld input,[data-tema="claro"] .fld textarea,[data-tema="claro"] .pg-box input,[data-tema="claro"] .mg-box input,[data-tema="claro"] .fila-alta input,[data-tema="claro"] .fila-alta select{background:rgba(0,0,0,.05);color:var(--text)}
  [data-tema="claro"] .small-btn.secondary{background:rgba(0,0,0,.06)}
  [data-tema="claro"] .caso-item:hover,[data-tema="claro"] .lt-item:hover,[data-tema="claro"] .cstep:hover{background:rgba(0,0,0,.04)}
  [data-tema="claro"] .leaflet-popup-content-wrapper,[data-tema="claro"] .leaflet-popup-tip{background:#fff;color:#1a1814;border-color:rgba(0,0,0,.15)}
  [data-tema="claro"] .flow-table th,[data-tema="claro"] .flow-table td{border-bottom-color:rgba(0,0,0,.08)}
  [data-tema="claro"] .badge.hecho{background:#2e7d4422;color:#2e6b3a}
  [data-tema="claro"] .badge.encurso{background:#9c641022;color:#7d5310}
  [data-tema="claro"] .badge.pendiente{background:#c23a341a;color:#a03530}
  [data-tema="claro"] .badge.porconfirmar{background:#2f5fc01f;color:#2b52a4}
  [data-tema="claro"] .thumb{background:#ece7db}
  #temaBtn{position:fixed;right:14px;bottom:14px;z-index:1300;width:42px;height:42px;border-radius:50%;border:1px solid var(--lineaf);background:var(--card);color:var(--text);font-size:18px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}
  [data-tema="claro"] #temaBtn{box-shadow:0 6px 18px rgba(0,0,0,.18)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const guardado = localStorage.getItem(LST);
  const sistema = () => (matchMedia && matchMedia('(prefers-color-scheme: light)').matches) ? 'claro' : 'oscuro';
  let tema = guardado || sistema();
  function aplicar(t) {
    tema = t;
    document.documentElement.dataset.tema = t;
    const b = document.getElementById('temaBtn'); if (b) { b.textContent = t === 'claro' ? '🌙' : '☀️'; b.title = t === 'claro' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'; }
    ajustarMapa(t);
  }
  function ajustarMapa(t) {
    try {
      const m = window._pyodMap || window._map; if (!m || !window.L) return;
      m.eachLayer(l => { if (l instanceof L.TileLayer && /basemaps\.cartocdn/.test(l._url || '')) l.setUrl('https://{s}.basemaps.cartocdn.com/' + (t === 'claro' ? 'light_all' : 'dark_all') + '/{z}/{x}/{y}{r}.png'); });
    } catch (e) {}
  }
  function boton() {
    if (document.getElementById('temaBtn')) return;
    const b = document.createElement('button'); b.id = 'temaBtn'; b.type = 'button';
    b.onclick = () => { const nuevo = tema === 'claro' ? 'oscuro' : 'claro'; localStorage.setItem(LST, nuevo); aplicar(nuevo); };
    document.body.appendChild(b); aplicar(tema);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boton); else boton();
  // si el usuario no ha elegido, seguir los cambios del sistema en vivo
  if (!guardado && window.matchMedia) matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', e => aplicar(e.matches ? 'claro' : 'oscuro'));
  // los mapas se crean async: reintentar el ajuste de tiles unos segundos
  let n = 10; const iv = setInterval(() => { ajustarMapa(tema); if (--n <= 0) clearInterval(iv); }, 800);
})();
