import {getCookie, deactivateBackground, createConfirmationPopup} from "./util.js"


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

// custom icon 
var greenMarker = L.icon({
    iconUrl: '/static/adventure/img/green-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41]
})

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-day-form').style.display = 'none'
    document.getElementById('show-add-day-form').onclick = showAddDayForm
    document.getElementById("edit-day-cancel").onclick = hidePopup
    document.getElementById("edit-day-delete").onclick = deleteDay
    document.getElementById("edit-location-cancel").onclick = hidePopup
    document.getElementById("edit-location-delete").onclick = deleteLocation
    document.getElementById('new-location-form').onsubmit = addLocation
    map.on('click', onMapClick)
    
    //loads markers from server
    loadMarkers()
    
    // activate arrows for showing and hiding location list
    showMore()

    // add action to all edit location buttons
    activateEditLocationButtons()
    
    // add actions to all add location/hide buttons
    ActivateAddLocationButtons()
    
    // add actions to all edit day buttons
    activateEditDayButtons()
    
    //
    dynamicPopupSelector()
    

    
})


function onMapClick(e) {
    
    // delete old marker
    if (mainMarker !== null) {
        map.removeLayer(mainMarker)
        mainMarker = null
    }
    else {
        // create new marker
        let lat = e.latlng.lat
        let lng = e.latlng.lng
        // mainMarker = L.marker([lat, lng]).addTo(map)

        // bind popup to marker
        if (addLocationStatus === false) {
            mainMarker = L.marker([lat, lng], {icon: greenMarker}).addTo(map)  
        }
        else if (addLocationStatus === true) {
            mainMarker = L.marker([lat, lng]).addTo(map)
            mainMarker.bindPopup("New Location").openPopup()
            document.getElementById('id_new_location_lat').value = lat
            document.getElementById('id_new_location_lng').value = lng
        }
    }
}


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


function activateEditDayButtons() {
    
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
    // select html elements
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

    form.onsubmit = () => {
        saveEditedLocation(location)
        currentName.innerHTML = newName.value
        currentDescription.innerHTML = newDescription.value
        
        return false
    }
}

function saveEditedLocation(location) {
    const form = document.getElementById('edit-location-form')
    const formData = new FormData(form)

    fetch('/edit-location', {
        method: 'POST',
        mode: "same-origin",
        body: formData,
    })
    .then( response => response.json())
    .then( res => console.log(res.message))
    .then( () => {
        // update photo after upload of image
        const photo = formData.get('edit_location_img')
        
        if (photo.size !== 0) {
            // extract photo name and convert photo name to format on server
            let photoName = photo.name
            photoName = photoName.replaceAll(' ', '_')
            
            // update photo in location list
            updatePhoto(location, photoName)
        }

    })

    hidePopup()

    return false
}


function updatePhoto(location, photoName) {
    
    
    // select location where photo will be inserted
    const imageElement = location.children[1]
    const locationId = location.children[3].dataset.id
    let markerImage
    try {
        markerImage = document.getElementById(`location-popup-${locationId}`).children[1]
    }
    catch(_) {
        location.click()
        markerImage = document.getElementById(`location-popup-${locationId}`).children[1]
    }
    
    //open popup to make possible to read its content and replace it
    
    
    markerImage.setAttribute('src', `/media/images/${photoName}`)

    if (imageElement.tagName === 'IMG') {
        // if there is an image update source of new image         
        imageElement.setAttribute('src', `/media/images/${photoName}`)
        
    }
    else {
        // remove em tag and append img tag in location list
        imageElement.remove()
        const newImageElement = document.createElement('img')
        newImageElement.setAttribute('src', `/media/images/${photoName}`)
        location.insertBefore(newImageElement, location.children[1])

    }

    //close popup after modifying content
    location.click()
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
    .then(message => console.log(message.message))
    
    //remove location from location list
    activeEditLocationPopup.remove()
    
    //hide popup and reset activeEditDayPopup value 
    hidePopup()
}


function hidePopup() {
    //hide popup
    document.querySelector("#edit-day-div").style.display = "none"
    document.querySelector("#edit-location-div").style.display = "none"
    
    // enable background
    deactivateBackground(false)

    //clear activeEditDayPopup value
    activeEditDayPopup = undefined
    activeEditLocationPopup = undefined
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
    const date = activeEditDayPopup.children[0].innerHTML
    // initiate variables that will be returned by next function
    let popup, cancelButton, deleteButton

    // create popup that asks for confirmation and return elements to interact 
    [popup, cancelButton, deleteButton] = createConfirmationPopup(date)

    deleteButton.onclick = function() {
        fetch('/delete-day', {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                day_id: dayId,
            })
        })
        .then(response => response.json())
        .then(message => console.log(message.message))
        .then( () => {
            //remove delete day div
            activeEditDayPopup.remove()
    
            //remove confirmation popup 
            popup.remove()
            
            //hide edit day popup and reset activeEditDayPopup value 
            hidePopup()
        })
    }
    
    cancelButton.onclick = function() {
        popup.remove()
    }
}


