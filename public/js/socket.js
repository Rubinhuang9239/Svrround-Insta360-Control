var socket = null;

socket = io();

var socketPromiss = function checkSocket(){
		setTimeout(function(){
			if(!socket.id) {
				checkSocket();
			}
			else{
				webConsole.logMsg("Interface Web Socket ready!");
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
			animate.leds.turn(animate.leds.stream,"off");
		}

		if(previewBtn.innerHTML == "Requesting"){
			previewBtn.innerHTML = "Start Preview";
			animate.leds.turn(animate.leds.preview,"off");
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
		animate.leds.turn(animate.leds.connection,"on");
	}else if(connection === false){
		connectBtn.innerHTML = "Connect";
		connectBtn.attributes.action.value = "newTcpConn";
		webConsole.logConnection("Closed");
		animate.leds.turn(animate.leds.connection,"off");
	}
});

socket.on("tcpIp", function(ipAddress){
	instaCache.ipAddress = ipAddress;
	webConsole.logMsg("Current Camera IP Address <br/>" + ipAddress);
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
		webConsole.logConnection("Stream stop emit");
		animate.leds.turn(animate.leds.stream,"off");
	}
});


socket.on("preview",function(preview){

	var previewBtn = document.getElementById("startPreview");

	if(preview === true){
		previewBtn.innerHTML = "Stop Preview";
		previewBtn.attributes.action.value = "stop";
		webConsole.logConnection("Preview start emit");
	}else if(preview === false){
		previewBtn.innerHTML = "Start Preview";
		previewBtn.attributes.action.value = "start";
		webConsole.logConnection("Preview stop emit");
		animate.leds.turn(animate.leds.preview,"off");
	}
});

socket.on("info",function(info){


	info = info.split("\n");

	for(i = 0; i < info.length - 1; i++){

		var parseInfo = JSON.parse(info[i]);

		//console.log(parseInfo);

		if(parseInfo.type == "fileList"){


			var fileList = parseInfo.data.fileList;

			var fileSysBox = document.getElementById("fileSys");

			fileSysBox.innerHTML = "";

			for(i = 0; i < fileList.length; i++){
				var currentFile = fileList[i];
				//console.log(currentFile);
				webConsole.logMsg( currentFile.name + " [size: " + currentFile.size + "]" );

				if ( currentFile.name.indexOf(".insv") >= 0 || currentFile.name.indexOf(".insp") >=0 ){

					var newFileBox = document.createElement("div");
					newFileBox.innerHTML = "<p>" + currentFile.name + "<br />Size: " + Math.round(currentFile.size * 10 / 1048576) /10 + "M" 
										  +"<span> <a target='_blank' href='http://" + instaCache.ipAddress + ":8000/" + currentFile.name + "'>Download</a></span>"
									      +"</p>"

					if ( currentFile.name.indexOf(".insp") >= 0 ){
						newFileBox.innerHTML += "<img src = 'http://" + instaCache.ipAddress + ":8000/" + currentFile.name + "' />";
					}
					else if( currentFile.name.indexOf(".insv") >= 0 ){
						newFileBox.innerHTML += "<img src = 'img/360video.jpg' />";
					}


					fileSysBox.append(newFileBox);
				}

			}
		}

		else if(parseInfo.type == "prepareOK"){

			if(parseInfo.data.mode == 3){
				animate.addShortCut("rtmp", instaCache.ipAddress);
				webConsole.logSucsses("ready to view RTMP STREAM in OBS!");
				animate.leds.turn(animate.leds.stream,"on");
			}
			else if(parseInfo.data.mode == 9){
				animate.addShortCut("rtsp", instaCache.ipAddress);
				webConsole.logSucsses("ready to view RTSP PREVIEW in OBS!");
				animate.leds.turn(animate.leds.preview,"on");
			}

			
		}
		
		else if(parseInfo.type == "state"){
			
			animate.updateBattery( parseInfo.data.battery, parseInfo.data.onCharge);
			
		}


	}


});