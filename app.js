/*
* AutopilotCollector
*
* Very simple web service to collect and store Autopilot enrolment info.
*
*/
const http = require('http');
const fs = require('fs');

/* Read our config file */
const configData = fs.readFileSync('./volatile/config.json', 'utf8');

const config = JSON.parse(configData);

console.log('Starting...');

http.createServer((request, response) => {

    if (request.method != 'POST') {
        response.writeHead(400);
        response.write('Please use HTTP POST');
        response.end();
        return;
    }


    const chunks = [];

    request.on('data', (chunk) => {
        chunks.push(chunk);
    });

    request.on('end', () => {
        
        // expect JSON input
        let input = {};
        try {
            input = JSON.parse(chunks);
        }
        catch {
            response.writeHead(400);
            response.write('Unable to parse input JSON');
            response.end();
            return;
        }

            // parse input object
        let objectForCsv = {
            "DeviceSerialNumber": "",
            "WindowsProductID": "",
            "HardwareHash": "",
        };

        try {
            objectForCsv.DeviceSerialNumber = input.DeviceSerialNumber;
        }
        catch {
            response.writeHead(400);
            response.write('Unable to parse DeviceSerialNumber');
            response.end();
            return;
        }
        try {
            objectForCsv.WindowsProductID = input.WindowsProductID;
        }
        catch {
            response.writeHead(400);
            response.write('Unable to parse WindowsProductID');
            response.end();
            return;
        }
        try {
            objectForCsv.HardwareHash = input.HardwareHash;
        }
        catch {
            response.writeHead(400);
            response.write('Unable to parse HardwareHash');
            response.end();
            return;
        }

        // normalise hardware hash -- sometimes is padded incorrectly when it comes out of the registry
        // the Intune interface is intolerant of incorrectly padded base64
        const hashBuffer = Buffer.from(input.HardwareHash, 'base64');
        const hardwareHashReencoded = hashBuffer.toString('base64');

        let writer = fs.createWriteStream(config.csvFile, {flags: 'a'});
        writer.write(`${input.DeviceSerialNumber},${input.WindowsProductID},${hardwareHashReencoded}\r\n`);
        writer.end();

	console.log(`Received ${input.DeviceSerialNumber}`);

        response.writeHead(204); // no content

        response.end();
    }); 
}).listen(config.port);

console.log('Listening for AutoPilot information on port ' + config.port);
console.log('Use \'magic.ps1\' on target devices to have them send their AutoPilot info to this server.');
console.log('Then access ' + config.csvFile + ' and upload this to Intune.');


