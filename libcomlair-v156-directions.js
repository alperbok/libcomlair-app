(function(){
"use strict";

const API_BASE="https://libcomlair-backend.onrender.com";
const STATIC_BASE="data/idfm-directions";
const STATIC_VERSION="156";
const staticShardCache=new Map();
const CACHE_KEY="libcomlair-idfm-directions-v156";
const CACHE_TTL=24*60*60*1000;
const REQUEST_TIMEOUT=25000;
let requestSerial=0;
let legacyObserver=null;

function loadCache(){
  try{
    const x=JSON.parse(localStorage.getItem(CACHE_KEY)||"{}");
    return x&&typeof x==="object"&&!Array.isArray(x)?x:{};
  }catch(_){return {}}
}
function saveCache(cache){
  try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}catch(_){}
}
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
  let box=document.querySelector("#idfmDirectionDetailsV153");
  if(box)return box;
  const anchor=document.querySelector("#idfmLineDetails")||document.querySelector("#detailMeta");
  if(!anchor)return null;
  box=document.createElement("section");
  box.id="idfmDirectionDetailsV153";
  box.hidden=true;
  box.setAttribute("aria-live","polite");
  anchor.insertAdjacentElement("afterend",box);
  return box;
}
function resetBox(){
  if(legacyObserver){legacyObserver.disconnect();legacyObserver=null}
  const box=getBox();
  if(!box)return null;
  box.hidden=true;
  box.dataset.ready="0";
  box.replaceChildren();
  return box;
}
function titleNode(){
  const h=document.createElement("h3");
  h.textContent="Lignes et directions";
  return h;
}
function showLoading(box){
  box.replaceChildren();
  const note=document.createElement("p");
  note.className="data-note";
  note.textContent="Chargement des directions officielles…";
  box.append(titleNode(),note);
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
      if(!key)continue;
      if(!merged.has(key)){
        merged.set(key,{
          id,shortName,longName,
          operator:String((raw&&raw.operator)||"").trim(),
          mode:String((raw&&raw.mode)||"").trim(),
          directions:new Set()
        });
      }
      const item=merged.get(key);
      for(const d of (Array.isArray(raw&&raw.directions)?raw.directions:[])){
        const x=String(d||"").trim();
        if(x)item.directions.add(x);
      }
    }
  }
  return [...merged.values()].sort((a,b)=>{
    const aa=a.shortName||a.longName||a.id;
    const bb=b.shortName||b.longName||b.id;
    return aa.localeCompare(bb,"fr",{numeric:true,sensitivity:"base"});
  });
}
function serializable(lines){
  return lines.map(x=>({
    id:x.id||"",
    shortName:x.shortName||"",
    longName:x.longName||"",
    operator:x.operator||"",
    mode:x.mode||"",
    directions:[...x.directions]
  }));
}
function fromSerializable(lines){
  return (Array.isArray(lines)?lines:[]).map(x=>({
    id:String(x.id||""),
    shortName:String(x.shortName||""),
    longName:String(x.longName||""),
    operator:String(x.operator||""),
    mode:String(x.mode||""),
    directions:new Set(Array.isArray(x.directions)?x.directions.map(y=>String(y||"").trim()).filter(Boolean):[])
  }));
}
function cacheId(ids){return ids.slice().sort().join(",")}
function getCached(ids){
  const cache=loadCache(),hit=cache[cacheId(ids)];
  if(!hit||!Array.isArray(hit.lines)||Date.now()-Number(hit.time||0)>CACHE_TTL)return null;
  return fromSerializable(hit.lines);
}
function setCached(ids,lines){
  const cache=loadCache();
  cache[cacheId(ids)]={time:Date.now(),lines:serializable(lines)};
  const keys=Object.keys(cache).sort((a,b)=>(cache[b].time||0)-(cache[a].time||0));
  for(const k of keys.slice(100))delete cache[k];
  saveCache(cache);
}
function hideLegacyLinesWhenReady(box){
  const legacy=document.querySelector("#idfmLineDetails");
  if(!legacy)return;
  legacy.hidden=true;
  legacyObserver=new MutationObserver(()=>{
    if(box.dataset.ready==="1"&&!legacy.hidden)legacy.hidden=true;
  });
  legacyObserver.observe(legacy,{attributes:true,childList:true,characterData:true,subtree:true});
}
function renderLines(box,lines,cached){
  box.replaceChildren();
  box.appendChild(titleNode());
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
    if(directions.length===1)li.textContent="Ligne "+name+" — Direction : "+directions[0];
    else if(directions.length>1)li.textContent="Ligne "+name+" — Directions : "+directions.join(" • ");
    else li.textContent="Ligne "+name+" — Direction non renseignée.";
    list.appendChild(li);
  }
  box.appendChild(list);
  const source=document.createElement("p");
  source.className="data-note";
  source.textContent=(cached?"Directions enregistrées récemment. ":"")+"Source : données officielles GTFS d’Île-de-France Mobilités, regroupées automatiquement par arrêt.";
  box.appendChild(source);
  box.dataset.ready="1";
  box.hidden=false;
  hideLegacyLinesWhenReady(box);
}
function showFailure(box,p,serial){
  box.replaceChildren();
  box.appendChild(titleNode());
  const note=document.createElement("p");
  note.className="data-note";
  note.textContent="Les directions mettent trop de temps à répondre.";
  const retry=document.createElement("button");
  retry.className="details-btn";
  retry.type="button";
  retry.textContent="Réessayer les directions";
  retry.onclick=()=>loadDirections(p,box,serial);
  box.append(note,retry);
  box.hidden=false;
}
async function fetchStaticShard(prefix){
  if(staticShardCache.has(prefix))return staticShardCache.get(prefix);
  const task=(async()=>{
    try{
      const r=await fetch(STATIC_BASE+"/"+encodeURIComponent(prefix)+".json?v="+STATIC_VERSION,{cache:"no-cache"});
      if(!r.ok)return null;
      const d=await r.json();
      return d&&d.stops&&typeof d.stops==="object"?d:null;
    }catch(_){return null}
  })();
  staticShardCache.set(prefix,task);
  return task;
}
async function fetchStaticPayloads(ids){
  const prefixes=[...new Set(ids.map(id=>String(id).padStart(2,"0").slice(0,2)))];
  const shards=await Promise.all(prefixes.map(fetchStaticShard));
  const byPrefix=new Map();
  prefixes.forEach((p,i)=>byPrefix.set(p,shards[i]));
  const payloads=[];
  for(const id of ids){
    const prefix=String(id).padStart(2,"0").slice(0,2);
    const shard=byPrefix.get(prefix);
    const lines=shard&&shard.stops&&Array.isArray(shard.stops[id])?shard.stops[id]:null;
    if(lines)payloads.push({status:"ok",stopId:id,lines,source:"static"});
  }
  return payloads;
}
async function fetchOne(id){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
  try{
    const r=await fetch(API_BASE+"/api/idfm/gtfs-directions-v151?id="+encodeURIComponent(id),{
      headers:{Accept:"application/json"},
      signal:controller.signal
    });
    if(!r.ok)throw new Error("HTTP "+r.status);
    return await r.json();
  }finally{clearTimeout(timer)}
}
async function fetchAll(ids){
  const payloads=[];
  for(let i=0;i<ids.length;i+=2){
    const batch=ids.slice(i,i+2);
    const settled=await Promise.allSettled(batch.map(fetchOne));
    for(const r of settled)if(r.status==="fulfilled")payloads.push(r.value);
  }
  return payloads;
}
function loadDirections(p,box,serial){
  const ids=cleanStopIds(p);
  if(!ids.length)return;
  showLoading(box);
  fetchStaticPayloads(ids).then(staticPayloads=>{
    if(serial!==requestSerial)return;
    const staticLines=mergeLines(staticPayloads);
    if(staticLines.length){
      setCached(ids,staticLines);
      renderLines(box,staticLines,false);
      return;
    }
    return fetchAll(ids).then(payloads=>{
      if(serial!==requestSerial)return;
      const detail=document.querySelector("#detail");
      if(!detail||detail.hidden)return;
      const lines=mergeLines(payloads);
      if(lines.length){
        setCached(ids,lines);
        renderLines(box,lines,false);
      }else showFailure(box,p,serial);
    });
  }).catch(()=>{
    if(serial!==requestSerial)return;
    fetchAll(ids).then(payloads=>{
      const lines=mergeLines(payloads);
      if(lines.length){
        setCached(ids,lines);
        renderLines(box,lines,false);
      }else showFailure(box,p,serial);
    }).catch(()=>showFailure(box,p,serial));
  });
}

const originalOpenDetails=window.openDetails;
if(typeof originalOpenDetails!=="function")return;

window.openDetails=function(p){
  originalOpenDetails(p);
  const serial=++requestSerial;
  const box=resetBox();
  if(!box||!p||p.idfm!==true)return;
  const ids=cleanStopIds(p);
  if(!ids.length)return;
  const cached=getCached(ids);
  if(cached&&cached.length){
    renderLines(box,cached,true);
    return;
  }
  loadDirections(p,box,serial);
};
try{openDetails=window.openDetails}catch(_){}
})();