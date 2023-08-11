console.log('Sanity check from room.js');

const roomName = JSON.parse(document.getElementById('roomName').textContent);

let chatLog = document.querySelector('#chatLog');
let chatMessageInput = document.querySelector('#chatMessageInput');
let chatMessageSend = document.querySelector('#chatMessageSend');
let onlineUsersSelector = document.querySelector('#onlineUsersSelector');
let chatSocket =  null;

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

//change text input prompt on private message
onlineUsersSelector.onchange = function(){
    chatMessageInput.value = "/pm " + onlineUsersSelector.value + " ";
    onlineUsersSelector.value = null;
    chatMessageInput.focus();
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
    //Forward the Message to websocket
    chatSocket.send(JSON.stringify({
        "message" : chatMessageInput.value //send the chat message present in the send msg box to the websocket send method
    }))
   
    chatMessageInput.value = '';
}

//connect method
function connect(){
    chatSocket =  new WebSocket("ws://" + window.location.host + "/ws/chat/" + roomName + "/");

    chatSocket.onopen = function(e) {
        console.log("Successfully connected to the websocket ....");
    }

    chatSocket.onclose = function(e) {
        console.log("WebSocket connection closed unexpectedly. Trying to reconnect in 2s ...");
        setTimeout(function(){
            console.log("Reconnecting ...");
            connect(); //call the connect method for websocket
        }, 2000);
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data); //get the data from the message
        console.log(data);

        switch (data.type){ //as per message type
            case "chat_message" : 
                // setTimeout(function() {
                //     chatLog.value += data.message + "\n";
                //     chatLog.scrollTop = chatLog.scrollHeight;
                //     }, 100);               
                chatLog.value +=  data.user + ": " +data.message + "\n"; //add data to the message box screen
                console.log(chatLog)
                break;
            case "user_list":
                for (let i=0; i < data.users.length; i++){
                    onlineUsersSelectorAdd(data.users[i]);
                }
                break;
            case "user_join":
                chatLog.value += data.user + " joined the room.\n"
                onlineUsersSelectorAdd(data.user);
                break;
            case "user_join":
                chatLog.value += data.user + " left the room.\n"
                onlineUsersSelectorRemove(data.user);
                break;
            case "private_message":
                chatLog.value += "PM from " + data.user + ": " + data.message + "\n";
                break;
            case "private_message_delivered":
                chatLog.value += "PM to " + data.target + ": " + data.message + "\n";
                break;
            default:
                console.error("Unknown message type!");
                break;
        }
    // console.log(chatLog)
    //scroll the message box on top
    chatLog.scrollTop = chatLog.scrollHeight;
    };


    chatSocket.onerror = function(err) { //on getting error for message
        console.log("WebSocket encountered an error: " + err.message);
        console.log("Closing the socket.");
        chatSocket.close();
    }

} //connect method ends

connect(); //call the connect method