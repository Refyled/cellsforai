// la partie sidebar

console.log('sidebar working');
/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("showWeights").checked = showWeight;
    document.getElementById("transparency").checked = transparency;

    document.getElementById("gridSize").value = roomSettings.size;
    document.getElementById("numberOfPlayers").value = roomSettings.numberOfPlayers;
    document.getElementById("intialweights").value = roomSettings.weight;
    document.getElementById("numberOfVitamins").value = roomSettings.numberOfVitamins;
    document.getElementById("timer").value = roomSettings.timer;

}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
} 

function changeShowWeights(){
    showWeight = document.getElementById("showWeights").checked;
    console.log('showWeight : ' + showWeight);

}

function changeTransparency(){
    transparency = document.getElementById("transparency").checked;
    console.log('transparency : ' + transparency);
    if (transparency == false){
        maxG =1;
        minG=1;
    }
    if (transparency == true){
        maxG=initMaxG;
        minG=initMinG;
    }

}

let tempRoomSet = {}
function fire(){

    tempRoomSet.size =document.getElementById("gridSize").value;
    tempRoomSet.numberOfPlayers =document.getElementById("numberOfPlayers").value;
    tempRoomSet.weight =document.getElementById("intialweights").value;
    tempRoomSet.numberOfVitamins =document.getElementById("numberOfVitamins").value;
    tempRoomSet.timer =document.getElementById("timer").value;
    playing = false;
    dataArray = [];
    socket.emit('new', tempRoomSet);

}