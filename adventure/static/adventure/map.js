import { getCookie } from "./util.js";
import { hidePopup } from "./adventure.js";

// variable to control state or behavior of functions
var addLocationStatus = false;
// var addLocationDay = undefined;


// initialize the map
var map = L.map('map').setView([51.112, 17.036], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);


addEventListener('DOMContentLoaded', () => {
    document.getElementById('new-location-form').onsubmit = addLocation;
    // document.getElementById('edit-location-form').onsubmit = editLocation;
    map.on('click', onMapClick);
    loadMarkers();
})



// show add location form for each day
addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.add-location')
    buttons.forEach( button => {
        
        button.onclick = function() {
            const newLocationForm = document.getElementById('new-location-form');
            const addLocationDay = document.getElementById('id_new_location_day');
            if (button.innerHTML === 'Hide') {
                newLocationForm.style.display = 'none';
                addLocationStatus = false;
                addLocationDay.value = undefined;
                button.innerHTML = 'Add Location'
            }
            else {
                // reset all add location buttons
                buttons.forEach( b => {
                    b.innerHTML = 'Add Location'
                })

                // show new location form by selecting and moving form element
                button.innerHTML = 'Hide'
                newLocationForm.style.marginTop = '10px';
                newLocationForm.style.marginBottom = '10px';

                const parent = button.parentElement;
                parent.prepend(newLocationForm);
                newLocationForm.style.display = 'flex';

                // activate optional feature of onMapClick function
                addLocationStatus = true;
                addLocationDay.value = button.dataset.id;
            }
        }
    })
    
})


function addLocation() {
    const form = document.getElementById('new-location-form')
    const imageField = document.getElementById('id_new_location_img')
    
    const formData = new FormData(form)
    
    formData.append('file', imageField.files[0]);

    fetch('/location', {
        method: 'POST',
        mode: "same-origin",
        body: formData,
    })
    .then( response => response.json())
    .then( res => alert(res.message))

    

    return false
}


// function editLocation() {
//     const form = document.getElementById('edit-location-form')
//     // const imageField = document.getElementById('id_new_location_img')
    
//     const formData = new FormData(form)
    
//     // formData.append('file', imageField.files[0]);

//     fetch('/edit-location', {
//         method: 'POST',
//         mode: "same-origin",
//         body: formData,
//     })
//     .then( response => response.json())
//     .then( res => console.log(res.message))

//     hidePopup()

//     return false
// }


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
        mainMarker.bindPopup("New Location").openPopup();
        document.getElementById('id_new_location_lat').value = lat;
        document.getElementById('id_new_location_lng').value = lng;
    }
}


function loadMarkers() {
    const markersData = JSON.parse(document.getElementById('markers-data').textContent);
    markersData.forEach( day => {
        let locations = day.locations;
        locations.forEach( location => {
            
            let marker = L.marker([location.fields.lat, location.fields.lng]).addTo(map);
            var popupContent = createPopupContent(location);
            marker.bindPopup(popupContent);
            
            // marker.bindPopup(location.fields.name);
           
        })
    })
}

function createPopupContent({fields: {name, description, photo}}) {
    // create elements of popup content
    const popupContent = document.createElement('div')
    const popupName = document.createElement('strong')
    const popupDescription = document.createElement('span')
    const popupImg = document.createElement('img')
    
    // fill elements with data
    popupName.innerHTML = name
    popupDescription.innerHTML = description
    
    // if there is a photo add path to img tag
    if (photo) {
        popupImg.src = `/media/${photo}`
        popupImg.alt = 'location image'
    }
    else {
        popupImg.alt = 'no image yet'
    }
    
    // add classes 
    popupContent.classList.add('location-item')
    popupContent.classList.add('location')

    // bind all elements 
    popupContent.appendChild(popupName)
    popupContent.appendChild(popupImg)
    popupContent.appendChild(popupDescription)
    
    return popupContent
}


