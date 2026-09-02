const SERVICES = [
  {name:"Sofa", icon:"🛋️", desc:"Sofa standard, lepasan & set", prices:[60000,75000,75000,250000,300000,350000]},
  {name:"Kasur", icon:"🛏️", desc:"Springbed mini sampai super king", prices:[150000,180000,270000,290000,310000]},
  {name:"Jok Mobil", icon:"🚗", desc:"Jok saja atau paket interior", prices:[250000,400000,350000]},
  {name:"Karpet", icon:"🧶", desc:"Cuci karpet per m²", prices:[13000]},
  {name:"Kursi", icon:"🪑", desc:"Kursi makan & kursi kantor", prices:[30000,35000,30000,40000]},
  {name:"Gorden", icon:"🪟", desc:"Cuci gorden rumah", prices:[50000]},
  {name:"AC", icon:"❄️", desc:"Cleaning AC rumah", prices:[75000]},
  {name:"Home Cleaning", icon:"🏠", desc:"Cleaning rumah menyeluruh", prices:[150000]}
];

let state = {step:1, service:null, package:null, qty:1, name:"", phone:"", address:"", date:"", time:""};
const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const getOrders = () => JSON.parse(localStorage.getItem("shae_orders") || "[]");
const saveOrders = orders => localStorage.setItem("shae_orders", JSON.stringify(orders));

function serviceIcon(s){return `<div class="service-icon">${s.icon}</div>`}

function renderHome(){
  document.getElementById("serviceGrid").innerHTML = SERVICES.map((s,i)=>`
    <button class="service-item" onclick="startOrder('${s.name}')">${serviceIcon(s)}<strong>${s.name}</strong></button>`).join("");
  document.getElementById("popularList").innerHTML = SERVICES.slice(0,4).map((s,i)=>`
    <article class="popular-card" onclick="startOrder('${s.name}')">
      <div class="popular-img">${s.icon}<span class="badge">${i<2?"POPULER":"FAVORIT"}</span></div>
      <div class="popular-info"><h3>Cuci ${s.name}</h3><p>Booking cepat • Harga transparan</p></div>
    </article>`).join("");
  renderAllServices();
  renderOrders();
  renderInvoice();
}

function renderAllServices(){
  document.getElementById("allServices").innerHTML = SERVICES.map(s=>`
    <div class="service-row">${serviceIcon(s)}<div><h3>Cuci ${s.name}</h3><p>${s.desc}</p></div><button class="primary-btn" onclick="startOrder('${s.name}')">Pesan</button></div>
  `).join("");
}

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const page=document.getElementById(id); if(page) page.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===id));
  window.scrollTo({top:0,behavior:"smooth"});
  if(id==="pesanan") renderOrders();
  if(id==="invoice") renderInvoice();
}

function filterServices(q){
  const value=q.toLowerCase().trim();
  const filtered=SERVICES.filter(s=>s.name.toLowerCase().includes(value));
  document.getElementById("serviceGrid").innerHTML=(filtered.length?filtered:[]).map(s=>`
    <button class="service-item" onclick="startOrder('${s.name}')">${serviceIcon(s)}<strong>${s.name}</strong></button>`).join("") ||
    `<div style="grid-column:1/-1;text-align:center;padding:25px;color:#7b8794">Layanan tidak ditemukan</div>`;
}

function startOrder(name){
  state={...state,step:1,service:SERVICES.find(s=>s.name===name)||SERVICES[0],package:null,qty:1};
  document.getElementById("orderModal").classList.remove("hidden");
  renderStep();
}

function closeOrder(){document.getElementById("orderModal").classList.add("hidden")}

