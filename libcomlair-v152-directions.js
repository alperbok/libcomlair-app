(function(){
"use strict";

const API_BASE="https://libcomlair-backend.onrender.com";
let requestSerial=0;
let legacyObserver=null;

function cleanStopIds(p){
  const ids=[];
  if(p&&p.idfmGroup&&Array.isArray(p.idfmMembers)){
    for(const m of p.idfmMembers){
      const id=String((m&&m.id)||"").trim();
      if(/^\d+$/.test(id)&&!ids.includes(id)) ids.push(id);
    }
  }
  const own=String((p&&p.id)||"").trim();
  if(/^\d+$/.test(own)&&!ids.includes(own)) ids.unshift(own);
  return ids.slice(0,12);
}

function getBox(){
  let box=document.querySelector("#idfmDirectionDetailsV152");
  if(box) return box;
  const anchor=document.querySelector("#idfmLineDetails")||document.querySelector("#detailMeta");
  if(!anchor) return null;
  box=document.createElement("section");
  box.id="idfmDirectionDetailsV152";
  box.hidden=true;
  box.setAttribute("aria-live","polite");
  anchor.insertAdjacentElement("afterend",box);
  return box;
}

function resetBox(){
  if(legacyObserver){legacyObserver.disconnect();legacyObserver=null;}
  const box=getBox();
  if(!box) return null;
  box.hidden=true;
  box.dataset.ready="0";
  box.replaceChildren();
  return box;
}

function showLoading(box){
  box.replaceChildren();
  const title=document.createElement("h3");
  title.textContent="Lignes et directions";
  const note=document.createElement("p");
  note.className="data-note";
  note.textContent="Chargement des directions officielles…";
  box.append(title,note);
  box.hidden=false;
}

function mergeLines(payloads){
  const merged=new Map();
  for(const data of payloads){
    const lines=Array.isArray(data&&data.lines)?data.lines:[];
    for(const raw of lines){
      const id=String((raw&&raw.id)||"").trim();
      const shortName=String((raw&&raw.shortName)||"").trim();
      const longName=String((raw&&raw.longName)||"").trim();
      const key=id||shortName||longName;
      if(!key) continue;
      if(!merged.has(key)){
        merged.set(key,{
          id,
          shortName,
          longName,
          operator:String((raw&&raw.operator)||"").trim(),
          mode:String((raw&&raw.mode)||"").trim(),
          directions:new Set()
        });
      }
      const item=merged.get(key);
      for(const d of (Array.isArray(raw&&raw.directions)?raw.directions:[])){
        const direction=String(d||"").trim();
        if(direction) item.directions.add(direction);
      }
    }
  }
  return [...merged.values()].sort((a,b)=>{
    const aa=a.shortName||a.longName||a.id;
    const bb=b.shortName||b.longName||b.id;
    return aa.localeCompare(bb,"fr",{numeric:true,sensitivity:"base"});
  });
}

function hideLegacyLinesWhenReady(box){
  const legacy=document.querySelector("#idfmLineDetails");
  if(!legacy) return;
  legacy.hidden=true;
  legacyObserver=new MutationObserver(()=>{
    if(box.dataset.ready==="1"&&!legacy.hidden) legacy.hidden=true;
  });
  legacyObserver.observe(legacy,{attributes:true,childList:true,characterData:true,subtree:true});
}

function renderLines(box,lines){
  box.replaceChildren();
  const title=document.createElement("h3");
  title.textContent="Lignes et directions";
  box.appendChild(title);

  if(!lines.length){
    const note=document.createElement("p");
    note.className="data-note";
    note.textContent="Aucune direction officielle n’a été trouvée pour cet arrêt.";
    box.appendChild(note);
    box.hidden=false;
    return;
  }

  const list=document.createElement("ul");
  list.className="access-list";
  for(const line of lines){
    const li=document.createElement("li");
    const name=line.shortName||line.longName||line.id||"Ligne";
    const directions=[...line.directions];
    if(directions.length===1){
      li.textContent="Ligne "+name+" — Direction : "+directions[0];
    }else if(directions.length>1){
      li.textContent="Ligne "+name+" — Directions : "+directions.join(" • ");
    }else{
      li.textContent="Ligne "+name+" — Direction non renseignée dans les données GTFS.";
    }
    list.appendChild(li);
  }
  box.appendChild(list);

  const source=document.createElement("p");
  source.className="data-note";
  source.textContent="Directions issues des données officielles GTFS d’Île-de-France Mobilités.";
  box.appendChild(source);
  box.dataset.ready="1";
  box.hidden=false;
  hideLegacyLinesWhenReady(box);
}

async function fetchOne(id){
  const r=await fetch(API_BASE+"/api/idfm/gtfs-directions-v151?id="+encodeURIComponent(id),{
    headers:{Accept:"application/json"}
  });
  if(!r.ok) throw new Error("HTTP "+r.status);
  return r.json();
}

async function fetchAll(ids){
  const payloads=[];
  for(let i=0;i<ids.length;i+=3){
    const batch=ids.slice(i,i+3);
    const settled=await Promise.allSettled(batch.map(fetchOne));
    for(const result of settled){
      if(result.status==="fulfilled") payloads.push(result.value);
    }
  }
  return payloads;
}

const originalOpenDetails=window.openDetails;
if(typeof originalOpenDetails!=="function") return;

window.openDetails=function(p){
  originalOpenDetails(p);
  const serial=++requestSerial;
  const box=resetBox();

  if(!box||!p||p.idfm!==true) return;

  const ids=cleanStopIds(p);
  if(!ids.length) return;

  showLoading(box);

  fetchAll(ids).then(payloads=>{
    if(serial!==requestSerial) return;
    const detail=document.querySelector("#detail");
    if(!detail||detail.hidden) return;
    renderLines(box,mergeLines(payloads));
  }).catch(()=>{
    if(serial!==requestSerial) return;
    box.replaceChildren();
    const title=document.createElement("h3");
    title.textContent="Lignes et directions";
    const note=document.createElement("p");
    note.className="data-note";
    note.textContent="Les directions sont temporairement indisponibles.";
    box.append(title,note);
    box.hidden=false;
  });
};

try{ openDetails=window.openDetails; }catch(_){}
})();