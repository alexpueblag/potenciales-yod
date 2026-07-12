/* PORTERO YOD · capa compartida de accesos y bitácora
 * - Captura ?sesion=TOKEN de la liga mágica y lo guarda como credencial (viaja como k).
 * - Si no hay credencial, superpone un gate por CORREO (liga mágica) con botón de WhatsApp.
 * - Bitácora codificada por visita: ● entrada · ◉ abrió caso · ✎ guardó · ⚑ estado
 *   · ☎ WhatsApp · ⤓ export · (Nm ×E) minutos y eventos al cerrar.
 */
(() => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbzCoMIKfgiKELs0efVYE0q20UfPXif-6rvfjZlCPgVuTTIljFqsMrUa9uE_4E18QHgB/exec';
  const LSC = 'pyod_clave_v1';
  const pagina = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
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
  }
  function engancharGates() {
    // sin credencial → gate de correo encima de todo
    if (!localStorage.getItem(LSC)) { overlayCorreo(); return; }
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
})();