function renderStep(){
  const s=state.service;
  document.getElementById("progressBar").style.width=(state.step*25)+"%";
  document.getElementById("backBtn").style.visibility=state.step===1?"hidden":"visible";
  document.getElementById("nextBtn").textContent=state.step===4?"Buat Pesanan":"Lanjut";
  document.querySelectorAll(".order-step").forEach((x,i)=>x.classList.toggle("hidden",i!==state.step-1));

  document.getElementById("step1").innerHTML=`
    <h3>1. Pilih jenis layanan</h3>
    <p style="color:#7b8794;margin-top:-8px">Anda memilih <b>${s.name}</b></p>
    <div class="choice-grid">${s.prices.map((p,i)=>`
      <button class="choice ${state.package===i?"selected":""}" onclick="selectPackage(${i})">
        <strong>${packageName(s.name,i)}</strong><small>${rupiah(p)}</small>
      </button>`).join("")}</div>`;

  document.getElementById("step2").innerHTML=`
    <h3>2. Jumlah & jadwal</h3>
    <div class="form-group"><label>Jumlah</label><input id="qty" type="number" min="1" value="${state.qty}" onchange="state.qty=Math.max(1,+this.value||1)"></div>
    <div class="form-group"><label>Tanggal cleaning</label><input id="date" type="date" value="${state.date}" min="${new Date().toISOString().slice(0,10)}" onchange="state.date=this.value"></div>
    <div class="form-group"><label>Jam</label><select id="time" onchange="state.time=this.value">${["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"].map(t=>`<option ${state.time===t?"selected":""}>${t}</option>`).join("")}</select></div>`;

  document.getElementById("step3").innerHTML=`
    <h3>3. Data pelanggan</h3>
    <div class="form-group"><label>Nama</label><input id="custName" placeholder="Nama lengkap" value="${state.name}"></div>
    <div class="form-group"><label>WhatsApp</label><input id="custPhone" type="tel" placeholder="08xxxxxxxxxx" value="${state.phone}"></div>
    <div class="form-group"><label>Alamat cleaning</label><textarea id="custAddress" placeholder="Alamat lengkap">${state.address}</textarea></div>`;

  const total=(s.prices[state.package]||0)*state.qty;
  document.getElementById("step4").innerHTML=`
    <h3>4. Cek pesanan</h3>
    <div class="summary">
      <div class="summary-row"><span>Layanan</span><b>${s.name}</b></div>
      <div class="summary-row"><span>Paket</span><b>${packageName(s.name,state.package)}</b></div>
      <div class="summary-row"><span>Jumlah</span><b>${state.qty}</b></div>
      <div class="summary-row"><span>Jadwal</span><b>${formatDate(state.date)} ${state.time||""}</b></div>
      <div class="summary-row"><span>Pelanggan</span><b>${state.name}</b></div>
      <div class="summary-row"><span>Alamat</span><b style="max-width:60%;text-align:right">${state.address}</b></div>
      <div class="summary-row total"><span>Total</span><b>${rupiah(total)}</b></div>
    </div>`;
}

