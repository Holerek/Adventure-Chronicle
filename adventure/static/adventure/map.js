
// initialize the map
var map = L.map('map').setView([51.112, 17.036], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var addLocationStatus = false;

addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.add-location').forEach( button => {
        button.onclick = function() {

            const newLocationForm = document.getElementById('new-location-form');
            newLocationForm.style.marginTop = '10px'
            newLocationForm.style.marginBottom = '10px'

            const parent = button.parentElement.parentElement;
            parent.prepend(newLocationForm);
            newLocationForm.style.display = 'flex';
            // parent.appendChild(newLocationForm);
            // document.getElementById('test').appendChild(newLocationForm);

            // var fragment = document.createDocumentFragment();
            // fragment.appendChild(document.getElementById('add-location-form'));
            // document.getElementById('map').appendChild(fragment);

            // const parent = button.parentElement;
            // parent.appendChild();
            addLocationStatus = true;
        }
    })
    
})



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

    }
    
    // mainPopup.setContent("test")
    //     .setLatLng(e.latlng)
    //     .openOn(map);


}


map.on('click', onMapClick);