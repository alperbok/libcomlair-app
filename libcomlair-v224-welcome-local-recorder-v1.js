(()=>{
"use strict";

const VERSION="v224-1-local-welcome-recorder";
const MESSAGE_ID="welcome.main";
const MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
let stream=null;
let recorder=null;
let chunks=[];
let startedAt=0;
let stopPromise=null;
let stopResolve=null;

function developerAllowed(){
  try{return window.LibcomlairDeveloperMaintenance?.isEnabled?.()===true}catch(_){return false}
}

function library(){return window.LibcomlairLocalAudioLibrary||null}

function preferredMime(){
  const MR=window.MediaRecorder;
  if(typeof MR!=="function")return "";
  const choices=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"];
  for(const type of choices){try{if(!MR.isTypeSupported||MR.isTypeSupported(type))return type}catch(_){}}
  return "";
}

function status(){
  return {
    version:VERSION,
    developerOnly:true,
    supported:!!(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder&&library()),
    recording:!!(recorder&&recorder.state==="recording"),
    startedAt,
    mime:recorder?.mimeType||"",
    messageId:MESSAGE_ID
  };
}

async function start(){
  if(!developerAllowed())return {ok:false,reason:"developer-mode-required"};
  if(!library())return {ok:false,reason:"local-audio-library-missing"};
  if(recorder&&recorder.state==="recording")return {ok:false,reason:"already-recording"};
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder!=="function")return {ok:false,reason:"media-recorder-unavailable"};
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mime=preferredMime();
    recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
    chunks=[];
    startedAt=Date.now();
    stopPromise=new Promise(resolve=>{stopResolve=resolve});
    recorder.addEventListener("dataavailable",event=>{if(event.data&&event.data.size>0)chunks.push(event.data)});
    recorder.addEventListener("stop",async()=>{
      const localRecorder=recorder;
      const localStream=stream;
      recorder=null;
      stream=null;
      try{localStream?.getTracks?.().forEach(track=>track.stop())}catch(_){}
      try{
        const blob=new Blob(chunks,{type:localRecorder?.mimeType||chunks[0]?.type||"audio/webm"});
        chunks=[];
        if(blob.size<500)throw new Error("recording-too-small");
        await library().putBlob(MESSAGE,blob,{source:"local-recorded",voice:"voix locale de test",messageId:MESSAGE_ID,mime:blob.type});
        const result={ok:true,bytes:blob.size,mime:blob.type,messageId:MESSAGE_ID};
        try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-local-recorded",{detail:result}))}catch(_){}
        stopResolve?.(result);
      }catch(error){
        stopResolve?.({ok:false,reason:String(error?.message||error||"recording-save-failed")});
      }finally{
        stopResolve=null;
        stopPromise=null;
        startedAt=0;
      }
    },{once:true});
    recorder.start(250);
    return {ok:true,mime:recorder.mimeType||mime||"audio/*"};
  }catch(error){
    try{stream?.getTracks?.().forEach(track=>track.stop())}catch(_){}
    stream=null;recorder=null;chunks=[];startedAt=0;
    return {ok:false,reason:String(error?.name||error?.message||error||"microphone-access-failed")};
  }
}

async function stop(){
  if(!developerAllowed())return {ok:false,reason:"developer-mode-required"};
  if(!recorder||recorder.state!=="recording")return {ok:false,reason:"not-recording"};
  const pending=stopPromise;
  try{recorder.stop()}catch(error){return {ok:false,reason:String(error?.message||error||"stop-failed")}}
  return pending||{ok:false,reason:"stop-promise-missing"};
}

async function importFile(file){
  if(!developerAllowed())return {ok:false,reason:"developer-mode-required"};
  if(!library())return {ok:false,reason:"local-audio-library-missing"};
  if(!(file instanceof File))return {ok:false,reason:"file-required"};
  const maxBytes=15*1024*1024;
  if(file.size<500)return {ok:false,reason:"audio-file-too-small"};
  if(file.size>maxBytes)return {ok:false,reason:"audio-file-too-large"};
  if(file.type&& !String(file.type).startsWith("audio/"))return {ok:false,reason:"audio-file-required"};
  try{
    await library().putBlob(MESSAGE,file,{source:"local-imported",voice:"audio local importé",messageId:MESSAGE_ID,mime:file.type||"audio/mpeg"});
    const result={ok:true,bytes:file.size,mime:file.type||"audio/mpeg",messageId:MESSAGE_ID};
    try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-local-recorded",{detail:result}))}catch(_){}
    return result;
  }catch(error){return {ok:false,reason:String(error?.message||error||"audio-import-failed")}}
}

async function test(){
  if(!developerAllowed())return {ok:false,reason:"developer-mode-required"};
  if(!library())return {ok:false,reason:"local-audio-library-missing"};
  return await library().playText(MESSAGE);
}

async function remove(){
  if(!developerAllowed())return {ok:false,reason:"developer-mode-required"};
  if(!library())return {ok:false,reason:"local-audio-library-missing"};
  const ok=await library().removeText(MESSAGE);
  return {ok};
}

async function hasRecording(){return !!(await library()?.hasText?.(MESSAGE))}

window.LibcomlairWelcomeLocalRecorder=Object.freeze({
  version:VERSION,
  messageId:MESSAGE_ID,
  message:MESSAGE,
  status,
  start,
  stop,
  importFile,
  test,
  remove,
  hasRecording
});
})();
