import {getCookie} from "./util.js";


document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-day-form').style.display = 'none';
    document.getElementById('show-add-day-form').onclick = showAddDayForm;
    
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

            //prefill input field
            const editDayForm = document.querySelector("#edit-form")
            const popupChilds = editDayForm.children;
            const editDate = popupChilds[3];
            const editDescription = popupChilds[5];

            editDate.value = date.innerHTML;
            editDescription.value = description.innerHTML;
            document.querySelector("#day_id").value = editButton.dataset.id
            
            
            
            popup.style.display = 'block';

            //...
            const background = document.querySelector(".adv-contener");
            background.style.opacity = 0.5;
            background.style.pointerEvents = "none";













            // const dateInput = document.createElement('input');
            // const textArea = document.createElement('textarea');
            // const saveButton = document.createElement('button');
            
            // saveButton.innerHTML = 'Save';
            // saveButton.classList.add('add');
            // textArea.value = text;
            // dateInput.value = date.innerHTML;
            

            // date.style.display = "none";
            // description.style.display = "none";
            // editButton.style.display = "none";
            
            // div.appendChild(dateInput);
            // div.appendChild(textArea);
            // div.appendChild(saveButton);
            

            //save button action to fetch data to server and show default view of day div
            // saveButton.onclick = () => {
            //     const newDate = dateInput.value;
            //     const newDescription = textArea.value
                
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
                
            //     console.log(newDate);
            //     console.log(newDescription);
            // }
        }
    })
})

function showAddDayForm() {
    const form = document.querySelector("#add-day-form");
    const button = document.getElementById("show-add-day-form");
    console.log(form.style.display);
    // form.style.display = 'flex';
    

    if (form.style.display == "none") {
        form.style.display = "flex";
        button.innerHTML = "Hide";
    } else {
        form.style.display = "none";
        button.innerHTML = "Add Day";
    }
}