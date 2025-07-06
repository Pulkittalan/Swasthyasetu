let selectedCategory = '';
let map;
let bedData = {}; // Object to store bed data for each category

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 40.730610, lng: -73.935242 },
        zoom: 12,
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            document.getElementById('location').value = lat + ", " + lng;
            map.setCenter({ lat: lat, lng: lng });
            new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map,
            });
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to populate fields from URL query parameters
function populateFieldsFromURL() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hospitalName = urlParams.get('hospitalName'); 
    const category = urlParams.get('category');
    const totalBeds = urlParams.get('totalBeds');
    const availableBeds = urlParams.get('availableBeds');

    // Populate the fields if the parameters exist
    if (hospitalName) {
        document.getElementById('hospitalName').value = hospitalName;
    }


    if (category) {
        selectCategory(category);
    }

    if (totalBeds) {
        document.getElementById('totalBeds').value = totalBeds;
    }

    if (availableBeds) {
        document.getElementById('availableBeds').value = availableBeds;
    }
}

// Select category for entering bed data
function selectCategory(category) {
    selectedCategory = category;
    document.getElementById('category-name').textContent = category;
    document.getElementById('bed-selection').style.display = 'block';

    // Display previously stored data if available
    if (bedData[category]) {
        document.getElementById('totalBeds').value = bedData[category].totalBeds;
        document.getElementById('availableBeds').value = bedData[category].availableBeds;
    } else {
        document.getElementById('totalBeds').value = '';
        document.getElementById('availableBeds').value = '';
    }
}
// Submit bed data for a category
function submitBedData() {
    let totalBeds = parseInt(document.getElementById('totalBeds').value);
    let availableBeds = parseInt(document.getElementById('availableBeds').value);
    let hospitalName = document.getElementById('hospitalName').value;
    let location = document.getElementById('location').value;
    let category = selectedCategory;
    // Send data to the server
    fetch('http://localhost:3000/submit-bed-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            hospitalName,
            location,
            category,
            totalBeds,
            availableBeds,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Data submitted successfully');
        } else {
            alert('Error submitting data');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting data');
    });

    // Store bed data for the selected category
    bedData[selectedCategory] = {
        totalBeds: totalBeds,
        availableBeds: availableBeds
    };

    // Reset the bed selection form
    document.getElementById('bed-selection').style.display = 'none';
}

// Show all beds for all categories
// Show all beds for all categories
// Show all beds for all categories
function showAllBeds() {
let bedContainer = document.getElementById('bedStatus');
bedContainer.innerHTML = '';

for (const category in bedData) {
    if (bedData.hasOwnProperty(category)) {
        let categoryData = bedData[category];

        // Category title
        let categoryTitle = document.createElement('h2');
        categoryTitle.textContent = `${category} - Available Beds: ${categoryData.availableBeds}, Occupied Beds: ${categoryData.totalBeds - categoryData.availableBeds}`;
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', `title-${category}`);
        bedContainer.appendChild(categoryTitle);

        // Define images for available and occupied beds
        let availableBedImage = "url('./not_available_bed-removebg-preview (1).png')";
        let occupiedBedImage = "";

        if (category === 'ICU') {
            occupiedBedImage = "url('./bluebed-removebg-preview.png')";
        } else if (category === 'General Ward') {
            occupiedBedImage = "url('./gerybed-removebg-preview.png')";
        } else if (category === 'Emergency') {
            occupiedBedImage = "url('./redbed-removebg-preview.png')";
        } else if (category === 'Surgical') {
            occupiedBedImage = "url('./greenbed-removebg-preview.png')";
        }

        // Create beds
        for (let i = 0; i < categoryData.totalBeds; i++) {
            let bed = document.createElement('div');
            bed.classList.add('bed');
            
            // Initially set beds as available or occupied
            if (i < categoryData.availableBeds) {
                bed.style.backgroundImage = availableBedImage;
                bed.setAttribute('data-status', 'available');
            } else {
                bed.style.backgroundImage = occupiedBedImage;
                bed.setAttribute('data-status', 'occupied');
            }

            // Add click event listener to toggle bed status
            bed.addEventListener('click', function () {
                let currentStatus = bed.getAttribute('data-status');

                if (currentStatus === 'available') {
                    bed.style.backgroundImage = occupiedBedImage;
                    bed.setAttribute('data-status', 'occupied');
                    categoryData.availableBeds--; // Reduce available count
                } else {
                    bed.style.backgroundImage = availableBedImage;
                    bed.setAttribute('data-status', 'available');
                    categoryData.availableBeds++; // Increase available count
                }

                // Update the category title with the new count
                document.getElementById(`title-${category}`).textContent =
                    `${category} - Available Beds: ${categoryData.availableBeds}, Occupied Beds: ${categoryData.totalBeds - categoryData.availableBeds}`;
            });

            bedContainer.appendChild(bed);
        }
    }
}
}





function toggleLocation() {
    const locationBox = document.getElementById('hospital-location');
    const toggleButton = document.getElementById('toggle-location');

    if (locationBox.style.display === 'none' || locationBox.style.display === '') {
        locationBox.style.display = 'block';
        toggleButton.textContent = "Hide Hospital Location";
    } else {
        locationBox.style.display = 'none';
        toggleButton.textContent = "Show Hospital Location";
    }
}

// Initialize the map when the page loads
window.onload = function () {
    initMap();
    populateFieldsFromURL();
};

//bed server 

