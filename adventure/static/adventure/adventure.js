import {getCookie} from "./util.js";


//
var activeEditDayPopup = undefined;
var activeEditLocationPopup = undefined;


document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-day-form').style.display = 'none';
    document.getElementById('show-add-day-form').onclick = showAddDayForm;
    document.getElementById("edit-day-cancel").onclick = hidePopup;
    document.getElementById("edit-location-cancel").onclick = hidePopup;
    document.getElementById("edit-day-delete").onclick = deleteDay;
    document.getElementById("edit-location-delete").onclick = deleteLocation;
    
    // activate show more arrows
    showMore();
    activateEditLocationButtons()
    
    const divs = document.querySelectorAll('.adv-item');
    
    divs.forEach(div => {
        const children = div.children;
        const editButton = children[2];
        const date = children[0];
        const description = children[1];
        // const text = description.innerHTML;

        

        editButton.onclick = function() {
            //update activeEditDayPopup value 
            activeEditDayPopup = div;

            //show popup
            const popup = document.querySelector('#edit-day-div');
            popup.style.display = 'block';

            //select edit day input fields
            const editDayForm = document.querySelector("#edit-form")
            const popupChilds = editDayForm.children;
            const editDate = popupChilds[3];
            const editDescription = popupChilds[5];

            //prefill input fields with present data
            editDate.value = date.innerHTML;
            editDescription.value = description.innerHTML;
            document.querySelector("#day_id").value = editButton.dataset.id
            
            deactivateBackground(true)
        }
    })
})


function showAddDayForm() {
    const form = document.querySelector("#add-day-form");
    const button = document.getElementById("show-add-day-form");

    if (form.style.display == "none") {
        form.style.display = "flex";
        button.innerHTML = "Hide";
    } else {
        form.style.display = "none";
        button.innerHTML = "Add Day";
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
    
    // formData.append('file', imageField.files[0]);

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
    const locationId = document.getElementById('id_edit_location_id');
    
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
    activeEditLocationPopup.remove();
    
    //hide popup and reset activeEditDayPopup value 
    hidePopup();
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
    const dayList = document.querySelector(".adv-contener");
    const mapView = document.querySelector("#map");
    
    if (state) {
        //disable day list
        dayList.style.opacity = 0.5;
        dayList.style.pointerEvents = "none";
        
        //disable map
        mapView.style.opacity = 0.5;
        mapView.style.pointerEvents = "none";
    }
    else {
        //enable day list
        dayList.style.opacity = 1;
        dayList.style.pointerEvents = "auto";

        //enable map
        mapView.style.opacity = 1;
        mapView.style.pointerEvents = "auto";
    }
}


function showMore() {
    const showMoreArrows = document.querySelectorAll('.show-more');

    showMoreArrows.forEach( arrow => {

        const parent = arrow.parentElement;
        const parentChildren = parent.children;
            
        const locationList = parentChildren[4];
        locationList.style.display = "none";

        arrow.onclick = function() {

            if (locationList.style.display === "none") {
                locationList.style.display = "flex";
                arrow.classList.add('arrow-up')
            }
            else {
                locationList.style.display = "none";
                arrow.classList.remove('arrow-up')
            }
        }
    })
}


function deleteDay() {
    const dayId = document.getElementById('day_id').value;
    
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
    activeEditDayPopup.remove();
    
    //hide popup and reset activeEditDayPopup value 
    hidePopup();
}