const categories=["Tous","Restaurants","Hôtels","Bars","Loisirs","Services"];
const places=[
 {name:"Exemple – Café accessible",city:"Poitiers",category:"Restaurants",access:["Entrée sans marche","Toilettes accessibles"]},
 {name:"Exemple – Hôtel accessible",city:"Poitiers",category:"Hôtels",access:["Ascenseur","Chambre accessible"]},
 {name:"Exemple – Musée accessible",city:"Poitiers",category:"Loisirs",access:["Entrée accessible","Ascenseur"]}
];
let active="Tous";
const cats=document.querySelector("#categories"), list=document.querySelector("#places"), search=document.querySelector("#search"), empty=document.querySelector("#empty");
categories.forEach(c=>{const b=document.createElement("button");b.className="category";b.textContent=c;b.onclick=()=>{active=c;render()};cats.appendChild(b)});
function render(){const q=search.value.trim().toLowerCase();const rows=places.filter(p=>(active==="Tous"||p.category===active)&&(!q||[p.name,p.city,p.category].join(" ").toLowerCase().includes(q)));list.innerHTML="";rows.forEach(p=>{const a=p.access.map(x=>'<span class="tag">✓ '+x+'</span>').join("");list.insertAdjacentHTML("beforeend",'<article class="card"><h3>'+p.name+'</h3><div>'+p.city+' • '+p.category+'</div><div>'+a+'</div></article>')});empty.hidden=rows.length>0}
search.addEventListener("input",render);render();