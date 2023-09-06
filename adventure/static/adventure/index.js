import { getCookie, deactivateBackground, createConfirmationPopup } from "./util.js"

document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelector('#newAdventureButton').onclick = showAddAdventureForm
    
    //activate delete icons
    activateAdventureActions()
})


function activateAdventureActions() {
    const adventures = document.querySelectorAll('.adventure-item')
    adventures.forEach( adv => {
        const children = adv.children
        const deleteImg = children[1]
        const advId = adv.dataset.id
        const advTitle = children[0]
    
        //click to open adventure site
        adv.onclick = function(e) {
            if (e.target.tagName !== 'IMG') {
                window.location.href = "/adventure/" + advId
            }
        }
    
        //delete adventure
        deleteImg.onclick = function() {
            confirmAdventureDeletion(adv, advId, advTitle)
        }
    })
}


function confirmAdventureDeletion(adv, advId, advTitle) {
    // initiate variables that will be returned by next function
    let popup, cancelButton, deleteButton

    // create popup that asks for confirmation and return elements to interact 
    [popup, cancelButton, deleteButton] = createConfirmationPopup(advTitle.innerHTML)
    
    deactivateBackground(true)

    deleteButton.onclick = function() {
        deleteAdventure(adv, advId)
        popup.remove()
        deactivateBackground(false)
    }
    
    cancelButton.onclick = function() {
        popup.remove()
        deactivateBackground(false)
    }
}


function deleteAdventure(adv, advId) {
    fetch('/create-adventure', {
        method: 'DELETE',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            adv_id: advId,
        })
    })
    .then(response => response.json())
    .then(message => {
        console.log(message)
        adv.remove()
    })
}


function showAddAdventureForm() {
    const form = document.querySelector("#newAdventure")
    const button = document.getElementById("newAdventureButton")

    if (form.style.display == "none") {
        form.style.display = "block"
        button.innerHTML = "Hide"
    } else {
        form.style.display = "none"
        button.innerHTML = "New Adventure"
    }
}
