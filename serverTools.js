let fs = require("fs");
let mysql = require('mysql');

exports.fileServer = function(folder ,path, defultPage, res){
    //File request  
    let extention = {
        ".html": "text/html",
        ".css": "text/css",

        ".JSON":"application/json",
        ".js": "application/javascript",

        ".png": "image/png",
        ".jpeg":"image/jpeg"
    }

    let filename = folder + path;
    if(filename == folder+"/") filename = folder + defultPage;

    fs.readFile(filename, function(err, data){
        let ext = extention[getType(filename)];
        if(!ext) ext = "text/plain";

        if(err){
            res.writeHead(404, {"Content-type":ext});
            return res.end();
        }
        else{
            res.writeHead(200, {"Content-type":ext});
            res.write(data);
            return res.end();
        }
    });
}


function getType(str){ 
    //returns the extention of a file
    let newstr = str.slice(str.lastIndexOf("."),str.length);
    return newstr;
}

exports.readPostBody = function(req, callback){
    let body ='';
    req.on('data', (data)=>{
        body += data;
    });
    req.on('end', ()=>{
        callback(body);
    });
}

