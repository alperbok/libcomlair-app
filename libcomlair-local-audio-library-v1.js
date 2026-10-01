(()=>{
"use strict";

const VERSION="v224-1-local-audio-owner";
const DB_NAME="libcomlair-voice-library-v1";
const DB_VERSION=1;
const STORE="audio";
let dbPromise=null;

function normalizeText(text){
  return String(text||"")
    .replace(/\bLibcomlair\b/gi,"Lib comme l’air")
    .replace(/\s+/g," ")
    .trim();
}

function openDb(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    if(!window.indexedDB){reject(new Error("indexeddb-unavailable"));return}
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"text"});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error("local-audio-db-open-failed"));
  }).catch(error=>{dbPromise=null;throw error});
  return dbPromise;
}

async function getByKey(key){
  const clean=normalizeText(key);
  if(!clean)return null;
  try{
    const db=await openDb();
    return await new Promise(resolve=>{
      const tx=db.transaction(STORE,"readonly");
      const req=tx.objectStore(STORE).get(clean);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>resolve(null);
    });
  }catch(_){return null}
}

async function hasText(text){
  const record=await getByKey(text);
  return !!(record?.buffer&&Number(record.buffer.byteLength)>500);
}

async function putBuffer(text,buffer,meta={}){
  const clean=normalizeText(text);
  if(!clean||!buffer||Number(buffer.byteLength)<500)throw new Error("audio-local-invalide");
  const db=await openDb();
  const now=Date.now();
  const previous=await getByKey(clean);
  const record={
    text:clean,
    buffer:buffer.slice(0),
    bytes:Number(buffer.byteLength)||0,
    mime:String(meta.mime||previous?.mime||"audio/mpeg"),
    voice:String(meta.voice||previous?.voice||"voix Libcomlair locale"),
    source:String(meta.source||"local-imported"),
    messageId:String(meta.messageId||previous?.messageId||""),
    createdAt:Number(previous?.createdAt)||now,
    updatedAt:now,
    lastUsedAt:now
  };
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error||new Error("local-audio-db-write-failed"));
    tx.onabort=()=>reject(tx.error||new Error("local-audio-db-write-aborted"));
  });
  try{window.dispatchEvent(new CustomEvent("libcomlair-local-audio-updated",{detail:{text:clean,messageId:record.messageId,bytes:record.bytes,source:record.source}}))}catch(_){}
  return {...record,buffer:undefined};
}

async function putBlob(text,blob,meta={}){
  if(!(blob instanceof Blob))throw new Error("blob-audio-invalide");
  const buffer=await blob.arrayBuffer();
  return putBuffer(text,buffer,{...meta,mime:meta.mime||blob.type||"audio/webm"});
}

async function removeText(text){
  const clean=normalizeText(text);
  if(!clean)return false;
  try{
    const db=await openDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readwrite");
      tx.objectStore(STORE).delete(clean);
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>reject(tx.error||new Error("local-audio-db-delete-failed"));
    });
    try{window.dispatchEvent(new CustomEvent("libcomlair-local-audio-updated",{detail:{text:clean,removed:true}}))}catch(_){}
    return true;
  }catch(_){return false}
}

async function createPlayer(text){
  const record=await getByKey(text);
  if(!record?.buffer||Number(record.buffer.byteLength)<500)return null;
  const mime=String(record.mime||"audio/mpeg");
  const blob=new Blob([record.buffer.slice(0)],{type:mime});
  const url=URL.createObjectURL(blob);
  const audio=new Audio(url);
  audio.preload="auto";
  const dispose=()=>{try{audio.pause()}catch(_){};try{URL.revokeObjectURL(url)}catch(_){}};
  return {audio,record,dispose};
}

async function playText(text,options={}){
  const player=await createPlayer(text);
  if(!player)return {ok:false,reason:"local-audio-missing"};
  const {audio,record,dispose}=player;
  return await new Promise(resolve=>{
    let settled=false;
    const finish=result=>{if(settled)return;settled=true;dispose();resolve(result)};
    audio.addEventListener("playing",()=>{try{options.onstart?.({source:record.source||"local-library",messageId:record.messageId||""})}catch(_){}},{once:true});
    audio.addEventListener("ended",()=>{try{options.onend?.({source:record.source||"local-library",messageId:record.messageId||""})}catch(_){};finish({ok:true,source:record.source||"local-library"})},{once:true});
    audio.addEventListener("error",()=>{try{options.onerror?.({reason:"local-audio-play-error"})}catch(_){};finish({ok:false,reason:"local-audio-play-error"})},{once:true});
    try{
      const p=audio.play();
      if(p&&typeof p.catch==="function")p.catch(error=>finish({ok:false,reason:error?.name||error?.message||"local-audio-play-rejected"}));
    }catch(error){finish({ok:false,reason:error?.name||error?.message||"local-audio-play-rejected"})}
  });
}

async function status(){
  try{
    const db=await openDb();
    const records=await new Promise(resolve=>{
      const tx=db.transaction(STORE,"readonly");
      const req=tx.objectStore(STORE).getAll();
      req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);
      req.onerror=()=>resolve([]);
    });
    const bytes=records.reduce((sum,item)=>sum+(Number(item?.bytes)||Number(item?.buffer?.byteLength)||0),0);
    return {version:VERSION,available:true,entries:records.length,bytes,megabytes:Math.round(bytes/104857.6)/10,db:DB_NAME};
  }catch(error){return {version:VERSION,available:false,entries:0,bytes:0,megabytes:0,db:DB_NAME,error:String(error?.message||error||"")}}
}

window.LibcomlairLocalAudioLibrary=Object.freeze({
  version:VERSION,
  normalizeText,
  getText:getByKey,
  hasText,
  putBuffer,
  putBlob,
  removeText,
  createPlayer,
  playText,
  status
});
openDb().catch(()=>{});
})();