// show add location form for each day
function ActivateAddLocationButtons () {
    const buttons = document.querySelectorAll('.add-location')
    buttons.forEach( button => {
        
        button.onclick = function() {
            const newLocationForm = document.getElementById('new-location-form')
            const addLocationDay = document.getElementById('id_new_location_day')
            if (button.innerHTML === 'Hide') {
                hideNewLocationForm(button.dataset.id)
                // newLocationForm.style.display = 'none'
                addLocationStatus = false
                addLocationDay.value = undefined
                // button.innerHTML = 'Add Location'
            }
            else {
                // reset all add location buttons
                buttons.forEach( b => {
                    b.innerHTML = 'Add Location'
                })
                // reset form
                newLocationForm.reset()
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
    
}


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
    .then( res => {
        hideNewLocationForm(formData.get('new_location_day'))
        createLocationItem(formData, res.new_location_id)
        mainMarker.hidePopup
        console.log(res.message)
    })

    return false
}


function hideNewLocationForm(dayId) {
    const newLocationForm = document.getElementById('new-location-form')
    
    // hide form
    newLocationForm.style.display = 'none'
    
    // reset input fields
    newLocationForm.reset()

    // change button innerHTML
    document.getElementById(`location-list-${dayId}`).children[0].innerHTML = 'Add Location'
}


function loadMarkers() {
    const markersData = JSON.parse(document.getElementById('markers-data').textContent)
    markersData.forEach( day => {
        let locations = day.locations
        locations.forEach( location => {
            
            let marker = L.marker([location.fields.lat, location.fields.lng], {alt: `marker-id-${location.pk}`}).addTo(map)
            var popupContent = createPopupContent(location)
            marker.bindPopup(popupContent)
            
        
        })
    })
}


function addMarker(lat, lng, locationData) {
    let marker = L.marker([lat, lng], {alt: `marker-id-${locationData.fields.pk}`}).addTo(map)
    let popupContent = createPopupContent(locationData)
    marker.bindPopup(popupContent)
    marker.openPopup()
}


function createPopupContent({fields: {name, description, photo,}, pk}) {
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
    
    // add classes and attributes
    popupContent.classList.add('location-popup')
    popupContent.setAttribute('id', `location-popup-${pk}`)

    // bind all elements 
    popupContent.appendChild(popupName)
    popupContent.appendChild(popupImg)
    
    return popupContent
}


function createLocationItem(formData, newLocationId) {

    // new location data 
    const name = formData.get('new_location_name')
    const description = formData.get('new_location_description')
    const photo = formData.get('new_location_img')
    let photoName = photo.name

    // convert photo name
    photoName = photoName.replaceAll(' ', '_')

    // create new elements
    const locationDiv = document.createElement('div')
    const locationName = document.createElement('strong')
    const LocationDescription = document.createElement('span')
    const locationEditButton = document.createElement('button')
    let locationPhoto = undefined

    if (photo.size !== 0) {
        locationPhoto = document.createElement('img')
        locationPhoto.setAttribute('src', `/media/images/${photoName}`)
        locationPhoto.setAttribute('alt', 'location image')

    }
    else {
        locationPhoto = document.createElement('em')
        locationPhoto.innerHTML = 'no image yet'
    }

    // append necessary classes
    locationDiv.classList.add('location-item', 'location')
    locationEditButton.classList.add('edit')

    // add attributes 
    locationEditButton.setAttribute('type', 'button')
    locationEditButton.setAttribute('data-id', `${newLocationId}`)
    locationDiv.setAttribute('id', `location-${newLocationId}`)
    
    // fill elements with new content
    locationName.innerHTML = name
    LocationDescription.innerHTML = description
    locationEditButton.innerHTML = 'Edit location'

    // combine all elements to one 
    locationDiv.append(locationName, locationPhoto, LocationDescription, locationEditButton)

    // select day and append new location div
    const dayId = formData.get('new_location_day')
    const dayDiv = document.getElementById(`location-list-${dayId}`)
    dayDiv.append(locationDiv)

    // add action to new edit location button 
    locationEditButton.onclick = function() {
        
        // update location id in form 
        document.getElementById('id_edit_location_id').value = this.dataset.id
        
        showEditLocationForm(locationDiv)
    }

    // create new marker
    let lat = formData.get('new_location_lat')
    let lng = formData.get('new_location_lng')
    let locationData = {fields: {
        'name': name,
        'description': description,
        'photo': `images/${photoName}`,
        'pk': newLocationId,
    }}
    
    addMarker(lat, lng, locationData)
    
    // add events to new location div
    locationActions(locationDiv)
    
    return 0
}


// add events to existing locations and markers send by server
function dynamicPopupSelector() {
    const locations = document.querySelectorAll('.location')
    locations.forEach(location => {
        locationActions(location)
    })
}


function locationActions (location) {

    const locationId = location.children[3].dataset.id
    const marker = document.querySelector(`img[alt=marker-id-${locationId}]`)
    const markerSrc = marker.src

    location.onclick = function(e) {
        if (e.target.tagName !== 'BUTTON') {
            marker.click()
        }
    }

    location.onmouseover = function() {
        marker.src = '/static/adventure/img/red-marker.png'
        location.style = 'background-color: rgb(220, 211, 184, 0.3)'

    }

    location.onmouseout = function() {
        marker.src = markerSrc
        location.style = 'background-color: white'
    }

    marker.onmouseover = function() {
        location.style = 'background-color: rgb(220, 211, 184, 0.3)'
    }

    marker.onmouseout = function() {
        location.style = 'background-color: white'
    }
}