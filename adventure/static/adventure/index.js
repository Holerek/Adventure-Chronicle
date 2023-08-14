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
        const title = children[0];
        const deleteImg = children[1];

        //click to open adventure site
        title.onclick = function() {
            window.location.href = "/adventure/" + adv.dataset.id;
        }

        deleteImg.onclick = function() {
            console.log('test ikonki');
        }
    })
})