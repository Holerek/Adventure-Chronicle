import { getCookie } from "./util.js";

// variable to control state or behavior of functions
var addLocationStatus = false;
var addLocationDay = undefined;


// initialize the map
var map = L.map('map').setView([51.112, 17.036], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);


addEventListener('DOMContentLoaded', () => {
    document.getElementById('new-location-form').onsubmit = addLocation;
    map.on('click', onMapClick);
    loadMarkers();
})



// show add location form for each day
addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.add-location').forEach( button => {
        button.onclick = function() {

            // show new location form by selecting and moving form element
            const newLocationForm = document.getElementById('new-location-form');
            newLocationForm.style.marginTop = '10px'
            newLocationForm.style.marginBottom = '10px'

            const parent = button.parentElement;
            parent.prepend(newLocationForm);
            newLocationForm.style.display = 'flex';

            // activate optional feature of onMapClick function
            addLocationStatus = true;
            addLocationDay = button.dataset.id;
        }
    })
    
})


function addLocation() {
    fetch('/location', {
        method: 'POST',
        headers:{'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            day_id: addLocationDay,
            name: document.getElementById('id_new_location_name').value,
            description: document.getElementById('id_new_location_description').value,
            lat: document.getElementById('id_new_location_lat').value,
            lng: document.getElementById('id_new_location_lng').value,
        })
    })
    // .then( response => console.log(response.json()))

    return false
}



var mainMarker = null;
var mainPopup = L.popup();

function onMapClick(e) {
    
    // delete old marker
    if (mainMarker !== null) {
        map.removeLayer(mainMarker);
    }

    // create new marker
    let lat = e.latlng.lat;
    let lng = e.latlng.lng;
    mainMarker = L.marker([lat, lng]).addTo(map);

    // bind popup to marker
    if (addLocationStatus === false) {
        mainMarker.bindPopup("normal popup").openPopup();
    }
    else if (addLocationStatus === true) {
        mainMarker.bindPopup("add location popup").openPopup();
        document.getElementById('id_new_location_lat').value = lat;
        document.getElementById('id_new_location_lng').value = lng;
    }
    
    // mainPopup.setContent("test")
    //     .setLatLng(e.latlng)
    //     .openOn(map);


}


function loadMarkers() {
    const markersData = JSON.parse(document.getElementById('markers-data').textContent);
    markersData.forEach( day => {
        let locations = day.locations;
        locations.forEach( location => {
            console.log(location.fields.lat);
            let marker = L.marker([location.fields.lat, location.fields.lng]).addTo(map);
            marker.bindPopup('test');
            marker.onclick = marker.openPopup();
        })
    })

}


