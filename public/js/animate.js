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

		config.res = parseInt(document.getElementById("resSelect").value); //resolution
		config.bit = parseInt(document.getElementById("bitSelect").value); //bitrate

		//check config



		if(config.res == -1){
			socket.emit("stream", false );
			webConsole.logError("Please choose a legal resolution");
			return false;
		}

		if(config.res == -1){
			socket.emit("stream", false );
			webConsole.logError("Please choose a legal bitrate");
			return false;
		}



		config.action = streamBtn.attributes.action.value;
 
		socket.emit("stream", config );

		streamBtn.innerHTML = "Requesting";

		animate.leds.turn(animate.leds.stream,"pending");

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

		var action = previewBtn.attributes.action.value + "Preview";

		socket.emit("info", action );

		previewBtn.innerHTML = "Requesting";

		animate.leds.turn(animate.leds.preview,"pending");

	});


	var instructionToggleBtn = document.getElementById("instructToggle")
	instructionToggleBtn.addEventListener("click",function(){
		console.log("hey");
		animate.instructionToggle();
	});


	var conLed = document.getElementById("conLed");
	var strLed = document.getElementById("strLed");
	var preLed = document.getElementById("preLed");

	animate.leds = {
		connection: conLed,
		stream: strLed,
		preview: preLed,
	}

	animate.leds.turn = function(led, status){
		if(status == "on"){
			led.className = "led";
			led.style.backgroundColor = "#3F4";
		}
		else if(status == "pending"){
			led.className = "led ledPending";
		}
		else if(status == "off"){
			led.className = "led";
			led.style.backgroundColor = "#555";
		}

	}

	animate.initSlideInput();

	webConsole.init();
	animate.initClipBoard();
}

animate.addShortCut = function(type, ip){

	var newShortCut = document.createElement("li");
	newShortCut.className = "shortCutBtn";

	var config = null;


	if(type == "rtmp"){
		config = "/live/insta360";
	}
	else if(type == "rtsp"){
		config = ":8554/preview";
	}

	newShortCut.setAttribute("data-clipboard-text", (type + "://" + ip + config));

	newShortCut.innerHTML = '<span>' + newShortCut.attributes["data-clipboard-text"].value + '</span>';

	newShortCut.innerHTML += "<br/>Click to copy the URL and launch the streamware.";

	webConsole.logBox.append(newShortCut);


	newShortCut.addEventListener("click", function(e){

		//console.log(newShortCut.attributes.data-clipboard-text.value);

		socket.emit("streamwire", true);

	})

}

animate.initSlideInput = function(){


	var slideList = document.getElementsByClassName("slide");

	for(i = 0; i < slideList.length; i++){
		slideList[i].addEventListener("input",function(e){
			//console.log(e.target.id);

			var config = {
				property : e.target.id,
				value : e.target.value
			}

			var currentSliderDisplay = document.getElementById(e.target.id + "Dis");
			currentSliderDisplay.innerHTML = e.target.value;

			socket.emit("camSetting", config);
		});
	}

	animate.resetCamSetting = function(){

			var resetMsg = [{
								property : "EV",
							 	value : 1.0
							 },
							 {
							 	property : "brightness",
							 	value : 128
							 },
							 {
							 	property : "saturation",
							 	value : 128
							 },
							 {
							 	property : "contrast",
							 	value : 128
							 },
							 {
							 	property : "sharpness",
							 	value : 128
							 }
							];

			for( i = 0; i < resetMsg.length; i++ ){

				var currentConfig = resetMsg[i];
				var currentSlider = document.getElementById(resetMsg[i].property);
				currentSlider.value = resetMsg[i].value;

				var currentSliderDisplay = document.getElementById(resetMsg[i].property + "Dis");
				currentSliderDisplay.innerHTML = resetMsg[i].value;

				socket.emit("camSetting", resetMsg[i]);

			}


			webConsole.logMsg("Camera setting reset emit");
			
	}

	var resetCamSettingBtn = document.getElementById("resetCamSetting");

	resetCamSettingBtn.addEventListener("click", function(){
		animate.resetCamSetting();
	});

}

animate.initClipBoard = function(){

	var clipboard = new Clipboard('.shortCutBtn');

	clipboard.on('success', function(e) {
		//console.info('Action:', e.action);
		console.info('success Copied Text:', e.text);
		//console.info('Trigger:', e.trigger);
		e.clearSelection();
	});

	clipboard.on('error', function(e) {
		console.error('Action:', e.action);
		console.error('Trigger:', e.trigger);
	});

}

animate.instructOn = false;

animate.instructionToggle = function(){

	var instruct = document.getElementById("streamInstruction");

	if(animate.instructOn){
		instruct.style.display = "none";
		animate.instructOn = false;
	}
	else{
		instruct.style.display = "block";
		animate.instructOn = true;
	}
}

animate.updateBattery = function( batteryVal, charging ){

	var batteryValShow = document.getElementById("batteryVal");
	var batteryInfo = document.getElementById("batteryInfo");

	batteryValShow.style.width = batteryVal + "px";

	if(charging === true){
		batteryInfo.innerHTML = batteryVal + "% " + "<span style = 'color : #00FFBB;'>Charging</span>";
	}
	else{
		batteryInfo.innerHTML = batteryVal + "% " + Math.floor(70 * (batteryVal/100)) + " min";
	}

}


webConsole = {};

webConsole.init = function(){

	webConsole.logBox = document.getElementById("logBox");

}

webConsole.logConnection = function(status){

	webConsole.logMsg ("TCP Connection " + status);

}

webConsole.logSucsses = function(msg){
	webConsole.logMsg(msg, "sucLog");
}

webConsole.logError = function(err){

	var newErrorMSG = document.createElement("li");
	newErrorMSG.className = "errLog";
	newErrorMSG.innerHTML = err;

	webConsole.logBox.append(newErrorMSG);

	webConsole.logBox.scrollTop = webConsole.logBox.scrollHeight;

}

webConsole.logMsg = function(msg, option){

	var newMSG = document.createElement("li");
	newMSG.className = "msgLog";
	newMSG.innerHTML = msg;

	if(option){
		newMSG.className = option;
	}

	webConsole.logBox.append(newMSG);

	webConsole.logBox.scrollTop = webConsole.logBox.scrollHeight;

}

instaCache = {
	ipAddress: "192.168.77.1",
};
