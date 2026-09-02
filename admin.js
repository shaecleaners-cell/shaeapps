import { pantauOrders, ubahStatusOrder } from "./firebase.js";

let allOrders = [];

const rupiah = n => new Intl.NumberFormat("id-ID", {
  style:"currency", currency:"IDR", maximumFractionDigits:0
}).format(Number(n)||0);

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

function formatDate(value){
  if(!value) return "-";
  if(value?.toDate) value=value.toDate();
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d) ? "-" : d.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});
}

function render(){
  const filter=document.getElementById("filterStatus").value;
  const orders=filter ? allOrders.filter(o=>o.status===filter) : allOrders;

  document.getElementById("totalOrders").textContent=allOrders.length;
  document.getElementById("waitingOrders").textContent=allOrders.filter(o=>o.status==="Menunggu").length;
  document.getElementById("confirmedOrders").textContent=allOrders.filter(o=>o.status==="Dikonfirmasi").length;
  document.getElementById("doneOrders").textContent=allOrders.filter(o=>o.status==="Selesai").length;

  document.getElementById("orders").innerHTML=orders.length ? orders.map(o=>`
    <article class="order">
      <div class="order-top">
        <div>
          <h3>${esc(o.icon||"🧹")} ${esc(o.layanan||o.service||"Cleaning")}</h3>
          <div class="invoice">${esc(o.invoice||"-")}</div>
        </div>
        <span class="status">${esc(o.status||"Menunggu")}</span>
      </div>

      <div class="info">
        <div>Customer<strong>${esc(o.nama||o.name||"-")}</strong></div>
        <div>WhatsApp<strong>${esc(o.hp||o.phone||"-")}</strong></div>
        <div>Paket<strong>${esc(o.paket||o.package||"-")} × ${esc(o.qty||1)}</strong></div>
        <div>Jadwal<strong>${formatDate(o.tanggal||o.date)} ${esc(o.jam||o.time||"")}</strong></div>
        <div>Total<strong>${rupiah(o.total)}</strong></div>
      </div>

      <div class="address"><b>Alamat:</b><br>${esc(o.alamat||o.address||"-")}</div>

      <div class="actions">
        <select onchange="changeStatus('${o.id}',this.value)">
          ${["Menunggu","Dikonfirmasi","Diproses","Selesai"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
        </select>
        <a class="wa" href="${waLink(o)}" target="_blank"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>
    </article>
  `).join("") : `<div class="loading">Belum ada pesanan.</div>`;
}

function waLink(o){
  let phone=String(o.hp||o.phone||"").replace(/\D/g,"");
  if(phone.startsWith("0")) phone="62"+phone.slice(1);
  const text=`Halo ${o.nama||o.name||""}, kami dari Shae Cleaners. Pesanan ${o.invoice||""} sedang ${o.status||"Menunggu"}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

window.changeStatus=async function(id,status){
  try{ await ubahStatusOrder(id,status); }
  catch(err){ alert("Gagal mengubah status: "+err.message); }
};

document.getElementById("filterStatus").addEventListener("change",render);
pantauOrders(data=>{allOrders=data;render();});
