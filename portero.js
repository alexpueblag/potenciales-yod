/* Compatibilidad fail-closed: el portero de clave compartida fue retirado. */
(function(){
  "use strict";
  try{localStorage.removeItem("pyod_clave_v1");}catch(_error){}
  window.POTENCIALES_PORTERO=Object.freeze({state:"RETIRED",authorized:false});
})();
