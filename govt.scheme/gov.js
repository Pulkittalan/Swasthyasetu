// Global variable to store the fetched data
let schemes = [];

// Fetch data from the API
fetch('http://localhost:3000/api/schemes')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        schemes = data; // Store data into the schemes variable
        console.log('Data received:', schemes); // Log the data to check if it's properly received
        displaySchemes(schemes); // Display all schemes initially
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to filter schemes based on the entered age or eligibility
function filterSchemes() {
    const filterInput = document.getElementById('filter').value.toLowerCase();
    const filteredSchemes = schemes.filter(scheme => {
        const ageGroup = scheme['Age Group'].toLowerCase();
        const eligibility = scheme['Eligibility'].toLowerCase();

        // If filter is a number (age input), check if it's within the age range or 'All Ages'
        if (!isNaN(filterInput)) {
            const age = parseInt(filterInput, 10);
            if (ageGroup === 'all ages') return true; // Include schemes with 'All Ages'
            if (ageGroup.includes('-')) {
                const [minAge, maxAge] = ageGroup.split('-').map(Number);
                return age >= minAge && age <= maxAge;
            }
        }
        // If filter is not a number (eligibility text search), match it against eligibility
        return eligibility.includes(filterInput) || ageGroup.includes(filterInput);
    });

    // Display the filtered schemes
    displaySchemes(filteredSchemes);
}

// Function to display schemes in the table
function displaySchemes(filteredSchemes) {
    const tableBody = document.querySelector('#schemes-table tbody');
    tableBody.innerHTML = ''; // Clear previous results

    if (filteredSchemes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4">No schemes found</td>`;
        tableBody.appendChild(row);
    } else {
        filteredSchemes.forEach(scheme => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${scheme['Scheme Name']}</td>
                <td>${scheme['Description']}</td>
                <td>${scheme['Eligibility']}</td>
                <td>${scheme['Age Group']}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Initial call to display all schemes on page load
window.onload = () => displaySchemes(schemes);