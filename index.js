var awsIot = require('aws-iot-device-sdk');
const {exec} = require("child_process");
const KEY_PATH = "2010c423a3-private.pem.key"
const CERT_PATH = "2010c423a3-certificate.pem.crt.txt"
const ROOT_CA = "AmazonRootCA1.pem"
const HOST_NAME = "ajc6rxicdx8rv-ats.iot.us-east-2.amazonaws.com"
const CLIENT_ID = "ColorPiRpi"



var opts = {
    keyPath: KEY_PATH,
    certPath: CERT_PATH,
    caPath: ROOT_CA,
    clientId: CLIENT_ID,
    host: HOST_NAME
}
var thingShadows = awsIot.thingShadow(opts);
var clientTokenUpdate;

thingShadows.on("connect", 
    function() {
        thingShadows.register("ColorPiRpi", {persistentSubscribe: true}, function() {
            let rgbLedLampState = {"state":{"desired":{"r": 0, "g": 0, "b": 0}}};
            clientTokenUpdate = thingShadows.update("ColorPiRpi", rgbLedLampState);
            console.log(clientTokenUpdate)
        })
    })

thingShadows.on('delta', 
    function(thingName, stateObject) {
       console.log('received delta on '+thingName+': '+
                   JSON.stringify(stateObject));
	var r = stateObject.state.r;
	var g = stateObject.state.g;
	var b = stateObject.state.b;
	var timestamp = Date.now();
	var filename = `img${timestamp}.jpg`;
	var cmd = `raspistill -o ${filename}`;
	exec(cmd);
    });
§
