(()=>{
  "use strict";
  const by=id=>document.getElementById(id);
  const body=document.body;

  function panelOpen(id){const el=by(id);return !!(el&&!el.hidden)}
  function syncPanelState(){
    const hub=by("v224MapGpsHub");
    if(!hub)return;
    const nearby=panelOpen("v224GlobalNearbyPanel");
    const gps=panelOpen("v224GpsPanel");
    hub.classList.toggle("v224-map-gps-panel-open",nearby||gps);
    hub.classList.toggle("v224-map-gps-nearby-open",nearby);
    hub.classList.toggle("v224-map-gps-gps-open",gps);
  }

  function smartMapGpsBack(event){
    if(!window.LibcomlairMapGpsPage?.isActive?.())return false;
    if(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.()}
    if(panelOpen("v224GlobalNearbyPanel")){
      by("v224CloseGlobalMap")?.click();
      setTimeout(syncPanelState,20);
      return true;
    }
    if(panelOpen("v224GpsPanel")){
      by("v224GpsBack")?.click();
      setTimeout(syncPanelState,20);
      return true;
    }
    window.LibcomlairMapGpsPage?.leaveToHome?.();
    return true;
  }

  document.addEventListener("click",event=>{
    const back=event.target?.closest?.("#v224MapGpsBackV33");
    if(back){smartMapGpsBack(event);return}

    const page4Back=event.target?.closest?.("#v224Page4Back");
    if(page4Back && body.classList.contains("v224-page4-step") && !window.LibcomlairMapGpsPage?.isActive?.()){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
      window.LibcomlairMapGpsPage?.open?.();
    }
  },true);

  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#v224NearbyMode,#v224GpsMode,#v224CloseGlobalMap,#v224GpsBack"))setTimeout(syncPanelState,30);
  },true);

  try{
    new MutationObserver(syncPanelState).observe(document.body,{subtree:true,attributes:true,attributeFilter:["hidden","class"]});
  }catch(_){}

  window.addEventListener("libcomlair-map-gps-page",()=>setTimeout(syncPanelState,20));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(syncPanelState,0),{once:true});else setTimeout(syncPanelState,0);

  window.LibcomlairMapGpsPolish=Object.freeze({version:"v224-34",syncPanelState,smartBack:smartMapGpsBack});
})();