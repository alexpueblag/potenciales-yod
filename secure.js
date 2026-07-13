(function(){
  "use strict";
  try{localStorage.removeItem("pyod_clave_v1");}catch(_error){}
  try{
    if(location.search||location.hash){
      history.replaceState(null,"",location.pathname);
    }
  }catch(_error){}
  window.POTENCIALES_STATUS=Object.freeze({
    state:"MAINTENANCE",
    cloudSync:false,
    publicData:false,
    localDrafts:"preserved-for-controlled-migration"
  });
})();