function packageName(service,i){
  const names={
    "Sofa":["1 Seater Standard","1 Seater Lepasan","1 Seater Besar","L Standard / Set","L BIG / Set","U / Set"],
    "Kasur":["Mini Single","Single","Queen","King","Super King"],
    "Jok Mobil":["Jok Saja 2 Baris","Interior 2 Baris","Jok Saja 3 Baris"],
    "Karpet":["Per m²"],"Kursi":["Makan Small","Makan Standard","Kantor Small","Kantor BIG"],
    "Gorden":["Cuci Gorden"],"AC":["Cleaning AC"],"Home Cleaning":["Home Cleaning"]
  };
  return (names[service]||[])[i]||`Paket ${i+1}`;
}
function selectPackage(i){state.package=i;renderStep()}
function nextStep(){
  if(state.step===1 && state.package===null) return showToast("Pilih paket layanan terlebih dahulu");
  if(state.step===2){
    state.qty=Math.max(1,+(document.getElementById("qty").value||1));
    state.date=document.getElementById("date").value;
    state.time=document.getElementById("time").value;
    if(!state.date) return showToast("Pilih tanggal cleaning");
  }
  if(state.step===3){
    state.name=document.getElementById("custName").value.trim();
    state.phone=document.getElementById("custPhone").value.trim();
    state.address=document.getElementById("custAddress").value.trim();
    if(!state.name||!state.phone||!state.address) return showToast("Lengkapi data pelanggan");
  }
  if(state.step<4){state.step++;renderStep();return}
  createOrder();
}
function prevStep(){if(state.step>1){state.step--;renderStep()}}
function formatDate(v){if(!v)return"-";return new Date(v+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}

async function createOrder(){
  const total=state.service.prices[state.package]*state.qty;
  const inv="INV-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+String(getOrders().length+1).padStart(3,"0");
  const order={
    invoice:inv,
    layanan:state.service.name,
    icon:state.service.icon,
    paket:packageName(state.service.name,state.package),
    qty:state.qty,
    harga:state.service.prices[state.package],
    total,
    tanggal:state.date,
    jam:state.time,
    nama:state.name,
    hp:state.phone,
    alamat:state.address,
    status:"Menunggu"
  };

  const nextBtn=document.getElementById("nextBtn");
  nextBtn.disabled=true;
  nextBtn.textContent="Menyimpan...";

  try{
    // Firebase menjadi database utama.
    // localStorage tetap dipakai sebagai cache agar halaman Pesanan/Invoice tetap ringan.
    const firebaseId = await window.simpanOrder(order);
    order.id=firebaseId;
    const orders=getOrders();
    orders.unshift(order);
    saveOrders(orders);
    localStorage.setItem("shae_profile",JSON.stringify({name:state.name,phone:state.phone}));
    closeOrder();
    renderOrders();
    renderInvoice();
    showPage("pesanan");
    showToast("Pesanan tersimpan & terkirim ke Shae Cleaners");
  }catch(error){
    console.error(error);
    showToast("Gagal menyimpan ke Firebase. Periksa konfigurasi Firebase.");
  }finally{
    nextBtn.disabled=false;
    nextBtn.textContent="Buat Pesanan";
  }
}
function renderOrders(){
  const el=document.getElementById("ordersList"), orders=getOrders();
  if(!orders.length){el.innerHTML=`<div class="empty-card"><div>🛍️</div><h3>Belum ada pesanan</h3><p>Pesan layanan cleaning untuk melihat booking di sini.</p><button class="primary-btn" onclick="showPage('layanan')">Pilih Layanan</button></div>`;return}
  el.innerHTML=orders.map((o,i)=>`
    <div class="invoice-card" style="margin-bottom:14px">
      <div class="invoice-top"><div><h3>${o.icon} ${o.service}</h3><small>${o.invoice}</small></div><span class="status">${o.status}</span></div>
      <div class="invoice-line"><span>${o.package} × ${o.qty}</span><b>${rupiah(o.total)}</b></div>
      <div class="invoice-line"><span>Jadwal</span><b>${formatDate(o.date)} ${o.time}</b></div>
      <div class="invoice-actions"><button class="secondary-btn" onclick="openWhatsApp(${i})"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button><button class="primary-btn" onclick="viewInvoice(${i})">Invoice</button></div>
    </div>`).join("");
}
function renderInvoice(){
  const el=document.getElementById("invoiceContent"), o=getOrders()[0];
  if(!o){el.innerHTML=`<div class="empty-card"><div>🧾</div><h3>Belum ada invoice</h3><p>Invoice otomatis muncul setelah Anda membuat pesanan.</p></div>`;return}
  el.innerHTML=`<div class="invoice-card">
    <div class="invoice-top"><div><h3>Shae Cleaners</h3><small>Cleaning Marketplace</small></div><span class="invoice-code">${o.invoice}</span></div>
    <div class="invoice-line"><span>Layanan</span><b>${o.service}</b></div>
    <div class="invoice-line"><span>Paket</span><b>${o.package}</b></div>
    <div class="invoice-line"><span>Jumlah</span><b>${o.qty}</b></div>
    <div class="invoice-line"><span>Jadwal</span><b>${formatDate(o.date)} ${o.time}</b></div>
    <div class="invoice-line"><span>Pelanggan</span><b>${o.name}</b></div>
    <div class="invoice-line"><span>Alamat</span><b>${o.address}</b></div>
    <div class="invoice-total"><span>Total</span><b>${rupiah(o.total)}</b></div>
    <div class="invoice-actions"><button class="primary-btn" onclick="openWhatsApp(0)"><i class="fa-brands fa-whatsapp"></i> Kirim WhatsApp</button></div>
  </div>`;
}
function viewInvoice(i){localStorage.setItem("shae_invoice_index",i);showPage("invoice");renderInvoice()}
function openWhatsApp(i){
  const o=getOrders()[i];if(!o)return;
  const msg=`Halo Shae Cleaners, saya ingin konfirmasi booking.%0A%0AInvoice: ${o.invoice}%0ALayanan: ${o.service}%0APaket: ${o.package}%0AJumlah: ${o.qty}%0AJadwal: ${formatDate(o.date)} ${o.time}%0ANama: ${o.name}%0AAlamat: ${o.address}%0ATotal: ${rupiah(o.total)}`;
  const phone="6281234567890"; // GANTI dengan nomor WhatsApp Shae Cleaners
  window.open(`https://wa.me/${phone}?text=${msg}`,"_blank");
}
function editProfile(){
  const p=JSON.parse(localStorage.getItem("shae_profile")||"{}");
  const name=prompt("Nama pelanggan:",p.name||""); if(name===null)return;
  const phone=prompt("Nomor WhatsApp:",p.phone||""); if(phone===null)return;
  localStorage.setItem("shae_profile",JSON.stringify({name,phone}));
  loadProfile();showToast("Profil diperbarui");
}
function loadProfile(){
  const p=JSON.parse(localStorage.getItem("shae_profile")||"{}");
  document.getElementById("profileName").textContent=p.name||"Pelanggan";
  document.getElementById("profilePhone").textContent=p.phone||"Belum login";
}
function showToast(text){const t=document.getElementById("toast");t.textContent=text;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}

renderHome();loadProfile();
