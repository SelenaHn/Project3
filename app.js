// Initialize map
var map = L.map('map').setView([51.0447, -114.0719], 12); // Calgary coordinates

// Add tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize Overlapping Marker Spiderfier
var oms = new OverlappingMarkerSpiderfier(map);

// Initialize marker cluster group
var markers = L.markerClusterGroup();

// Function to fetch building permits data based on date range
function fetchBuildingPermits(startDate, endDate) {
    // Construct API query URL
    var apiUrl = `https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate between '${startDate}' and '${endDate}'`;
    console.log("API URL:", apiUrl); // Debugging: Check constructed API URL

    // Fetch data from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response:", data); // Debugging: Check API response

            // Clear existing markers from map
            markers.clearLayers();

            // Add markers to map with popup details
            data.features.forEach(feature => {
                var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
                
                // Bind popup with building permit details
                marker.bindPopup(`
                    <b>Issued Date:</b> ${feature.properties.issueddate}<br>
                    <b>Work Class Group:</b> ${feature.properties.workclassgroup}<br>
                    <b>Contractor Name:</b> ${feature.properties.contractorname}<br>
                    <b>Community Name:</b> ${feature.properties.communityname}<br>
                    <b>Original Address:</b> ${feature.properties.originaladdress}
                `);
                
                // Add marker to Overlapping Marker Spiderfier
                oms.addMarker(marker);
                
                // Add marker to marker cluster group
                markers.addLayer(marker);
            });

            // Add marker cluster group to map
            map.addLayer(markers);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to handle search button click
function handleSearch() {
    // Get selected date range from datepicker input field
    var dateRange = $('#date-range').val().split(' - ');
    var startDate = dateRange[0];
    var endDate = dateRange[1] ? dateRange[1] : startDate; // Use start date if end date is missing
    console.log("Selected date range:", startDate, endDate); // Debugging: Check selected date range

    // Fetch building permits data based on date range
    fetchBuildingPermits(startDate, endDate);
}

// Attach click event handler to search button
$('#search-button').click(handleSearch);
