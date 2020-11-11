const fs = require('fs');

//Load and export credentials, if they exist
if (fs.existsSync('/etc/letsencrypt/live/ethergizmos.com')) {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/ethergizmos.com/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/ethergizmos.com/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/ethergizmos.com/chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    module.exports = credentials;
} else {
    module.exports = null;
}