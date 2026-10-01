(()=>{
"use strict";

const VERSION="v224-1";
const nativeFetch=window.fetch.bind(window);
let active=false;
let blocked=[];

function developerAllowed(){
  try{return window.LibcomlairDeveloperMaintenance?.isEnabled?.()===true}catch(_){return false}
}

function urlOf(input){
  try{
    if(typeof input==="string")return new URL(input,location.href);
    if(input instanceof URL)return input;
    if(input&&typeof input.url==="string")return new URL(input.url,location.href);
  }catch(_){}
  return null;
}

function shouldBlock(input){
  const url=urlOf(input);
  if(!url)return false;
  return url.origin!==location.origin;
}

function remember(url){
  const item={time:Date.now(),url:String(url||"").slice(0,240)};
  blocked.push(item);
  if(blocked.length>30)blocked=blocked.slice(-30);
  try{window.dispatchEvent(new CustomEvent("libcomlair-external-service-blocked",{detail:item}))}catch(_){}
}

window.fetch=function(input,init){
  if(active&&shouldBlock(input)){
    const url=urlOf(input);
    remember(url?.origin||url?.href||"external");
    const error=new TypeError("libcomlair_external_service_test_blocked");
    error.code="LIBCOMLAIR_EXTERNAL_TEST_BLOCKED";
    return Promise.reject(error);
  }
  return nativeFetch(input,init);
};

function enable(){
  if(!developerAllowed())return {ok:false,reason:"developer-mode-required",active:false};
  active=true;
  try{document.documentElement.dataset.libcomlairExternalServices="blocked-test"}catch(_){}
  try{window.dispatchEvent(new CustomEvent("libcomlair-external-service-test",{detail:{active:true}}))}catch(_){}
  return {ok:true,active:true};
}

function disable(){
  active=false;
  try{delete document.documentElement.dataset.libcomlairExternalServices}catch(_){}
  try{window.dispatchEvent(new CustomEvent("libcomlair-external-service-test",{detail:{active:false}}))}catch(_){}
  return {ok:true,active:false};
}

function status(){return {version:VERSION,active,developerOnly:true,scope:"cross-origin-fetch",blockedCount:blocked.length,lastBlocked:blocked.at(-1)||null}}

window.LibcomlairExternalServiceTestMode=Object.freeze({version:VERSION,enable,disable,status,blocked:()=>blocked.map(x=>({...x}))});
})();
