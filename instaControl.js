var express = require('express');
var app = express();
var net = require('net');
var open = require('open');

var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function(){
    console.log("");
    console.log("---------------| Hacking |-----------------");
    console.log("");
    console.log("Service server open on:" + 3000);
});

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

//-------------Pretend_I_am_an_Insta360_4K-------------//

var insta = {};

insta.client_role = "iOS";//"liveKit"//null
insta.client = null;
insta.heartTest = null;
insta.tcpConnected = false;
insta.streaming = false;
insta.preview = false;
insta.currentIP = "192.168.77.1";

insta.heartTestClock = setInterval(function(){

					if(insta.tcpConnected && insta.client){
						console.log("heart");
						insta.client.write('{"cmd":"heartTest","data":{}}\n');
					}

				},10000);

function generateConnection(){
	if(!insta.client_role){

		var server = net.createServer(function(socket) {

			console.log("hi I got a client");

			socket.on("data",function(data){

				console.log("-----------------------------");

				console.log(data.toString());

			})

		});

		server.listen(8888, "127.0.0.1");//'192.168.77.1');

	}
	else{

	//-------------Pretend_I_am_the_Config_Software-------------//

	insta.client = new net.Socket();

	insta.client.on('data', function(data) {
		if(data != '{"type":"heartTestResult","code":true}\n'){
			console.log('Received: ' + data);
		}
		

		frontEnd.emit("info", data.toString());
	});

	insta.client.on('error', function(error) {
		console.log(error.message);
		if(frontEnd){
			frontEnd.emit("err", error.message);
		}
		if(error.message == "This socket has been ended by the other party" || error.message == ("connect ECONNREFUSED "+aimIPAddr+":8888")){
				insta.client.destroy();
				insta.tcpConnected = false;
				frontEnd.emit("tcpConn", false);
		}
	});

	insta.client.on('close', function() {
		console.log('TCP Connection closed');
		insta.tcpConnected = false;
		frontEnd.emit("tcpConn", false);
	});


	}
}

//---------socket.ioi------------//
var frontEnd = null;
var aimIPAddr = null;

