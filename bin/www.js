const superconsole = require('../scripts/logging/superconsole');

const fs = require('fs');
const path = require('path');
const express = require('express');
const vhost = require('vhost');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const credentials = require('../scripts/all/credentials');

const mainApp = express();
const apps = [];

var environment = process.argv[2];

//Enable console debugging
superconsole.SetDebug(environment == 'development' ? true : false);

//Load all apps and store them
fs.readdirSync('./apps').forEach(folder => {
    var appPath = path.join('./apps', folder);
    if (!fs.lstatSync(appPath).isDirectory())
        return;

    var app = require(`../apps/${folder}/main`);
    apps.push({ App: app, Name: folder });
});

const debug = require('debug')('dev:server');
const http = require('http');
const https = require('https');
const { env } = require('process');


//Load ports from environment variables
var portHttp = ParsePort(process.env.PORT_HTTP || '80');
var portHttps = ParsePort(process.env.PORT_HTTPS || '443');

var websocketHttp = 1080;
var websocketHttps = 1443;

//Iterate through apps
apps.forEach((subApp) => {
    var initializedApp = subApp.App.Initialize(function(app) {
        app.set('env', environment);

        //app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        //app.set('port', portHttp);
        app.set('websocket-http', websocketHttp++);
        app.set('websocket-https', websocketHttps++);
        app.set('app-name', subApp.Name);
    });

    mainApp.use(vhost(`${subApp.Name}.localhost`, initializedApp));
    mainApp.use(vhost(`${subApp.Name}.ethergizmos.com`, initializedApp));
});

//Keeping here incase the 'acme-challenge' needs it again
//var path = require('path');
//mainApp.use('/.well-known', express.static(path.join(__dirname, '../.well-known'), { dotfiles: 'allow' }));

//Connecting to the main site, without a subdomain, redirects you to the 'warframe' subdomain
mainApp.get('*', function(req, res) {
    if (/^(?:[^\.]+\.){0}(?:ethergizmos\.com|localhost)/i.test(req.hostname)) {
        console.log(`${req.protocol}://warframe.${req.hostname}${req.url}`);
        res.redirect(`${req.protocol}://warframe.${req.hostname}${req.url}`);
    }
});

//Create http(s) servers
var httpServer = http.createServer(mainApp);
var httpsServer = https.createServer(credentials, mainApp);

//Listen on the specified ports
httpServer.listen(portHttp);
httpServer.on('error', OnError);
httpServer.on('listening', OnListening);

httpsServer.listen(portHttps);
httpsServer.on('error', OnError);
httpsServer.on('listening', OnListening);

/**
 * Ensures the port is a number
 * @param {string} portString 
 */
function ParsePort(portString) {
    var port = parseInt(portString);

    //Port is valid, return it
    if (port >= 0) {
        return port;
    }

    //Port isn't valid
    return null;
}

/**
 * Handle errors
 * @param {*} error 
 */
function OnError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof portHttp === 'string'
      ? 'Pipe ' + portHttp
      : 'Port ' + portHttp;

    //Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Called on initialization
 */
function OnListening() {
    var addr = this.address();
    var bind = addr.port;

    superconsole.log(superconsole.MessageLevel.INFORMATION, `$blue:Listening on port $white,bright{${bind}}`);
}

Object.defineProperty(
    global,
    '__debug',
    {
        get: function() {
            const e = new Error();
            const regex = /\d+:\d+/i;
            const regex2 = /at (?:\w+(?:\.[\w<>]+)* )?\(?(.*):\d+:\d+\)?$/
            const match = regex.exec(e.stack.split("\n")[3]);
            const match2 = regex2.exec(e.stack.split("\n")[3]);
            let filename = match2[1].split('/')[match2[1].split('/').length - 1];
            return filename.replace(process.cwd(), '.') + ':' + match[0].split(':')[0];
        }
    }
);