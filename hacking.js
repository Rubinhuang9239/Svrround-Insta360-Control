var express = require('express');
var app = express();
var net = require('net');

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

insta.heartTestClock = setInterval(function(){

					if(insta.tcpConnected && insta.client){
						console.log("heart");
						insta.client.write('{"cmd":"heartTest","data":{}}\n');
					}

				},2000);

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
		console.log('Received: ' + data);

		//if(type == "fileList"){
			//
		//}
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
		console.log('Connection closed');
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
			//webSocket.emit('tcpConn',false);


		}else{
			insta.tcpConnected = false;
			webSocket.emit("err", "TCP socket not connected yet!");
			//webSocket.emit('tcpConn',false);
		}


	});

	webSocket.on("stream",function(config){

	//Bitrate_Settings//
	//  5: 5242880;
	// 10: 10485760;
	// 15: 15728640;
	// 20: 20971520;
	// 30: 31457280;
								
	//Takes 5s to set up the rtmp stream
	// client.write('{"data":{"key":"defaultOffset"},"cmd":"queryOffset"}\n');
	// client.write('{"data":{"index":1},"cmd":"queryCamera"}\n');

		if(insta.client){

			if(insta.tcpConnected){
				if(config.action == "start"){
					insta.client.write('{"data":{"bitrate":10485760,"width":1440,"height":1440},"cmd":"startLive"}\n');
					insta.streaming = true;
				}else if(config.action == "stop"){
					insta.client.write('{"data":{"bitrate":10485760,"width":1440,"height":1440},"cmd":"stopLive"}\n');
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
					insta.client.write('{"cmd":"startPreview","data":{}}\n');
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


	var clinetConnectTo = function(ipaddress,webSocket){

		if(insta.tcpConnected === true){
			return false;
		}

		insta.client.connect(8888, ipaddress, function() {
			insta.tcpConnected = true;
			//console.log("HI");

			if(insta.client_role == "liveKit"){
				console.log('Connected_As_LiveKit');

				var date = new Date();

				var formedTime = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " 
				+ date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
				console.log("Hacking starts at" + formedTime + "\n");

				insta.client.write('{"data":{"bitrate":10485760,"width":1440,"height":1440},"cmd":"startLive"}\n');

				//Bitrate_Settings//
				//  5: 5242880;
				// 10: 10485760;
				// 15: 15728640;
				// 20: 20971520;
				// 30: 31457280;
								
				//Takes 5s to set up the rtmp stream
				// client.write('{"data":{"key":"defaultOffset"},"cmd":"queryOffset"}\n');
				// client.write('{"data":{"index":1},"cmd":"queryCamera"}\n');
				
				setTimeout(function(){
					insta.client.write('{"data":{"bitrate":10485760,"width":1440,"height":1440},"cmd":"stopLive"}\n');
				},10000);

			}
			else if(insta.client_role == "iOS"){
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
		});


		webSocket.emit('tcpConn',true);

	}

	//------ConnectFunc_End-------//

});


