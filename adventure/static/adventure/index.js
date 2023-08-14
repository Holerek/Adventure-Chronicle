import { getCookie } from "./util.js";

document.addEventListener('DOMContentLoaded', () => {
    
    const button = document.querySelector('#newAdventureButton');
    button.onclick = () => {
        const div = document.querySelector('#newAdventure');
        div.style.display = "block";
        button.style.display = "none";
    }

    const adventures = document.querySelectorAll('.adventure-item')
    adventures.forEach( adv => {
        const children = adv.children;
        const titleDiv = children[0];
        const deleteImg = children[1];
        const advId = adv.dataset.id;

        //click to open adventure site
        titleDiv.onclick = function() {
            window.location.href = "/adventure/" + advId;
        }

        //delete adventure
        deleteImg.onclick = function() {
            fetch('/delete-adventure', {
                method: 'POST',
                headers: {'X-CSRFToken': getCookie('csrftoken')},
                mode: 'same-origin',
                body: JSON.stringify({
                    adv_id: advId,
                })
            })
            .then(response => response.json())
            .then(path => {
                window.location.href = path.path;
            });
        }
    })
})