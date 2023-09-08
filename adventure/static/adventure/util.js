export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


export function deactivateBackground(state) {
    const dayList = document.querySelector(".adv-container")
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


export function deactivatePopup(state, elementId) {
    const activePopup = document.getElementById(elementId)

    if (state) {
        //disable popup
        activePopup.style.opacity = 0.5
        activePopup.style.pointerEvents = "none"
    }
    else {
        //enable popup
        activePopup.style.opacity = 1
        activePopup.style.pointerEvents = "auto"
    }
}


export function createConfirmationPopup(elementTitle) {
    //create popup elements
    const popup = document.createElement('div')
    const message = document.createElement('p')
    const cancelButton = document.createElement('button') 
    const deleteButton = document.createElement('button') 

    // fill elements
    cancelButton.innerHTML = 'Cancel'
    deleteButton.innerHTML = 'Delete'
    message.innerHTML = `Delete <strong>${elementTitle}</strong>`
    
    // add classes
    popup.classList.add('popup')
    popup.classList.add('adv-form')
    cancelButton.classList.add('cancel')
    deleteButton.classList.add('delete')
    
    // apply necessary styling 
    popup.style.display = 'block'
    popup.style.width = 'auto'
    cancelButton.style.marginRight = '3em'
    message.style.textAlign= 'center'

    // combine all elements together
    popup.append(message, cancelButton, deleteButton)

    // add popup to html body
    document.querySelector('body').append(popup)

    return [popup, cancelButton, deleteButton]
}