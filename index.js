var dyndns = require('./dyndnsScript');


var settings = {
    //constants for DNS setting
    dnsType : 'A', // "A", "CNAME", et c. 
    domain : '', // yourdomain.suffix, e. g. google.de
    proxySetting : false, // should dns setting be proxied?
    time_to_live : 1800, //1800 seconds : 30 minutes.

    //zoneID
    zoneID : '',

    //general setting
    checkTime : 10000, // cycle time in ms, time this script will sleep before checking dns settings again.

    //headers for all Requests
    myHeaders : {
        "X-Auth-Email":"", //cloudflare e-mail address
        "X-Auth-Key":"", //X-Auth-Key = global api token
        "Content-Type":"application/json" //always json
    }
}
dyndns.start(settings);