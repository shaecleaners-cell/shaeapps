/* =====================================================
   SHAE CLEANERS - APP.JS
   ===================================================== */

/* =========================
   DATA LAYANAN
========================= */

const SERVICES = [
  {
    name: "Sofa",
    icon: "assets/icons/sofa.png",
    desc: "Sofa standard, lepasan & set",
    prices: [60000, 75000, 75000, 250000, 300000, 350000]
  },
  {
    name: "Kasur",
    icon: "assets/icons/kasur.png",
    desc: "Springbed mini sampai super king",
    prices: [150000, 180000, 270000, 290000, 310000]
  },
  {
    name: "Jok Mobil",
    icon: "assets/icons/jokmobil.png",
    desc: "Jok saja atau paket interior",
    prices: [250000, 400000, 350000]
  },
  {
    name: "Karpet",
    icon: "assets/icons/karpet.png",
    desc: "Cuci karpet per m²",
    prices: [13000]
  },
  {
    name: "Kursi",
    icon: "assets/icons/kursi.png",
    desc: "Kursi makan & kursi kantor",
    prices: [30000, 35000, 30000, 40000]
  },
  {
    name: "Gorden",
    icon: "assets/icons/gorden.png",
    desc: "Cuci gorden rumah",
    prices: [50000]
  },
  {
    name: "AC",
    icon: "assets/icons/ac.png",
    desc: "Cleaning AC rumah",
    prices: [75000]
  },
  {
    name: "Home Cleaning",
    icon: "assets/icons/homecleaning.png",
    desc: "Cleaning rumah menyeluruh",
    prices: [150000]
  }
];


/* =========================
   STATE
========================= */

let state = {
  step: 1,
  service: null,
  package: null,
  qty: 1,
  name: "",
  phone: "",
  address: "",
  date: "",
  time: ""
};


/* =========================
   HELPER
========================= */

const rupiah = n =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(n || 0);


const getOrders = () =>
  JSON.parse(
    localStorage.getItem("shae_orders") || "[]"
  );


const saveOrders = orders =>
  localStorage.setItem(
    "shae_orders",
    JSON.stringify(orders)
  );


/* =========================
   ICON LAYANAN
========================= */

function serviceIcon(service) {
  return `
    <div class="service-icon">
      <img
        src="${service.icon}"
        alt="${service.name}"
        loading="lazy"
      >
    </div>
  `;
}


/* =========================
   HOME
========================= */

function renderHome() {

  const serviceGrid =
    document.getElementById("serviceGrid");

  if (serviceGrid) {

    serviceGrid.innerHTML = SERVICES.map(service => `
      <button
        class="service-item"
        onclick="startOrder('${service.name}')"
      >
        ${serviceIcon(service)}
        <strong>${service.name}</strong>
      </button>
    `).join("");

  }


  /* POPULAR */

  const popularList =
    document.getElementById("popularList");

  if (popularList) {

    popularList.innerHTML =
      SERVICES.slice(0, 4).map((service, i) => `
        <article
          class="popular-card"
          onclick="startOrder('${service.name}')"
        >

          <div class="popular-img">

            <img
              src="${service.icon}"
              alt="${service.name}"
              loading="lazy"
            >

            <span class="badge">
              ${i < 2 ? "POPULER" : "FAVORIT"}
            </span>

          </div>

          <div class="popular-info">

            <h3>
              Cuci ${service.name}
            </h3>

            <p>
              Booking cepat • Harga transparan
            </p>

          </div>

        </article>
      `).join("");

  }


  renderAllServices();
  renderOrders();
  renderInvoice();

}


/* =========================
   SEMUA LAYANAN
========================= */

function renderAllServices() {

  const el =
    document.getElementById("allServices");

  if (!el) return;


  el.innerHTML = SERVICES.map(service => `

    <div class="service-row">

      ${serviceIcon(service)}

      <div>

        <h3>
          Cuci ${service.name}
        </h3>

        <p>
          ${service.desc}
        </p>

      </div>

      <button
        class="primary-btn"
        onclick="startOrder('${service.name}')"
      >
        Pesan
      </button>

    </div>

  `).join("");

}


/* =========================
   NAVIGASI HALAMAN
========================= */

