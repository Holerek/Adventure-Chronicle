import {getCookie} from "./util.js";


//
var activeEditDayPopup = undefined;


document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-day-form').style.display = 'none';
    document.getElementById('show-add-day-form').onclick = showAddDayForm;
    document.getElementById("edit-day-cancel").onclick = hidePopup;
    document.getElementById("edit-day-delete").onclick = deleteDay;
    
    // activate show more arrows
    showMore();

    
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
            const popup = document.querySelector('.popup');
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
            
            //disable day list
            const dayList = document.querySelector(".adv-contener");
            dayList.style.opacity = 0.5;
            dayList.style.pointerEvents = "none";
            
            //disable map
            const mapView = document.querySelector("#map");
            mapView.style.opacity = 0.5;
            mapView.style.pointerEvents = "none";

            
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


function hidePopup() {
    //hide popup
    document.querySelector(".popup").style.display = "none";
    
    //enable day list
    const dayList = document.querySelector(".adv-contener");
    dayList.style.opacity = 1;
    dayList.style.pointerEvents = "auto";
    
    //enable map
    const mapView = document.querySelector("#map");
    mapView.style.opacity = 1;
    mapView.style.pointerEvents = "auto";

    //clear activeEditDayPopup value
    activeEditDayPopup = undefined;
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