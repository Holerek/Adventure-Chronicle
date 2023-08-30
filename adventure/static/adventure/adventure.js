import {getCookie} from "./util.js"


// variable to control state or behavior of functions
var addLocationStatus = false
var activeEditDayPopup = undefined
var activeEditLocationPopup = undefined
var mainMarker = null

// initialize the map
var map = L.map('map').setView([51.112, 17.036], 13)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map)


document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-day-form').style.display = 'none'
    document.getElementById('show-add-day-form').onclick = showAddDayForm
    document.getElementById("edit-day-cancel").onclick = hidePopup
    document.getElementById("edit-location-cancel").onclick = hidePopup
    document.getElementById("edit-day-delete").onclick = deleteDay
    document.getElementById("edit-location-delete").onclick = deleteLocation
    
    // activate arrows for showing and hiding location list
    showMore()
    activateEditLocationButtons()
    
    const divs = document.querySelectorAll('.adv-item')
    
    divs.forEach(div => {
        const children = div.children
        const editButton = children[2]
        const date = children[0]
        const description = children[1]
        // const text = description.innerHTML

        

        editButton.onclick = function() {
            //update activeEditDayPopup value 
            activeEditDayPopup = div

            //show popup
            const popup = document.querySelector('#edit-day-div')
            popup.style.display = 'block'

            //select edit day input fields
            const editDayForm = document.querySelector("#edit-form")
            const popupChilds = editDayForm.children
            const editDate = popupChilds[3]
            const editDescription = popupChilds[5]

            //prefill input fields with present data
            editDate.value = date.innerHTML
            editDescription.value = description.innerHTML
            document.querySelector("#day_id").value = editButton.dataset.id
            
            deactivateBackground(true)
        }
    })
})


function showAddDayForm() {
    const form = document.querySelector("#add-day-form")
    const button = document.getElementById("show-add-day-form")

    if (form.style.display == "none") {
        form.style.display = "flex"
        button.innerHTML = "Hide"
    } else {
        form.style.display = "none"
        button.innerHTML = "Add Day"
    }
}


function activateEditLocationButtons() {
    const locations = document.querySelectorAll('.location')
    locations.forEach( location => {
        const locationChildren = location.children
        const editLocationButton = locationChildren[3]

        editLocationButton.onclick = function() {
            document.getElementById('id_edit_location_id').value = editLocationButton.dataset.id
            showEditLocationForm(location)
        }
    })
}


function showEditLocationForm(location) {
    const popup = document.querySelector("#edit-location-div")
    const form = document.getElementById('edit-location-form')
    
    // select location elements
    const locationChildren = location.children
    const currentName = locationChildren[0]
    const currentDescription = locationChildren[2]

    // prefill form
    const newName = document.getElementById('id_edit_location_name')
    const newDescription = document.getElementById('id_edit_location_description')
    newName.value = currentName.innerHTML
    newDescription.value = currentDescription.innerHTML
    
    // show form and deactivate background 
    popup.style.display = "flex"
    
    // update location to be removed if user click delete button
    activeEditLocationPopup = location

    deactivateBackground(true)

    document.getElementById('edit-location-form').onsubmit = () => {
        saveLocation(location)
        currentName.innerHTML = newName.value
        currentDescription.innerHTML = newDescription.value
        
        return false
    }
}

function saveLocation(location) {
    const form = document.getElementById('edit-location-form')
    // const imageField = document.getElementById('id_new_location_img')
    
    const formData = new FormData(form)
    
    // formData.append('file', imageField.files[0])

    fetch('/edit-location', {
        method: 'POST',
        mode: "same-origin",
        body: formData,
    })
    .then( response => response.json())
    .then( res => console.log(res.message))

    hidePopup()

    return false
}


function deleteLocation() {
    const locationId = document.getElementById('id_edit_location_id')
    
    fetch('/delete-location', {
        method: 'POST',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            location_id: locationId.value,
        })
    })
    .then(response => response.json())
    .then(message => alert(message.message))
    
    //remove delete day div
    activeEditLocationPopup.remove()
    
    //hide popup and reset activeEditDayPopup value 
    hidePopup()
}


export function hidePopup() {
    //hide popup
    document.querySelector("#edit-day-div").style.display = "none"
    document.querySelector("#edit-location-div").style.display = "none"
    
    // enable background
    deactivateBackground(false)

    //clear activeEditDayPopup value
    activeEditDayPopup = undefined
    activeEditLocationPopup = undefined
}


