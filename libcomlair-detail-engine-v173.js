(function(){
  "use strict";
  const cuisineTranslations={
    french:"Française",american:"Américaine",european:"Européenne",italian:"Italienne",
    asian:"Asiatique",japanese:"Japonaise",chinese:"Chinoise",indian:"Indienne",
    thai:"Thaïlandaise",vietnamese:"Vietnamienne",korean:"Coréenne",
    mediterranean:"Méditerranéenne",mexican:"Mexicaine",turkish:"Turque",
    lebanese:"Libanaise",greek:"Grecque",spanish:"Espagnole",portuguese:"Portugaise",
    moroccan:"Marocaine",african:"Africaine",caribbean:"Caribéenne",
    international:"Internationale",burger:"Burgers",pizza:"Pizza",seafood:"Fruits de mer",
    regional:"Régionale",vegetarian:"Végétarienne",vegan:"Végane"
  };
  function formatCuisine(value){
    const raw=String(value||"").trim();
    if(!raw)return "";
    return raw.split(/[;,|]/).map(x=>x.trim().replace(/[_-]+/g," ")).filter(Boolean).map(x=>{
      const key=x.toLowerCase().trim();
      return cuisineTranslations[key]||x.charAt(0).toUpperCase()+x.slice(1);
    }).join(", ");
  }
  function renderRestaurantPractical(p,detailKey,safeHttpUrl){
    const detail=document.querySelector("#detail");
    if(!detail||detail.dataset.openKey!==detailKey)return;
    const isRestaurant=!!(p&&p.category==="Restaurants");
    const typeRow=document.querySelector("#detailRestaurantTypeRow");
    const typeEl=document.querySelector("#detailRestaurantType");
    const cuisineRow=document.querySelector("#detailCuisineRow");
    const cuisineEl=document.querySelector("#detailCuisine");
    const type=String(p&&p.restaurantType||"").trim();
    const cuisine=formatCuisine(p&&p.restaurantCuisine);
    if(typeEl)typeEl.textContent=type;
    if(typeRow)typeRow.hidden=!isRestaurant||!type;
    if(cuisineEl)cuisineEl.textContent=cuisine;
    if(cuisineRow)cuisineRow.hidden=!isRestaurant||!cuisine;

    const detailPhone=document.querySelector("#detailPhone");
    const phoneRow=detailPhone?detailPhone.closest("p"):null;
    const phoneValue=String(p&&p.phone||"").trim();
    const hasPhone=!!phoneValue&&phoneValue.toLowerCase()!=="non renseigné";
    if(detailPhone)detailPhone.textContent=hasPhone?phoneValue:(isRestaurant?"Non renseigné — à vérifier":"");
    if(phoneRow)phoneRow.hidden=!hasPhone&&!isRestaurant;
    const call=document.querySelector("#detailCall");
    if(call){
      call.hidden=!hasPhone;
      if(hasPhone)call.href="tel:"+phoneValue.replace(/[^+\d]/g,"");
      else call.removeAttribute("href");
    }

    const detailHours=document.querySelector("#detailHours");
    const hoursRow=detailHours?detailHours.closest("p"):null;
    const hours=String(p&&p.hours||"").trim();
    const hasHours=!!hours&&hours.toLowerCase()!=="non renseigné";
    if(detailHours)detailHours.textContent=hasHours?hours:(isRestaurant?"Non renseignés — à vérifier":"");
    if(hoursRow)hoursRow.hidden=!hasHours&&!isRestaurant;

    const site=document.querySelector("#detailWebsite");
    const websiteRow=document.querySelector("#detailWebsiteRow");
    const websiteInfo=document.querySelector("#detailWebsiteInfo");
    if(site&&!(p&&p.idfm)){
      const raw=String(p&&p.website||"").trim();
      const missing=!raw||raw==="#"||raw.toLowerCase()==="non renseigné";
      const url=missing?"":(typeof safeHttpUrl==="function"?safeHttpUrl(raw):"");
      site.hidden=!url;
      if(url){site.href=url;site.textContent="Ouvrir le site internet"}else site.removeAttribute("href");
      if(websiteInfo)websiteInfo.textContent=url?"Disponible":"Non renseigné — à vérifier";
      if(websiteRow)websiteRow.hidden=!isRestaurant;
    }else if(websiteRow){websiteRow.hidden=true}
  }
  async function enrichRestaurant(p,detailKey,opts){
    if(!p||!p.geoapify||p.category!=="Restaurants")return false;
    const options=opts||{};
    const fetcher=options.fetcher||window.fetch;
    if(typeof fetcher!=="function")return false;
    try{
      const qs=p.placeId
        ?"id="+encodeURIComponent(p.placeId)
        :"lat="+encodeURIComponent(p.lat)+"&lon="+encodeURIComponent(p.lon);
      const r=await fetcher("https://libcomlair-backend.onrender.com/api/geoapify/place-details-v168?"+qs);
      if(!r.ok)return false;
      const data=await r.json(),d=data&&data.details?data.details:null;
      if(!d)return false;
      if(d.phone)p.phone=d.phone;
      if(d.website)p.website=d.website;
      if(d.hours)p.hours=d.hours;
      if(d.cuisine)p.restaurantCuisine=d.cuisine;
      renderRestaurantPractical(p,detailKey,options.safeHttpUrl);
      return true;
    }catch(_){return false}
  }
  window.LibcomlairDetails=Object.freeze({formatCuisine,renderRestaurantPractical,enrichRestaurant});
})();