function showPage(id) {

  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });


  const page =
    document.getElementById(id);

  if (page) {
    page.classList.add("active");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(nav => {

      nav.classList.toggle(
        "active",
        nav.dataset.page === id
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (id === "pesanan") {
    renderOrders();
  }


  if (id === "invoice") {
    renderInvoice();
  }

}


/* =========================
   SEARCH LAYANAN
========================= */

function filterServices(q) {

  const value =
    q.toLowerCase().trim();


  const filtered =
    SERVICES.filter(service =>
      service.name
        .toLowerCase()
        .includes(value)
    );


  const el =
    document.getElementById("serviceGrid");

  if (!el) return;


  if (!filtered.length) {

    el.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:25px;
          color:#7b8794
        "
      >
        Layanan tidak ditemukan
      </div>
    `;

    return;
  }


  el.innerHTML =
    filtered.map(service => `

      <button
        class="service-item"
        onclick="startOrder('${service.name}')"
      >

        ${serviceIcon(service)}

        <strong>
          ${service.name}
        </strong>

      </button>

    `).join("");

}


/* =========================
   MULAI ORDER
========================= */

function startOrder(name) {

  state = {
    ...state,
    step: 1,
    service:
      SERVICES.find(
        service => service.name === name
      ) || SERVICES[0],
    package: null,
    qty: 1
  };


  const modal =
    document.getElementById("orderModal");

  if (modal) {
    modal.classList.remove("hidden");
  }


  renderStep();

}


/* =========================
   TUTUP MODAL
========================= */

function closeOrder() {

  const modal =
    document.getElementById("orderModal");

  if (modal) {
    modal.classList.add("hidden");
  }

}


/* =========================
   RENDER STEP
========================= */

function renderStep() {

  const s = state.service;

  if (!s) return;


  const progress =
    document.getElementById("progressBar");

  if (progress) {
    progress.style.width =
      (state.step * 25) + "%";
  }


  const backBtn =
    document.getElementById("backBtn");

  if (backBtn) {
    backBtn.style.visibility =
      state.step === 1
        ? "hidden"
        : "visible";
  }


  const nextBtn =
    document.getElementById("nextBtn");

  if (nextBtn) {

    nextBtn.textContent =
      state.step === 4
        ? "Buat Pesanan"
        : "Lanjut";

  }


  document
    .querySelectorAll(".order-step")
    .forEach((step, i) => {

      step.classList.toggle(
        "hidden",
        i !== state.step - 1
      );

    });


  /* STEP 1 */

  const step1 =
    document.getElementById("step1");

  if (step1) {

    step1.innerHTML = `

      <h3>
        1. Pilih jenis layanan
      </h3>

      <p
        style="
          color:#7b8794;
          margin-top:-8px
        "
      >
        Anda memilih
        <b>${s.name}</b>
      </p>

      <div class="choice-grid">

        ${s.prices.map((price, i) => `

          <button
            class="
              choice
              ${state.package === i
                ? "selected"
                : ""}
            "
            onclick="selectPackage(${i})"
          >

            <strong>
              ${packageName(s.name, i)}
            </strong>

            <small>
              ${rupiah(price)}
            </small>

          </button>

        `).join("")}

      </div>

    `;

  }


  /* STEP 2 */

  const step2 =
    document.getElementById("step2");

  if (step2) {

    step2.innerHTML = `

      <h3>
        2. Jumlah & jadwal
      </h3>

      <div class="form-group">

        <label>
          Jumlah
        </label>

        <input
          id="qty"
          type="number"
          min="1"
          value="${state.qty}"
          onchange="
            state.qty=Math.max(
              1,
              +this.value || 1
            )
          "
        >

      </div>


      <div class="form-group">

        <label>
          Tanggal cleaning
        </label>

        <input
          id="date"
          type="date"
          value="${state.date}"
          min="${new Date()
            .toISOString()
            .slice(0,10)}"
          onchange="
            state.date=this.value
          "
        >

      </div>


      <div class="form-group">

        <label>
          Jam
        </label>

        <select
          id="time"
          onchange="
            state.time=this.value
          "
        >

          ${[
            "08:00",
            "09:00",
            "10:00",
            "11:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00"
          ].map(time => `

            <option
              ${state.time === time
                ? "selected"
                : ""}
            >
              ${time}
            </option>

          `).join("")}

        </select>

      </div>

    `;

  }


  /* STEP 3 */

  const step3 =
    document.getElementById("step3");

  if (step3) {

    step3.innerHTML = `

      <h3>
        3. Data pelanggan
      </h3>


      <div class="form-group">

        <label>
          Nama
        </label>

        <input
          id="custName"
          placeholder="Nama lengkap"
          value="${state.name}"
        >

      </div>


      <div class="form-group">

        <label>
          WhatsApp
        </label>

        <input
          id="custPhone"
          type="tel"
          placeholder="08xxxxxxxxxx"
          value="${state.phone}"
        >

      </div>


      <div class="form-group">

        <label>
          Alamat cleaning
        </label>

        <textarea
          id="custAddress"
          placeholder="Alamat lengkap"
        >${state.address}</textarea>

      </div>

    `;

  }


  /* STEP 4 */

  const total =
    (s.prices[state.package] || 0)
    * state.qty;


  const step4 =
    document.getElementById("step4");

  if (step4) {

    step4.innerHTML = `

      <h3>
        4. Cek pesanan
      </h3>

      <div class="summary">

        <div class="summary-row">
          <span>Layanan</span>
          <b>${s.name}</b>
        </div>

        <div class="summary-row">
          <span>Paket</span>
          <b>
            ${packageName(
              s.name,
              state.package
            )}
          </b>
        </div>

        <div class="summary-row">
          <span>Jumlah</span>
          <b>${state.qty}</b>
        </div>

        <div class="summary-row">
          <span>Jadwal</span>
          <b>
            ${formatDate(state.date)}
            ${state.time || ""}
          </b>
        </div>

        <div class="summary-row">
          <span>Pelanggan</span>
          <b>${state.name}</b>
        </div>

        <div class="summary-row">

          <span>
            Alamat
          </span>

          <b
            style="
              max-width:60%;
              text-align:right
            "
          >
            ${state.address}
          </b>

        </div>

        <div class="summary-row total">

          <span>
            Total
          </span>

          <b>
            ${rupiah(total)}
          </b>

        </div>

      </div>

    `;

  }

}


/* =========================
   NAMA PAKET
========================= */

function packageName(service, i) {

  const names = {

    "Sofa": [
      "1 Seater Standard",
      "1 Seater Lepasan",
      "1 Seater Besar",
      "L Standard / Set",
      "L BIG / Set",
      "U / Set"
    ],

    "Kasur": [
      "Mini Single",
      "Single",
      "Queen",
      "King",
      "Super King"
    ],

    "Jok Mobil": [
      "Jok Saja 2 Baris",
      "Interior 2 Baris",
      "Jok Saja 3 Baris"
    ],

    "Karpet": [
      "Per m²"
    ],

    "Kursi": [
      "Makan Small",
      "Makan Standard",
      "Kantor Small",
      "Kantor BIG"
    ],

    "Gorden": [
      "Cuci Gorden"
    ],

    "AC": [
      "Cleaning AC"
    ],

    "Home Cleaning": [
      "Home Cleaning"
    ]

  };


  return (
    (names[service] || [])[i]
    || `Paket ${i + 1}`
  );

}


/* =========================
   PILIH PAKET
========================= */

function selectPackage(i) {

  state.package = i;

  renderStep();

}


/* =========================
   NEXT STEP
========================= */

function nextStep() {

  if (
    state.step === 1 &&
    state.package === null
  ) {

    return showToast(
      "Pilih paket layanan terlebih dahulu"
    );

  }


  if (state.step === 2) {

    state.qty =
      Math.max(
        1,
        +document.getElementById("qty").value || 1
      );

    state.date =
      document.getElementById("date").value;

    state.time =
      document.getElementById("time").value;


    if (!state.date) {

      return showToast(
        "Pilih tanggal cleaning"
      );

    }

  }


  if (state.step === 3) {

    state.name =
      document
        .getElementById("custName")
        .value
        .trim();

    state.phone =
      document
        .getElementById("custPhone")
        .value
        .trim();

    state.address =
      document
        .getElementById("custAddress")
        .value
        .trim();


    if (
      !state.name ||
      !state.phone ||
      !state.address
    ) {

      return showToast(
        "Lengkapi data pelanggan"
      );

    }

  }


  if (state.step < 4) {

    state.step++;

    renderStep();

    return;

  }


  createOrder();

}


/* =========================
   PREVIOUS STEP
========================= */

function prevStep() {

  if (state.step > 1) {

    state.step--;

    renderStep();

  }

}


/* =========================
   FORMAT TANGGAL
========================= */

function formatDate(v) {

  if (!v) return "-";

  return new Date(
    v + "T00:00:00"
  ).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


/* =========================
   CREATE ORDER
========================= */

function createOrder() {

  const total =
    state.service.prices[state.package]
    * state.qty;


  const inv =
    "INV-" +
    new Date()
      .toISOString()
      .slice(0,10)
      .replaceAll("-", "") +
    "-" +
    String(
      getOrders().length + 1
    ).padStart(3, "0");


  const order = {

    invoice: inv,

    service:
      state.service.name,

    icon:
      state.service.icon,

    package:
      packageName(
        state.service.name,
        state.package
      ),

    qty:
      state.qty,

    total,

    date:
      state.date,

    time:
      state.time,

    name:
      state.name,

    phone:
      state.phone,

    address:
      state.address,

    status:
      "Menunggu Konfirmasi",

    createdAt:
      new Date().toISOString()

  };


  const orders =
    getOrders();


  orders.unshift(order);

  saveOrders(orders);


  localStorage.setItem(
    "shae_profile",
    JSON.stringify({
      name: state.name,
      phone: state.phone
    })
  );


  closeOrder();

  renderOrders();

  renderInvoice();

  showPage("pesanan");

  showToast(
    "Pesanan berhasil dibuat"
  );

}


/* =========================
   RENDER PESANAN
========================= */

function renderOrders() {

  const el =
    document.getElementById("ordersList");

  if (!el) return;


  const orders =
    getOrders();


  if (!orders.length) {

    el.innerHTML = `

      <div class="empty-card">

        <div>🛍️</div>

        <h3>
          Belum ada pesanan
        </h3>

        <p>
          Pesan layanan cleaning
          untuk melihat booking di sini.
        </p>

        <button
          class="primary-btn"
          onclick="showPage('layanan')"
        >
          Pilih Layanan
        </button>

      </div>

    `;

    return;

  }


  el.innerHTML =
    orders.map((o, i) => `

      <div
        class="invoice-card"
        style="margin-bottom:14px"
      >

        <div class="invoice-top">

          <div>

            <h3>

              <img
                src="${o.icon}"
                alt=""
                style="
                  width:28px;
                  height:28px;
                  object-fit:contain;
                  vertical-align:middle
                "
              >

              ${o.service}

            </h3>

            <small>
              ${o.invoice}
            </small>

          </div>

          <span class="status">
            ${o.status}
          </span>

        </div>


        <div class="invoice-line">

          <span>
            ${o.package} × ${o.qty}
          </span>

          <b>
            ${rupiah(o.total)}
          </b>

        </div>


        <div class="invoice-line">

          <span>
            Jadwal
          </span>

          <b>
            ${formatDate(o.date)}
            ${o.time}
          </b>

        </div>


        <div class="invoice-actions">

          <button
            class="secondary-btn"
            onclick="openWhatsApp(${i})"
          >
            <i class="fa-brands fa-whatsapp"></i>
            WhatsApp
          </button>


          <button
            class="primary-btn"
            onclick="viewInvoice(${i})"
          >
            Invoice
          </button>

        </div>

      </div>

    `).join("");

}


/* =========================
   INVOICE
========================= */

function renderInvoice() {

  const el =
    document.getElementById("invoiceContent");

  if (!el) return;


  const orders =
    getOrders();


  const index =
    Number(
      localStorage.getItem(
        "shae_invoice_index"
      ) || 0
    );


  const o =
    orders[index] || orders[0];


  if (!o) {

    el.innerHTML = `

      <div class="empty-card">

        <div>🧾</div>

        <h3>
          Belum ada invoice
        </h3>

        <p>
          Invoice otomatis muncul
          setelah Anda membuat pesanan.
        </p>

      </div>

    `;

    return;

  }


  el.innerHTML = `

    <div class="invoice-card">

      <div class="invoice-top">

        <div>

          <h3>
            Shae Cleaners
          </h3>

          <small>
            Cleaning Marketplace
          </small>

        </div>

        <span class="invoice-code">
          ${o.invoice}
        </span>

      </div>


      <div class="invoice-line">

        <span>
          Layanan
        </span>

        <b>
          ${o.service}
        </b>

      </div>


      <div class="invoice-line">

        <span>
          Paket
        </span>

        <b>
          ${o.package}
        </b>

      </div>


      <div class="invoice-line">

        <span>
          Jumlah
        </span>

        <b>
          ${o.qty}
        </b>

      </div>


      <div class="invoice-line">

        <span>
          Jadwal
        </span>

        <b>
          ${formatDate(o.date)}
          ${o.time}
        </b>

      </div>


      <div class="invoice-line">

        <span>
          Pelanggan
        </span>

        <b>
          ${o.name}
        </b>

      </div>


      <div class="invoice-line">

        <span>
          Alamat
        </span>

        <b>
          ${o.address}
        </b>

      </div>


      <div class="invoice-total">

        <span>
          Total
        </span>

        <b>
          ${rupiah(o.total)}
        </b>

      </div>


      <div class="invoice-actions">

        <button
          class="primary-btn"
          onclick="openWhatsApp(${orders.indexOf(o)})"
        >

          <i class="fa-brands fa-whatsapp"></i>

          Kirim WhatsApp

        </button>

      </div>

    </div>

  `;

}


/* =========================
   VIEW INVOICE
========================= */

function viewInvoice(i) {

  localStorage.setItem(
    "shae_invoice_index",
    i
  );


  showPage("invoice");

  renderInvoice();

}


/* =========================
   WHATSAPP
========================= */

function openWhatsApp(i) {

  const o =
    getOrders()[i];


  if (!o) return;


  const phone =
    "6283813138221";
  // GANTI dengan nomor WhatsApp Shae Cleaners


  const message = `
Halo Shae Cleaners, saya ingin konfirmasi booking.

Invoice: ${o.invoice}
Layanan: ${o.service}
Paket: ${o.package}
Jumlah: ${o.qty}
Jadwal: ${formatDate(o.date)} ${o.time}
Nama: ${o.name}
WhatsApp: ${o.phone}
Alamat: ${o.address}
Total: ${rupiah(o.total)}
  `.trim();


  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );

}


/* =========================
   PROFILE
========================= */

function editProfile() {

  const p =
    JSON.parse(
      localStorage.getItem(
        "shae_profile"
      ) || "{}"
    );


  const name =
    prompt(
      "Nama pelanggan:",
      p.name || ""
    );


  if (name === null) return;


  const phone =
    prompt(
      "Nomor WhatsApp:",
      p.phone || ""
    );


  if (phone === null) return;


  localStorage.setItem(
    "shae_profile",
    JSON.stringify({
      name,
      phone
    })
  );


  loadProfile();

  showToast(
    "Profil diperbarui"
  );

}


/* =========================
   LOAD PROFILE
========================= */

function loadProfile() {

  const p =
    JSON.parse(
      localStorage.getItem(
        "shae_profile"
      ) || "{}"
    );


  const name =
    document.getElementById(
      "profileName"
    );


  const phone =
    document.getElementById(
      "profilePhone"
    );


  if (name) {
    name.textContent =
      p.name || "Pelanggan";
  }


  if (phone) {
    phone.textContent =
      p.phone || "Belum login";
  }

}


/* =========================
   TOAST
========================= */

function showToast(text) {

  const t =
    document.getElementById("toast");


  if (!t) return;


  t.textContent = text;

  t.classList.add("show");


  clearTimeout(
    window.__toast
  );


  window.__toast =
    setTimeout(() => {

      t.classList.remove("show");

    }, 2200);

}


/* =====================================================
   HERO SLIDER
   ===================================================== */

let currentSlide = 0;
let sliderTimer = null;


function goSlide(index) {

  const track =
    document.querySelector(
      ".hero-track"
    );


  const dots =
    document.querySelectorAll(
      ".slider-dots span"
    );


  if (!track) return;


  const total =
    document.querySelectorAll(
      ".hero-slide"
    ).length;


  if (!total) return;


  currentSlide =
    (index + total) % total;


  track.style.transform =
    `translateX(-${currentSlide * 100}%)`;


  dots.forEach((dot, i) => {

    dot.classList.toggle(
      "active",
      i === currentSlide
    );

  });

}


function nextSlide() {

  goSlide(
    currentSlide + 1
  );

}


function prevSlide() {

  goSlide(
    currentSlide - 1
  );

}


function startSlider() {

  clearInterval(
    sliderTimer
  );


  const slides =
    document.querySelectorAll(
      ".hero-slide"
    );


  if (slides.length <= 1) return;


  sliderTimer =
    setInterval(() => {

      nextSlide();

    }, 3500);

}


/* =========================
   INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderHome();

    loadProfile();

    startSlider();

  }
);


/* Jika app.js dipanggil setelah HTML selesai */
if (document.readyState !== "loading") {

  renderHome();

  loadProfile();

  startSlider();

}