function deactivateBackground(state) {
    const dayList = document.querySelector(".adv-contener")
    const mapView = document.querySelector("#map")
    
    if (state) {
        //disable day list
        dayList.style.opacity = 0.5
        dayList.style.pointerEvents = "none"
        
        //disable map
        mapView.style.opacity = 0.5
        mapView.style.pointerEvents = "none"
    }
    else {
        //enable day list
        dayList.style.opacity = 1
        dayList.style.pointerEvents = "auto"

        //enable map
        mapView.style.opacity = 1
        mapView.style.pointerEvents = "auto"
    }
}


function showMore() {
    const showMoreArrows = document.querySelectorAll('.show-more')

    showMoreArrows.forEach( arrow => {

        const parent = arrow.parentElement
        const parentChildren = parent.children
            
        const locationList = parentChildren[4]
        locationList.style.display = "none"

        arrow.onclick = function() {

            if (locationList.style.display === "none") {
                locationList.style.display = "flex"
                arrow.classList.add('arrow-up')
            }
            else {
                locationList.style.display = "none"
                arrow.classList.remove('arrow-up')
            }
        }
    })
}


function deleteDay() {
    const dayId = document.getElementById('day_id').value
    
    fetch('/delete-day', {
        method: 'POST',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            day_id: dayId,
        })
    })
    .then(response => response.json())
    .then(message => alert(message.message))
    
    //remove delete day div
    activeEditDayPopup.remove()
    
    //hide popup and reset activeEditDayPopup value 
    hidePopup()
}


// =============================================================================================


addEventListener('DOMContentLoaded', () => {
    document.getElementById('new-location-form').onsubmit = addLocation
    // document.getElementById('edit-location-form').onsubmit = editLocation
    map.on('click', onMapClick)
    loadMarkers()
})



// show add location form for each day
addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.add-location')
    buttons.forEach( button => {
        
        button.onclick = function() {
            const newLocationForm = document.getElementById('new-location-form')
            const addLocationDay = document.getElementById('id_new_location_day')
            if (button.innerHTML === 'Hide') {
                newLocationForm.style.display = 'none'
                addLocationStatus = false
                addLocationDay.value = undefined
                button.innerHTML = 'Add Location'
            }
            else {
                // reset all add location buttons
                buttons.forEach( b => {
                    b.innerHTML = 'Add Location'
                })

                // show new location form by selecting and moving form element
                button.innerHTML = 'Hide'
                newLocationForm.style.marginTop = '10px'
                newLocationForm.style.marginBottom = '10px'

                const parent = button.parentElement
                parent.insertBefore(newLocationForm, parent.children[1])
                // parent.prepend(newLocationForm)
                newLocationForm.style.display = 'flex'

                // activate optional feature of onMapClick function
                addLocationStatus = true
                addLocationDay.value = button.dataset.id
            }
        }
    })
    
})


function addLocation() {
    const form = document.getElementById('new-location-form')
    const imageField = document.getElementById('id_new_location_img')
    
    const formData = new FormData(form)
    
    formData.append('file', imageField.files[0])

    fetch('/location', {
        method: 'POST',
        mode: "same-origin",
        body: formData,
    })
    .then( response => response.json())
    .then( res => alert(res.message))

    hidePopup()

    return false
}


function onMapClick(e) {
    
    // delete old marker
    if (mainMarker !== null) {
        map.removeLayer(mainMarker)
    }

    // create new marker
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    mainMarker = L.marker([lat, lng]).addTo(map)

    // bind popup to marker
    if (addLocationStatus === false) {
        mainMarker.bindPopup("normal popup").openPopup()
    }
    else if (addLocationStatus === true) {
        mainMarker.bindPopup("New Location").openPopup()
        document.getElementById('id_new_location_lat').value = lat
        document.getElementById('id_new_location_lng').value = lng
    }
}


function loadMarkers() {
    const markersData = JSON.parse(document.getElementById('markers-data').textContent)
    markersData.forEach( day => {
        let locations = day.locations
        locations.forEach( location => {
            
            let marker = L.marker([location.fields.lat, location.fields.lng]).addTo(map)
            var popupContent = createPopupContent(location)
            marker.bindPopup(popupContent)
        
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
    popupContent.classList.add('location-popup')

    // bind all elements 
    popupContent.appendChild(popupName)
    popupContent.appendChild(popupImg)
    
    return popupContent
}