io.on('connection', function(webSocket){
	frontEnd = webSocket;

	webSocket.emit("tcpConn", insta.tcpConnected);
	// webSocket.emit("preview", insta.tcpConnected);
	// webSocket.emit("tcpStream", insta.tcpConnected);

	console.log(webSocket.id + " connected!");

	webSocket.on("newTcpConn",function(ipaddress){

		console.log("new connection to: " + ipaddress);
		aimIPAddr = ipaddress;

		insta.tcpConnected = false;//use this tcp status to check

		if(insta.client){
			insta.client.destroy();
			clinetConnectTo(ipaddress,webSocket);
		}else{
			console.log("Add new socket");
			generateConnection();
			clinetConnectTo(ipaddress,webSocket);
		}


	});

	webSocket.on("disTcpConn",function(ipaddress){

		
		if(insta.client){

			if(insta.client.destroyed){
				webSocket.emit("err", "Already disconnected!");
				webSocket.emit('tcpConn',false);
				insta.tcpConnected = false;
				return false;
			}

			insta.client.destroy();
			insta.tcpConnected = false;

			console.log("disconnected TCP Socket");


		}else{
			insta.tcpConnected = false;
			webSocket.emit("err", "TCP socket not connected yet!");
		}


	});

	webSocket.on("stream",function(config){

	//Bitrate_Settings//
	//  5: 5242880;
	// 10: 10485760;
	// 15: 15728640;
	// 20: 20971520;
	// 30: 31457280;
	// 4: 4194304
								
	//Takes 5s to set up the rtmp stream
	// client.write('{"data":{"key":"defaultOffset"},"cmd":"queryOffset"}\n');
	// client.write('{"data":{"index":1},"cmd":"queryCamera"}\n');

		if(insta.client){

			if(insta.tcpConnected){
				if(config.action == "start"){
					console.log(config.bit,config.res)
					insta.client.write('{"data":{"bitrate":' + config.bit + ',"width":' + config.res + ',"height":' + config.res + '},"cmd":"startLive"}\n');
					insta.streaming = true;
				}else if(config.action == "stop"){
					insta.client.write('{"data":{},"cmd":"stopLive"}\n');
					insta.streaming = false;
				}

				webSocket.emit('tcpStream',insta.streaming);
			}else{
				webSocket.emit("err", "TCP socket not connected yet!");
			}

		}else{
			webSocket.emit("err", "TCP socket not established yet!");
		}

	});


	webSocket.on("info",function(type){

		if(insta.client){

			if(insta.tcpConnected){

				if(type == "camInfo"){
					insta.client.write('{"cmd":"cameraInfo","data":{}}\n');
				}
				else if(type == "lsFile"){
					insta.client.write('{"cmd":"listFile","data":{}}\n');
				}
				else if(type == "startPreview"){
					insta.client.write('{"cmd":"startPreview","data":{}}\n');
					insta.preview = true;
					//change it later
					webSocket.emit("preview", true);
				}
				else if(type == "stopPreview"){
					insta.client.write('{"cmd":"stopPreview","data":{}}\n');
					insta.preview = false;
					//change it later
					webSocket.emit("preview", false);
				}
				
			}else{
				webSocket.emit("err", "TCP socket not connected yet!");
			}

		}else{
			webSocket.emit("err", "TCP socket not established yet!");
		}

	});

	webSocket.on("streamwire",function(){
		open("/Applications/OBS.app");
	});

	webSocket.on("camSetting",function(config){
		
		//brightness
		//{"cmd":"setCamera","data":{"value":229,"index":0,"property":"brightness"}}
		//{"cmd":"setCamera","data":{"value":229,"index":1,"property":"brightness"}}
		
		//saturation
		//{"cmd":"setCamera","data":{"value":229,"index":0,"property":"saturation"}}
		//{"cmd":"setCamera","data":{"value":229,"index":1,"property":"saturation"}}
		
		//contrast
		//{"cmd":"setCamera","data":{"value":229,"index":0,"property":"contrast"}}
		//{"cmd":"setCamera","data":{"value":229,"index":1,"property":"contrast"}}
		
		//sharpness
		//{"cmd":"setCamera","data":{"value":255,"index":0,"property":"sharpness"}}
		//{"cmd":"setCamera","data":{"value":255,"index":1,"property":"sharpness"}}
		
		//exposure_auto
		//{"cmd":"setCamera","data":{"value":1,"index":0,"property":"exposure_auto"}}
		//{"cmd":"setCamera","data":{"value":1,"index":1,"property":"exposure_auto"}}
		
		//EV(setAutoExposureParam)
		//{"cmd":"setAutoExposureParam","data":{"factor":2}}
		
		//ISO(gain)
		//{"cmd":"setCamera","data":{"value":6400,"index":0,"property":"gain"}}
		//{"cmd":"setCamera","data":{"value":6400,"index":1,"property":"gain"}}

		if(insta.client){

			if(insta.tcpConnected){
		
				var msg = null;
				
				if(config.property != "EV"){
					var baseform_head = '{"cmd":"setCamera","data":{"value":';
					var baseform_body1 = ',"index":0,"property":"';
					var baseform_body2 = ',"index":1,"property":"';
					var baseform_foot = '"}}\n';
					
					msg = baseform_head + config.value + baseform_body1 + config.property + baseform_foot +
							baseform_head + config.value + baseform_body2 + config.property + baseform_foot;
				}
				else{
					var baseform_head = '{"cmd":"setAutoExposureParam","data":{"factor":';
					var baseform_foot = '}}\n';
					
					msg = baseform_head + config.value + baseform_foot;
				}
				console.log(msg);
				insta.client.write(msg);
			}else{
				webSocket.emit("err", "TCP socket not connected yet!");
			}

		}else{
			webSocket.emit("err", "TCP socket not established yet!");
		}
		
		
	});


	var clinetConnectTo = function(ipaddress,webSocket){

		if(insta.tcpConnected === true){
			return false;
		}

		insta.client.connect(8888, ipaddress, function() {
			insta.tcpConnected = true;

			insta.tcpIpAddress = ipaddress;

			if(insta.client_role == "iOS"){
				console.log('Connected_As_iOS');

				var date = new Date();

				var formedTime = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " 
				+ date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
				console.log("Hacking starts at" + formedTime + "\n");

				insta.client.write('{"cmd":"syncTime","data":{"time":"' + formedTime + '"}}\n');
				insta.client.write('{"cmd":"queryOffset","data":{"key":"defaultOffset"}}\n');
				insta.client.write('{"cmd":"queryVersion","data":{}}\n');
				insta.client.write('{"cmd":"queryID","data":{}}\n');
				insta.client.write('{"cmd":"queryStatistic","data":{}}\n');
			}

			webSocket.emit('tcpIp', insta.tcpIpAddress);
			webSocket.emit('tcpConn',true);

		});

	}

	//------ConnectFunc_End-------//

});



