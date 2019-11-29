const publicIp = require('public-ip');
const fetch = require('node-fetch');


// you need to manualle fill-in the below constants.
// ###
//constants for DNS setting
const dnsType = 'A'; // "A", "CNAME", et c. 
const domain = ''; // yourdomain.suffix, e. g. google.de
const proxySetting = false; // should dns setting be proxied?
const time_to_live = 1800; //in seconds -- 1800 seconds = 30 minutes.

//zoneID
const zoneID = '';

//general setting
const checkTime = 60000; // cycle time in ms, time this script will sleep before checking dns settings again.

//headers for all Requests
const myHeaders = {
    "X-Auth-Email":"", //cloudflare e-mail address
    "X-Auth-Key":"", //X-Auth-Key = global api token
    "Content-Type":"application/json" //always json
};
// ##########################################################################################



console.log("\n####### Author: Marc Orel - DynDNS script for Cloudflare users ####");

async function ipGetter() {
    //var current_ip = await fetchCurrentIp();
    current_ip = await publicIp.v4();
    return current_ip;
}

//Get-Request options
const optionsGet = {
    method: 'GET',
    headers: myHeaders
}
//fetch url for dns settings
const curret_ip_cloudflare = 'https://api.cloudflare.com/client/v4/zones/' + zoneID +'/dns_records?type=' + dnsType + "&name=" + domain;


async function compareIP(asis, id) {
    console.log('\n  -------------------------------------------------------- ');
    console.log(' | ##############', new Date(), '############## |');
    console.log(' |','checks ip now...                                       |');
    console.log(' | IP currently in Cloudflare:',asis, '              |');
    
    var new_ip = await ipGetter();
    console.log(' | IP currently in LAN: ', new_ip, '                    |');

    if(asis !== new_ip) {
        console.log(' | => ip is not equal.                                  |');
        console.log(' | SENDING API CALL TO CLOUDFLARE                       |');

        var bod = {
            "type":dnsType,
            "name": domain,
            "content": new_ip,
            "proxied": proxySetting,
            "ttl":time_to_live
        }
        bod = JSON.stringify(bod);
        let putResult = await postNewIp("https://api.cloudflare.com/client/v4/zones/"+zoneID+"/dns_records/"+id, myHeaders,bod);
        console.log(' | => Put-Command was successful? ',putResult, '!', '                |');
        console.log('  -------------------------------------------------------- \n');
        setTimeout(function() {
            compareIP(new_ip, id);
        }, checkTime);
    } else {
        console.log(' | => ip is equal.                                        |');
        console.log('  -------------------------------------------------------- \n');
        setTimeout(function() {
            compareIP(asis, id);
        }, checkTime);
    }

}
//posts new dns settings
async function postNewIp(url, hdrs, bod) {
    let res = await fetch(url, {
        method: 'PUT',
        headers: hdrs,
        body: bod
    });
    let success = await res.json();
    return success.success;
}
//fetches current dns settings
async function fetchCloudflareIp(url, optionsGet) {
    //console.log('fetchcloudflareIP()');
    let res = await fetch(url, optionsGet);
    let ip = await res.json();
    return ip.result[0];
}

async function start() {
    let ip_cloud_cur = await fetchCloudflareIp(curret_ip_cloudflare, optionsGet);
    //console.log(ip_cloud_cur);
    let ip_id = ip_cloud_cur.id;
    ip_cloud_cur = ip_cloud_cur.content;
    //console.log(ip_id);
    compareIP(ip_cloud_cur, ip_id);
}

//starts the script
module.exports = {
    async start() {
        let ip_cloud_cur = await fetchCloudflareIp(curret_ip_cloudflare, optionsGet);
        let ip_id = ip_cloud_cur.id;
        ip_cloud_cur = ip_cloud_cur.content;
        compareIP(ip_cloud_cur, ip_id);
    }
}

