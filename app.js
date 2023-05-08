/***************
 * node-unblocker: Web Proxy for evading firewalls and content filters,
 * similar to CGIProxy or PHProxy
 *
 *
 * This project is hosted on github:  https://github.com/codeisfun1234/nodeunblocker.com
 *
 * By Nathan Friedly - http://nfriedly.com
 * Released under the terms of the Affero GPL v3
 */

const url = require("url");
const querystring = require("querystring");
const express = require("express");
const Unblocker = require("unblocker");
const Transform = require("stream").Transform;
const youtube = require("unblocker/examples/youtube/youtube.js");
const blacklist = require("unblocker/examples/blacklist/blacklist.js");

const app = express();

const unblockerConfig = {
    prefix: "/view/",
    requestMiddleware: [
        youtube.processRequest,
        /*blacklist({
            blockedDomains: ["google.com"],
            message: "The requested URL doesn't work on this site.",
        }),*/
        blacklist({
            blockedDomains: ["evil-website"],
            message: "The requested url is not permitted (has been blocked).",
        }),
    ],
};

const unblocker = new Unblocker(unblockerConfig);

// this line must appear before any express.static calls (or anything else that sends responses)
app.use(unblocker);

// serve up static files *after* the proxy is run
//app.use("/", express.static(__dirname + "/public"));

// this is for users who's form actually submitted due to JS being disabled or whatever
/*app.get("/no-js", (req, res) => {
    // grab the "url" parameter from the querystring
    const site = querystring.parse(url.parse(req.url).query).url;
    
    // and redirect the user to /view/url
    res.redirect(unblockerConfig.prefix + site);
});*/

const port = process.env.PORT || process.env.VCAP_APP_PORT || 8080;

app.listen(port, () => console.log(`node unblocker process listening at http://localhost:${port}/`))
   .on("upgrade", unblocker.onUpgrade); // onUpgrade handles websockets
