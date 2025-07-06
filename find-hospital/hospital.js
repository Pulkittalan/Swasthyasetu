// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Default position set to London
const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add user location functionality
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    map.setView([lat, lon], 13); // Zoom to user's location

    // Add a marker for the user's location
    L.marker([lat, lon]).addTo(map)
      .bindPopup("You are here")
      .openPopup();
  });
}

// Example hospital data (this would be fetched from a database or API)
const hospitals = [
  [
    { id: 1, name: 'Kailash Hospital, Greater Noida', type: 'public', lat: 28.4707769, lon: 77.5053503 },
    { id: 2, name: 'NAVIN HOSPITAL', type: 'public', lat: 28.5498211, lon: 77.5499871 },
    { id: 3, name: 'Sharda Hospital', type: 'public', lat: 21.3057768, lon: 81.635563 },
    { id: 4, name: 'JR Hospital', type: 'public', lat: 16.89438, lon: 79.87049 },
    { id: 5, name: 'Green City Hospital', type: 'public', lat: 12.9062193, lon: 77.580682 },
    { id: 6, name: 'Roshan Hospital', type: 'public', lat: 25.7473427, lon: 68.635072 },
    { id: 7, name: 'AMC Hospital', type: 'public', lat: 9.9267975, lon: 78.1420027 },
    { id: 8, name: 'Geeta Hospital', type: 'public', lat: 16.7571655, lon: 81.6774903 },
    { id: 9, name: 'Vrindavan Hospital', type: 'public', lat: 27.1420201, lon: 81.9666207 },
    { id: 10, name: 'Surbhi Hospital', type: 'public', lat: 28.6491348, lon: 77.2164415 },
    { id: 11, name: 'Shanti Hospital', type: 'public', lat: 12.9235041, lon: 77.5857517 },
    { id: 12, name: 'Indraprastha Apollo Hospital', type: 'public', lat: 28.5408389, lon: 77.2834999 },
    { id: 13, name: 'SSR Hospital', type: 'public', lat: 8.9397616, lon: 76.6563009 },
    { id: 14, name: 'Divine Hospital', type: 'public', lat: 9.7332933, lon: 76.5057396 },
    { id: 15, name: 'Shubham Hospital', type: 'public', lat: 22.6910407, lon: 75.8263785 },
    { id: 16, name: 'Astha Hospital', type: 'public', lat: 28.3509265, lon: 77.0649209 },
    { id: 17, name: 'Aakash Hospital', type: 'public', lat: 28.5350359, lon: 77.2148651 },
    { id: 18, name: 'Surya Hospital', type: 'public', lat: 17.2482259, lon: 80.1470769 },
    { id: 19, name: 'Kamal Hospital', type: 'public', lat: 14.6619481, lon: 74.3098806 },
    { id: 20, name: 'Chandra Laxmi Hospital', type: 'public', lat: 28.666936, lon: 77.4325258 },
    { id: 21, name: 'Shreya Hospital', type: 'public', lat: 17.4795083, lon: 78.3202454 },
    { id: 22, name: 'Holy Family Hospital', type: 'public', lat: 9.7062998, lon: 76.7598364 },
    { id: 23, name: 'Garg Hospital', type: 'public', lat: 29.6827341, lon: 76.998311 },
    { id: 24, name: 'Ariba hospital', type: 'public', lat: 21.1184116, lon: 70.1169222 },
    { id: 25, name: 'Anand hospital', type: 'public', lat: 18.6539354, lon: 73.7646919 },
    { id: 26, name: 'New life hospital', type: 'public', lat: 19.0897614, lon: 72.9049996 },
    { id: 27, name: 'Sparsh Hospital', type: 'public', lat: 26.8225833, lon: 75.7798425 },
    { id: 28, name: 'Medwin Hospital', type: 'public', lat: 24.8205913, lon: 67.0718861 },
    { id: 29, name: 'Sarvodaya Hospital', type: 'public', lat: 12.9390944, lon: 77.5619057 },
    { id: 30, name: 'RAJRANI HOSPITAL', type: 'public', lat: 26.3994503, lon: 80.3146715 },
    { id: 31, name: 'Ghai Hospital', type: 'public', lat: 28.3770649, lon: 77.3294283 },
    { id: 32, name: 'Apollo Spectra Hospitals', type: 'public', lat: 28.5555937, lon: 77.2412436 },
    { id: 33, name: 'Gupta Multispeciality Hospital', type: 'public', lat: 29.7995922, lon: 76.4148903 },
    { id: 34, name: 'Nims Hospital', type: 'public', lat: 21.018631, lon: 75.559781 },
    { id: 35, name: 'Sanjeevan Hospital', type: 'public', lat: 19.0608709, lon: 72.9247689 },
    { id: 36, name: 'Noble Hospital', type: 'public', lat: 22.7191416, lon: 75.8778054 },
    { id: 37, name: 'Virmani Hospital', type: 'public', lat: 28.6197415, lon: 77.3014099 },
    { id: 38, name: 'Talwar Hospital', type: 'public', lat: 31.3091051, lon: 75.5732258 },
    { id: 39, name: 'Galaxy Hospital', type: 'public', lat: 12.9316792, lon: 77.5450887 },
    { id: 40, name: 'Bal Kishan Memorial Hospital', type: 'public', lat: 28.5118287, lon: 77.2346317 },
    { id: 41, name: 'Healing Touch Hospital', type: 'public', lat: 17.3903338, lon: 78.4514802 },
    { id: 42, name: 'Nulife Hospital', type: 'public', lat: 19.0881022, lon: 72.9051983 },
    { id: 43, name: 'Royal Multispeciality Hospital', type: 'public', lat: 28.3947462, lon: 77.3003089 }
  ]
  
];

// Add hospital markers to the map
const markers = [];
hospitals.forEach(hospital => {
  const marker = L.marker([hospital.lat, hospital.lon]).addTo(map)
    .bindPopup(`<b>${hospital.name}</b><br>Type: ${hospital.type}`);
  markers.push({ ...hospital, marker });
});

// Filter function
function filterHospitals() {
  const selectedType = document.getElementById('hospital-type').value;
  const maxDistance = document.getElementById('distance').value;

  // Remove all markers
  markers.forEach(markerObj => {
    map.removeLayer(markerObj.marker);
  });

  // Add markers that match the filter
  markers.filter(markerObj => {
    const matchType = selectedType === 'all' || markerObj.type === selectedType;
    const matchDistance = maxDistance === '' || markerObj.distance <= maxDistance;

    if (matchType && matchDistance) {
      markerObj.marker.addTo(map);
      return true;
    }
    return false;
  });
}

// Initial filter load
filterHospitals();
