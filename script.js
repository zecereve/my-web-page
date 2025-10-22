// © Year display in footer
const yEl = document.getElementById("y");
if (yEl) yEl.textContent = new Date().getFullYear();

// 🌍 GEZDİĞİM ŞEHİRLER HARİTASI
const mapCenter = ol.proj.fromLonLat([32.854, 39.9208]); // Ankara merkez

// === BASE LAYERS ===
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  title: "Street Map",
  type: "base",
});

const satelliteLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  }),
  title: "Satellite",
  type: "base",
  visible: false,
});

// === MAP CREATION ===
const map = new ol.Map({
  target: "map",
  layers: [osmLayer, satelliteLayer],
  view: new ol.View({
    center: mapCenter,
    zoom: 6.8,
  }),
});

// === GEZDİĞİN ŞEHİRLER ===
const cities = [
  { name: "Afyon", coord: [30.537, 38.7575], img: "afyon.jpeg" },
  { name: "Ankara", coord: [32.8541, 39.9208], img: "ankara.jpg" },
  { name: "Antalya", coord: [30.7133, 36.8969], img: "antalya.jpg" },
  { name: "Balıkesir", coord: [27.8844, 39.6484], img: "balikesir.jpg" },
  { name: "Bartın", coord: [32.337, 41.635], img: "bartin.jpg" },
  { name: "Bilecik", coord: [29.9793, 40.1501], img: "bilecik.jpg" },
  { name: "Bolu", coord: [31.582, 40.735], img: "bolu.jpg" },
  { name: "Bursa", coord: [29.060, 40.182], img: "bursa.jpg" },
  { name: "Çanakkale", coord: [26.406, 40.146], img: "canakkale.jpg" },
  { name: "Düzce", coord: [31.163, 40.843], img: "duzce.jpeg" },
  { name: "Eskişehir", coord: [30.5256, 39.7667], img: "eskisehir.jpeg" },
  { name: "Isparta", coord: [30.5537, 37.7648], img: "isparta.jpg" },
  { name: "İstanbul", coord: [28.9784, 41.0082], img: "istanbul.jpeg" },
  { name: "İzmir", coord: [27.1287, 38.4192], img: "izmir.jpeg" },
  { name: "Karabük", coord: [32.625, 41.2], img: "karabuk.jpeg" },
  { name: "Kayseri", coord: [35.495, 38.731], img: "kayseri.jpeg" },
  { name: "Manisa", coord: [27.4265, 38.6131], img: "manisa.jpeg" },
  { name: "Nevşehir", coord: [34.712, 38.625], img: "nevsehir.jpeg" },
  { name: "Ordu", coord: [37.878, 40.984], img: "ordu.jpg" },
  { name: "Samsun", coord: [36.336, 41.279], img: "samsun.jpeg" },
  { name: "Sivas", coord: [37.0179, 39.7477], img: "sivas.jpg" },
  { name: "Trabzon", coord: [39.72, 41.001], img: "trabzon.jpeg" },
  { name: "Rize", coord: [40.523, 41.025], img: "rize.jpg" },
  { name: "Zonguldak", coord: [31.79, 41.45], img: "zonguldak.jpg" },
];

// === MARKERLAR OLUŞTUR ===
const features = cities.map((city) => {
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(city.coord)),
    name: city.name,
    image: `images/landmarks/${city.img}`,
  });
  feature.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: "#ff4fa3" }),
        stroke: new ol.style.Stroke({ color: "#fff", width: 2 }),
      }),
    })
  );
  return feature;
});

const cityLayer = new ol.layer.Vector({
  source: new ol.source.Vector({ features }),
});
map.addLayer(cityLayer);

// === POPUP ===
const popupEl = document.createElement("div");
popupEl.className = "popup";
document.body.appendChild(popupEl);

const popup = new ol.Overlay({
  element: popupEl,
  positioning: "bottom-center",
  stopEvent: false,
  offset: [0, -10],
});
map.addOverlay(popup);

// === HOVER POPUP (on mouse move) ===
map.on("pointermove", function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
  if (feature) {
    const props = feature.getProperties();
    popupEl.innerHTML = `
      <strong>${props.name}</strong><br>
      <img src="${props.image}" alt="${props.name}" width="180"
           style="border-radius:10px;margin-top:5px;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
    `;
    popup.setPosition(evt.coordinate);
    popupEl.style.display = "block";
    map.getTargetElement().style.cursor = "pointer"; // imleç el simgesine dönüşür
  } else {
    popupEl.style.display = "none";
    map.getTargetElement().style.cursor = "";
  }
});


// === LAYER SWITCHER ===
const layerSwitcher = document.createElement("button");
layerSwitcher.textContent = "🗺️ Toggle Map Layer";
layerSwitcher.className = "layer-btn";
document.body.appendChild(layerSwitcher);

layerSwitcher.addEventListener("click", () => {
  const osmVisible = osmLayer.getVisible();
  osmLayer.setVisible(!osmVisible);
  satelliteLayer.setVisible(osmVisible);
});

// === GEOLOCATION BUTTON ===
const geoButton = document.createElement("button");
geoButton.textContent = "📍 Show My Location";
geoButton.className = "geo-btn";
document.body.appendChild(geoButton);

geoButton.addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLonLat = [pos.coords.longitude, pos.coords.latitude];
      const user3857 = ol.proj.fromLonLat(userLonLat);
      map.getView().animate({ center: user3857, zoom: 10, duration: 1000 });

      const userFeature = new ol.Feature({ geometry: new ol.geom.Point(user3857) });
      const userLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [userFeature] }),
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({ color: "#00BFFF" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 2 }),
          }),
        }),
      });
      map.addLayer(userLayer);
    });
  } else {
    alert("Your browser does not support geolocation.");
  }
});



// === SCROLL FADE-IN EFFECT ===
const faders = document.querySelectorAll(".fade-section");
const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
const appearOnScroll = new IntersectionObserver(function (entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, appearOptions);
faders.forEach((fader) => appearOnScroll.observe(fader));
