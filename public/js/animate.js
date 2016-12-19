animate = {};

animate.init = function(){

	var connectBtn = document.getElementById("startConn");
	connectBtn.addEventListener("click",function(){

		var inputIp = document.getElementById("cameraIP").value;

		socket.emit(connectBtn.attributes.action.value, inputIp );
	});


	var streamBtn = document.getElementById("startStream");
	streamBtn.addEventListener("click",function(){

		var config = {};

		config.action = streamBtn.attributes.action.value;
 
		socket.emit("stream", config );

		streamBtn.innerHTML = "Requesting";

	});

	var listFileBtn = document.getElementById("lsFile");
	listFileBtn.addEventListener("click",function(){

		socket.emit("info", "lsFile" );

	});

	var camInfoBtn = document.getElementById("camInfo");
	camInfo.addEventListener("click",function(){

		socket.emit("info", "camInfo" );

	});

	var previewBtn = document.getElementById("startPreview");
	previewBtn.addEventListener("click",function(){

		socket.emit("info", "startPreview" );

		previewBtn.innerHTML = "Requesting";

	});


	webConsole.init();
}


webConsole = {};

webConsole.init = function(){

	webConsole.logBox = document.getElementById("logBox");

}

webConsole.logConnection = function(status){

	webConsole.logMsg ("Connection " + status);

}

webConsole.logError = function(err){

	var newErrorMSG = document.createElement("li");
	newErrorMSG.className = "errLog";
	newErrorMSG.innerHTML = err;

	webConsole.logBox.append(newErrorMSG);

	webConsole.logBox.scrollTop = webConsole.logBox.scrollHeight;

}

webConsole.logMsg = function(msg){

	var newErrorMSG = document.createElement("li");
	newErrorMSG.className = "msgLog";
	newErrorMSG.innerHTML = msg;

	webConsole.logBox.append(newErrorMSG);

	webConsole.logBox.scrollTop = webConsole.logBox.scrollHeight;

}