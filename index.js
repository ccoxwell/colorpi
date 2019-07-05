const awsIot = require('aws-iot-device-sdk');
const {exec} = require("child_process");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

var opts = {
    keyPath: process.env.KEY_PATH,
    certPath: process.env.CERT_PATH,
    caPath: process.env.ROOT_CA,
    clientId: process.env.CLIENT_ID,
    host: process.env.HOST_NAME
}
var thingShadow = awsIot.thingShadow(opts);
var clientTokenUpdate;

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

var s3 = new AWS.S3();

thingShadow.on("connect", 
    function() {
        thingShadow.register("ColorPiRpi", {persistentSubscribe: true}, function() {
            let rgbLedLampState = {"state":{"desired":{"r": 0, "g": 0, "b": 0}}};
            clientTokenUpdate = thingShadow.update("ColorPiRpi", rgbLedLampState);
            console.log(clientTokenUpdate)
        })
    })

thingShadow.on('delta', 
    function(thingName, stateObject) {
       console.log('received delta on '+thingName+': '+
                   JSON.stringify(stateObject));
        var r = stateObject.state.r;
        var g = stateObject.state.g;
        var b = stateObject.state.b;
	var colorCmd = `python rgbexp.py ${r} ${g} ${b}`;
	console.log(colorCmd);
	exec(colorCmd);
        var timestamp = Date.now();
        var filename = `img${timestamp}.jpg`;
        var cmd = `raspistill -o ${filename}`;
        exec(cmd);
        let path = `./${filename}`
        fs.readFile(path, function(err, fileBuff) {
            let params = {
                Bucket: "colorpi",
                Key: filename,
                Body: fileBuff
            };
            s3.putObject(params, function(s3err, s3res) {
                if (s3err) {
                    console.err("Error: ", s3err);
                } else {
                    console.log(s3res);
                }
            })
        })
    });
