const categories=["Tous","Restaurants","Hôtels","Bars","Loisirs","Services"];
const places=[
 {name:"Exemple – Café accessible",city:"Poitiers",category:"Restaurants",address:"Centre-ville, Poitiers",access:["Entrée sans marche","Toilettes accessibles"],details:["Entrée accessible de plain-pied","Toilettes adaptées","Espace de circulation accessible"]},
 {name:"Exemple – Hôtel accessible",city:"Poitiers",category:"Hôtels",address:"Poitiers",access:["Ascenseur","Chambre accessible"],details:["Ascenseur desservant les étages","Chambre accessible","Accès adapté à l'entrée"]},
 {name:"Exemple – Musée accessible",city:"Poitiers",category:"Loisirs",address:"Poitiers",access:["Entrée accessible","Ascenseur"],details:["Entrée accessible","Ascenseur","Espaces de visite accessibles"]}
];
let active="Tous";
const cats=document.querySelector("#categories"), list=document.querySelector("#places"), search=document.querySelector("#search"), empty=document.querySelector("#empty");
categories.forEach(c=>{const b=document.createElement("button");b.className="category";b.textContent=c;b.setAttribute("aria-pressed",c==="Tous"?"true":"false");b.onclick=()=>{active=c;document.querySelectorAll(".category").forEach(x=>x.setAttribute("aria-pressed",x.textContent===active?"true":"false"));render()};cats.appendChild(b)});
function render(){const q=search.value.trim().toLowerCase();const rows=places.filter(p=>(active==="Tous"||p.category===active)&&(!q||[p.name,p.city,p.category].join(" ").toLowerCase().includes(q)));list.innerHTML="";rows.forEach((p,i)=>{const a=p.access.map(x=>'<span class="tag">✓ '+x+'</span>').join("");list.insertAdjacentHTML("beforeend",'<article class="card"><h3>'+p.name+'</h3><div>'+p.city+' • '+p.category+'</div><div>'+a+'</div><button class="details-btn" type="button" data-index="'+places.indexOf(p)+'">Voir la fiche détaillée</button></article>')});empty.hidden=rows.length>0;document.querySelectorAll(".details-btn").forEach(b=>b.onclick=()=>openDetails(places[Number(b.dataset.index)]))}
function openDetails(p){const items=p.details.map(x=>'<li>✓ '+x+'</li>').join("");document.querySelector("#detailTitle").textContent=p.name;document.querySelector("#detailMeta").textContent=p.address+" • "+p.category;document.querySelector("#detailAccess").innerHTML=items;document.querySelector("#detail").hidden=false;document.querySelector("#detail").scrollIntoView({behavior:"smooth",block:"start"});document.querySelector("#closeDetail").focus()}
document.querySelector("#closeDetail").onclick=()=>{document.querySelector("#detail").hidden=true;document.querySelector("#places").scrollIntoView({behavior:"smooth"})};
search.addEventListener("input",render);render();
const map=L.map("map").setView([46.5802,0.3404],13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
[
 ["Exemple – Café accessible",46.5830,0.3400],
 ["Exemple – Hôtel accessible",46.5780,0.3330],
 ["Exemple – Musée accessible",46.5810,0.3480]
].forEach(p=>L.marker([p[1],p[2]]).addTo(map).bindPopup("<strong>"+p[0]+"</strong><br>Lieu de démonstration"));

let userMarker;
document.querySelector("#nearMe").onclick=()=>{
 const status=document.querySelector("#locationStatus");
 if(!navigator.geolocation){status.textContent="La localisation n’est pas disponible sur cet appareil.";return}
 status.textContent="Recherche de votre position…";
 navigator.geolocation.getCurrentPosition(pos=>{
  const lat=pos.coords.latitude,lon=pos.coords.longitude;
  if(userMarker)map.removeLayer(userMarker);
  userMarker=L.marker([lat,lon]).addTo(map).bindPopup("<strong>Votre position</strong>").openPopup();
  map.setView([lat,lon],14);
  status.textContent="Votre position est affichée sur la carte. Les lieux accessibles à proximité seront ajoutés avec les données Acceslibre.";
 },()=>{
  status.textContent="La localisation n’a pas été autorisée. Vous pouvez continuer à utiliser Libcomlair normalement.";
 },{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
};
