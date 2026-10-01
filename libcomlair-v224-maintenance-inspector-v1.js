(()=>{
"use strict";

const VERSION="v224-1";
const URLS=Object.freeze({
  external:"data/architecture/libcomlair-external-dependencies-v1.json",
  modules:"data/architecture/libcomlair-module-dependencies-v1.json",
  offline:"config/libcomlair-offline-essential-assets-v1.json"
});
const memo=new Map();

async function readJson(key,{fresh=false}={}){
  if(!fresh&&memo.has(key))return structuredCloneSafe(memo.get(key));
  const url=URLS[key];
  if(!url)throw new Error("unknown-maintenance-registry");
  const response=await fetch(url,{cache:fresh?"no-store":"default"});
  if(!response.ok)throw new Error("HTTP "+response.status+" — "+url);
  const data=await response.json();
  memo.set(key,data);
  return structuredCloneSafe(data);
}

function structuredCloneSafe(value){
  try{return structuredClone(value)}catch(_){return JSON.parse(JSON.stringify(value))}
}

async function inspectExternalDependencies(){
  const registry=await readJson("external",{fresh:true});
  const dependencies=Array.isArray(registry?.dependencies)?registry.dependencies:[];
  const critical=dependencies.filter(x=>x?.criticalForBoot===true);
  const temporary=dependencies.filter(x=>x?.targetState&&x.targetState!=="network-enrichment-only"&&x.id!=="github-pages-hosting");
  return {
    version:VERSION,
    total:dependencies.length,
    criticalForBoot:critical.map(x=>x.id),
    temporaryDependencies:temporary.map(x=>x.id),
    dependencies
  };
}

function textExternal(snapshot){
  const s=snapshot||{};
  const lines=["Dépendances externes recensées : "+(s.total||0)];
  if(s.criticalForBoot?.length)lines.push("Encore critique au démarrage : "+s.criticalForBoot.join(", "));
  else lines.push("Aucun fournisseur externe de fonction n’est déclaré critique au démarrage.");
  for(const d of (s.dependencies||[])){
    lines.push((d.label||d.id)+" — rôle : "+(d.currentRole||"non renseigné")+" — cible : "+(d.targetState||"non renseignée"));
  }
  return lines.join("\n");
}

async function dependencyMatrix(){
  const registry=await readJson("modules",{fresh:true});
  return {version:VERSION,modules:Array.isArray(registry?.modules)?registry.modules:[]};
}

function textMatrix(snapshot){
  const lines=[];
  for(const m of (snapshot?.modules||[])){
    lines.push((m.moduleId||"module")+" → retester : "+(Array.isArray(m.mustRetest)?m.mustRetest.join(", "):"non renseigné"));
  }
  return lines.join("\n")||"Aucune dépendance de module renseignée.";
}

async function offlineReadiness(){
  const manifest=await readJson("offline",{fresh:true});
  const assets=[...(manifest?.entrypoints||[]),...(manifest?.criticalAssets||[])];
  const unique=[...new Set(assets.filter(Boolean))];
  const checks=[];
  for(const asset of unique){
    try{
      const response=await fetch(asset,{method:"HEAD",cache:"no-store"});
      checks.push({asset,ok:response.ok,status:response.status});
    }catch(error){
      checks.push({asset,ok:false,status:0,error:String(error?.message||error||"fetch-error")});
    }
  }
  const present=checks.filter(x=>x.ok).length;
  let serviceWorkerControlled=false;
  let serviceWorkerSupported=false;
  try{
    serviceWorkerSupported="serviceWorker" in navigator;
    serviceWorkerControlled=!!navigator.serviceWorker?.controller;
  }catch(_){}
  return {
    version:VERSION,
    manifestStatus:manifest?.status||"unknown",
    runtimeActive:manifest?.runtimeActive===true,
    total:checks.length,
    present,
    missing:checks.filter(x=>!x.ok).map(x=>x.asset),
    assetAvailabilityPercent:checks.length?Math.round(present*100/checks.length):0,
    serviceWorkerSupported,
    serviceWorkerControlled,
    checks
  };
}

function textOffline(snapshot){
  const s=snapshot||{};
  const lines=[
    "Ressources essentielles disponibles en ligne : "+(s.present||0)+" / "+(s.total||0)+" ("+(s.assetAvailabilityPercent||0)+" %)",
    "Cache hors ligne activé pour cette architecture : "+(s.runtimeActive?"oui":"non — préparation seulement"),
    "Service Worker pris en charge : "+(s.serviceWorkerSupported?"oui":"non"),
    "Page actuellement contrôlée par un Service Worker : "+(s.serviceWorkerControlled?"oui":"non")
  ];
  if(s.missing?.length)lines.push("Ressources à corriger avant activation : "+s.missing.join(", "));
  else lines.push("Toutes les ressources déclarées dans le manifeste répondent actuellement.");
  return lines.join("\n");
}

window.LibcomlairMaintenanceInspector=Object.freeze({
  version:VERSION,
  inspectExternalDependencies,
  textExternal,
  dependencyMatrix,
  textMatrix,
  offlineReadiness,
  textOffline
});
})();
