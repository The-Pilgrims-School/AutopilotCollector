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

        let writer = fs.createWriteStream(config.csvFile, {flags: 'a'});
        writer.write(`"${input.DeviceSerialNumber}","${input.WindowsProductID}","${input.HardwareHash}"\r\n`);
        writer.end();

        response.writeHead(204); // no content

        response.end();
    }); 
}).listen(config.port, '127.0.0.1');