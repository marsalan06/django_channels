console.log("Sanity check from index.js");

//focus the roomInput when user opens the page
document.querySelector("#roomInput").focus();

//submit if the user presses the enter key
document.querySelector('#roomInput').onkeyup = function(e) {
    if (e.keyCode === 13){
        document.querySelector('#roomConnect').click();
    }
}

//redirect to /room/<roomInput>/

document.querySelector('#roomConnect').onclick =  function() {
    let roomName = document.querySelector('#roomInput').value;
    window.location.pathname = "chat/" + roomName + "/";
}

document.querySelector('#roomSelect').onchange = function() {
    let roomName = document.querySelector('#roomSelect').value.split(' (')[0];
    window.location.pathname = "chat/" + roomName + "/";
}

