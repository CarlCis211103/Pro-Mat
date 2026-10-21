// ===== CONFIGURACIÓN: cambia el número (con 52 + 10 dígitos) y los productos/precios =====
const WHATSAPP = "528682642807";
const P = [
 // [id, categoría, nombre, descripción, unidad de venta, precio]
 ["h1","Hamburguesas","Hamburguesa de res 4 oz","Carne de res para parrilla o plancha.","caja 40 pzas",480,"🍔"],
 ["h2","Hamburguesas","Hamburguesa de res 6 oz","Más grande, ideal para hamburguesería.","caja 30 pzas",520,"🍔"],
 ["h3","Hamburguesas","Hamburguesa de pollo","Suave y jugosa, lista para cocinar.","caja 40 pzas",450,"🍔"],
 ["h4","Hamburguesas","Hamburguesa mixta res y cerdo","Sabor casero para menú del día.","caja 40 pzas",460,"🍔"],
 ["p1","Pollo","Boneless empanizado","Crujiente, listo para freír u hornear.","bolsa 2 kg",210,"🍗"],
 ["p2","Pollo","Nuggets de pollo","Clásicos, para menú infantil y botanas.","bolsa 2 kg",190,"🍗"],
 ["p3","Pollo","Tiras de pollo empanizadas","Para dedos de pollo y ensaladas.","bolsa 2 kg",205,"🍗"],
 ["b1","Burritos","Burrito de frijol con queso","Tortilla de harina rellena, listo para calentar.","caja 30 pzas",330,"🌯"],
 ["b2","Burritos","Burrito de pisto y frijol","El de siempre, con relleno casero.","caja 30 pzas",360,"🌯"],
 ["b3","Burritos","Burrito de machaca","Para desayunos y almuerzos.","caja 30 pzas",390,"🌯"],
 ["t1","Tortillas","Tortilla de harina 20 cm","Suave, ideal para tacos y burritos.","paquete 10 kg",260,"🫓"],
 ["t2","Tortillas","Tortilla de harina 30 cm","Grande, para burritos y wraps.","paquete 10 kg",310,"🫓"]
].map(a=>({id:a[0],cat:a[1],name:a[2],desc:a[3],unit:a[4],price:a[5],ico:a[6]}));

const $=s=>document.querySelector(s), money=n=>"$"+n.toLocaleString("es-MX");
let cart={}, cat="Todos", tmp={};
try{cart=JSON.parse(localStorage.getItem("promat-cart")||"{}")||{}}catch(e){cart={}}
const save=()=>{try{localStorage.setItem("promat-cart",JSON.stringify(cart))}catch(e){}};
const byId=id=>P.find(p=>p.id===id);

function chips(){
  const cats=["Todos",...new Set(P.map(p=>p.cat))];
  $("#chips").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join("");
}
function grid(){
  $("#grid").innerHTML=P.filter(p=>cat==="Todos"||p.cat===cat).map(p=>{
    const q=tmp[p.id]||1, cls=p.cat==="Hamburguesas"?"hm":p.cat==="Tortillas"?"tt":"";
    return `<article class="card ${cls}"><div class="thumb" aria-hidden="true">${p.ico}</div>
    <div class="body"><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="price">${money(p.price)} <small>/ ${p.unit}</small></div>
    <div class="row"><div class="qty"><button data-m="${p.id}" aria-label="Menos">−</button><span>${q}</span><button data-p="${p.id}" aria-label="Más">+</button></div>
    <button class="add" data-a="${p.id}">Agregar</button>
    <button class="wa" data-w="${p.id}" aria-label="Pedir ${p.name} por WhatsApp" title="Pedir solo este por WhatsApp">WA</button></div></div></article>`}).join("");
}
function render(){
  const ids=Object.keys(cart).filter(id=>cart[id]>0);
  $("#count").textContent=ids.reduce((s,id)=>s+cart[id],0);
  const total=ids.reduce((s,id)=>s+cart[id]*byId(id).price,0);
  $("#total").textContent=money(total);
  $("#send").disabled=!ids.length;
  $("#items").innerHTML=ids.length?ids.map(id=>{const p=byId(id);return `<div class="it"><div><b>${p.name}</b><small>${money(p.price)} / ${p.unit}</small></div>
    <div class="qty"><button data-cm="${id}" aria-label="Menos">−</button><span>${cart[id]}</span><button data-cp="${id}" aria-label="Más">+</button></div></div>`}).join("")
    :`<div class="empty">Tu pedido está vacío.<br>Agrega productos del catálogo.</div>`;
}
function openCart(on){$("#cart").classList.toggle("on",on);$("#scrim").classList.toggle("on",on);$("#cart").setAttribute("aria-hidden",!on)}
function wa(text){window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,"_blank","noopener")}

document.addEventListener("click",e=>{
  const t=e.target.closest("button"); if(!t)return; const d=t.dataset;
  if(d.c){cat=d.c;chips();grid()}
  else if(d.p){tmp[d.p]=(tmp[d.p]||1)+1;grid()}
  else if(d.m){tmp[d.m]=Math.max(1,(tmp[d.m]||1)-1);grid()}
  else if(d.a){cart[d.a]=(cart[d.a]||0)+(tmp[d.a]||1);tmp[d.a]=1;save();render();grid();
    const b=document.querySelector(`[data-a="${d.a}"]`);b.textContent="Agregado ✓";b.classList.add("ok");setTimeout(()=>{b.textContent="Agregar";b.classList.remove("ok")},1100)}
  else if(d.w){const p=byId(d.w);wa(`Hola, me interesa pedir:\n• ${tmp[p.id]||1} x ${p.name} (${p.unit})\n¿Tienen disponibilidad?`)}
  else if(d.cp){cart[d.cp]++;save();render()}
  else if(d.cm){cart[d.cm]--;if(cart[d.cm]<=0)delete cart[d.cm];save();render()}
});
$("#open").onclick=()=>openCart(true);$("#close").onclick=()=>openCart(false);$("#scrim").onclick=()=>openCart(false);
document.addEventListener("keydown",e=>{if(e.key==="Escape")openCart(false)});
$("#send").onclick=()=>{
  const ids=Object.keys(cart).filter(id=>cart[id]>0), biz=$("#biz").value.trim(), notes=$("#notes").value.trim();
  const total=ids.reduce((s,id)=>s+cart[id]*byId(id).price,0);
  const lines=ids.map(id=>{const p=byId(id);return `• ${cart[id]} x ${p.name} (${p.unit}) — ${money(cart[id]*p.price)}`});
  wa(`Hola, quiero hacer un pedido de PRO-MAT${biz?" para "+biz:""}:\n\n${lines.join("\n")}\n\nTotal estimado: ${money(total)}${notes?"\n\nNotas: "+notes:""}\n\nQuedo atento a la confirmación. Gracias.`);
};
chips();grid();render();