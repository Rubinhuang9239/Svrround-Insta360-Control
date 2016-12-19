var socket = null;

socket = io();

var socketPromiss = function checkSocket(){
		setTimeout(function(){
			if(!socket.id) {
				checkSocket();
			}
			else{
				console.log(socket.id);
			}
		},10);
}

socketPromiss();

socket.on("err",function(err){
	console.log(err);
	webConsole.logError(err);

	if(err == "TCP socket not established yet!" || err == "TCP socket not connected yet!" ){
		var streamBtn = document.getElementById("startStream");
		var previewBtn = document.getElementById("startPreview");


		if(streamBtn.innerHTML == "Requesting"){
			streamBtn.innerHTML = "Start Stream";
		}

		if(previewBtn.innerHTML == "Requesting"){
			previewBtn.innerHTML = "Start Preview";
		}
	}


});

socket.on("msg",function(msg){
	console.log(msg);
	webConsole.logMsg(msg);
});

socket.on("tcpConn",function(connection){

	var connectBtn = document.getElementById("startConn");

	if(connection === true){
		connectBtn.innerHTML = "Disconnect";
		connectBtn.attributes.action.value = "disTcpConn";
		webConsole.logConnection("Opened");
	}else if(connection === false){
		connectBtn.innerHTML = "Connect";
		connectBtn.attributes.action.value = "newTcpConn";
		webConsole.logConnection("Closed")
	}
});

socket.on("tcpStream",function(stream){

	var streamBtn = document.getElementById("startStream");

	if(stream === true){
		streamBtn.innerHTML = "Stop Stream";
		streamBtn.attributes.action.value = "stop";
		webConsole.logConnection("Stream start emit");
	}else if(stream === false){
		streamBtn.innerHTML = "Start Stream";
		streamBtn.attributes.action.value = "start";
		webConsole.logConnection("Stream stop emit")
	}
});


socket.on("preview",function(preview){

	var previewBtn = document.getElementById("startPreview");

	if(preview === true){
		previewBtn.innerHTML = "Stop Preview";
		previewBtn.attributes.action.value = "stop";
		webConsole.logConnection("Preview start emit");
	}else if(stream === false){
		previewBtn.innerHTML = "Start Preview";
		previewBtn.attributes.action.value = "start";
		webConsole.logConnection("Preview stop emit")
	}
});