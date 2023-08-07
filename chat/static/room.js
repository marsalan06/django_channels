console.log('Sanity check from room.js');

const roomName = JSON.parse(document.getElementById('roomName').textContent);

let chatLog = document.querySelector('#chatlog');
let chatMessageInput = document.querySelector('#chatMessageInput');
let chatMessageSend = document.querySelector('#chatMessageSend');
let onlineUsersSelector = document.querySelector('#onlineUsersSelector');

//add a new option to 'onlineUsersSelector'
function onlineUsersSelectorAdd(value){
    if (document.querySelector("option[value='"+value+"']")) return;
    let newOption = document.createElement("option");
    newOption.value = value
    newOption.innerHTML = value
    onlineUsersSelector.appendChild(newOption);
}

//remove an option from 'onlineusersselector'

function onlineUsersSelectorRemove(value){
    let oldOption = document.querySelector("option[value='"+value+"']");
    if (oldOption !== null ) oldOption.remove();
}

//focus 'chatMessageInput' when user opens the page
chatMessageInput.focus();

//submit if the user presses the enter key
chatMessageInput.onkeyup = function(e) {
    if (e.keyCode === 13) {
        chatMessageSend.click();
    }
}

chatMessageSend.onclick = function() {
    if (chatMessageInput.value.length === 0) return;
    //TODO: Forward the Message to websocket
   
    chatMessageInput.value = '';
}