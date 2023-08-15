import {getCookie} from "./util.js";


document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-day-form').style.display = 'none';
    document.getElementById('show-add-day-form').onclick = showAddDayForm;
    document.getElementById("edit-day-cancel").onclick = hidePopup;


    const divs = document.querySelectorAll('.adv-item');
    
    divs.forEach(div => {
        const childs = div.children;
        const editButton = childs[2];
        const date = childs[0];
        const description = childs[1];
        // const text = description.innerHTML;

        editButton.onclick = function() {

            //show popup
            const popup = document.querySelector('.popup');
            popup.style.display = 'block';

            //selext edit day input fields
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

            



            //     fetch('/edit-day', {
            //         method: "POST",
            //         headers: {'X-CSRFToken': getCookie('csrftoken')},
            //         mode: 'same-origin',
            //         body: JSON.stringify({
            //             date: newDate,
            //             description: newDescription,
            //             id: editButton.dataset.id,
            //         })
            //     })
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
}