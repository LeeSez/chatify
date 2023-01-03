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
    req.on('data', ()=>{
        body += data;
    });
    req.on('end', ()=>{
        callback(body);
    });
}

exports.query = function(sql, params, callback, res, connectionParameters){
    let conn = mysql.createConnection(connectionParameters);
    conn.connect((err)=>{
        if(err){
            console.log(err);
            res.writeHead(500, {'Content-Type':'text/plain'});
            res.end();
        }else{
            conn.query(sql,params,(err,result,fields)=>{
                if(err){
                    if(!callback(result, err)){
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                    }
                }else{
                    callback(result, err);
                }
            });
        }
    });
};