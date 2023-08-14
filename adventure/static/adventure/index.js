document.addEventListener('DOMContentLoaded', () => {
    
    const button = document.querySelector('#newAdventureButton');
    button.onclick = () => {
        const div = document.querySelector('#newAdventure');
        div.style.display = "block";
        button.style.display = "none";
    }

    const adventures = document.querySelectorAll('.adventure-item')
    adventures.forEach( adv => {
        adv.onclick = function() {
            window.location.href = "/adventure/" + adv.dataset.id;
        }
    })
})