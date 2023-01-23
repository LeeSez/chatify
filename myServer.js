let fs = require('fs');
let url = require('url');
let http = require('http');
let serverTools = require('./serverTools');
let mysql = require('mysql');


let databaseConnection = {
    host: "localhost",
    user: "root",
    password: "22022202",
    database: "chatify"
};

http.createServer((req,res)=>{
    let q = url.parse(req.url, true);

    if(q.path.startsWith('/api')){

        if(req.method == 'GET'){
            email = q.query.email;
            password = q.query.password;   
        }
        
        if(req.method="POST" || (email && password)){
            if(q.path.startsWith('/api/login')){
                validateUser(email,password,res,(err, result,generalConnection)=>{
                    if(err){
                        console.log("1");
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                    }
                    else{

                        if(result[0].count == 1){
                            console.log("login successful");

                            generalConnection.query('SELECT DISTINCT sender, receiver FROM messages WHERE sender=? OR receiver=?',[email,email],(error, secondResult)=>{
                                if(error){
                                    res.writeHead(200, {'Content-Type':'text/plain'});
                                    res.end("noMessagesFound");
                                    generalConnection.end();
                                    return;
                                }
                                else{
                                    let contactList = contacts(secondResult, email);
                                    contactList.push(email);
                                    let names = [];
                                    
                                    getNames(contactList, names, generalConnection, res);
                                }
                            });
                        }

                        else if(result[0].count == 0){
                            generalConnection.end();
                            console.log("login failed");
                            res.writeHead(200, {'Content-Type':'text/plain'});
                            res.end("failedToLog");
                            return;
                        }
                    }
                });
            }
            else if(q.path.startsWith('/api/register')){
                let name = q.query.name;
                let generalConnection = mysql.createConnection(databaseConnection);
                generalConnection.connect((err)=>{
                    if(err){
                        console.log("2");
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                        return;
                    }
                    else{
                        generalConnection.query("INSERT INTO users(email,password,name) VALUES(?,?,?)",[email,password,name],(error,secondResult)=>{
                            if(error){
                                generalConnection.end();
                                console.log("user already exists");
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("alreadyExists");
                                return;
                            }
                            else{
                                generalConnection.end();
                                console.log("register successful");
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("registerSuccessful");
                                return;
                            }
                        });
                    }
                });
            }
            else if(q.path.startsWith('/api/lookForContact')){
                let contactEmail = q.query.contactEmail;
                if(contactEmail){
                    generalConnection = mysql.createConnection(databaseConnection);
                    generalConnection.connect((err)=>{
                        if(err){
                            console.log("3");
                            res.writeHead(500, {'Content-Type':'text/plain'});
                            res.end();
                            return; 
                        }
                        else{
                            generalConnection.query("SELECT COUNT(email) AS count FROM users WHERE BINARY email=?",[contactEmail],(error, result)=>{
                                if(error){
                                    generalConnection.end();
                                    console.log("4");
                                    res.writeHead(500, {'Content-Type':'text/plain'});
                                    res.end();
                                    return; 
                                }
                                else{
                                    if(result[0].count == 1){
                                        //user found
                                        generalConnection.query("SELECT name FROM users WHERE email=?",[contactEmail], (error2, result2)=>{
                                            generalConnection.end();
                                            if(error2){
                                                console.log("5");
                                                res.writeHead(500, {'Content-Type':'text/plain'});
                                                res.end();
                                                return; 
                                            }
                                            else{ 
                                                res.writeHead(200, {'Content-Type':'application/JSON'});
                                                res.end(JSON.stringify(result2));
                                                return;  
                                            }
                                        });
                                    }
                                    else if(result[0].count == 0){
                                        // user not found
                                        generalConnection.end();
                                        res.writeHead(200, {'Content-Type':'text/plain'});
                                        res.end("user_not_found");
                                        return;    
                                    }
                                }
                            });
                        }
                    });
                }
            }
            else if(q.path.startsWith('/api/send')){
                if(req.method == "POST"){
                    serverTools.readPostBody(req, (strBody)=>{
                        let body = JSON.parse(strBody);
                        let email = body.email;
                        let password = body.password;
                        let receiver = body.receiver;

                        validateUser(email,password,res,(err, result,generalConnection)=>{
                            if(err){
                                console.log("5");
                                res.writeHead(500, {'Content-Type':'text/plain'});
                                res.end();
                                return;
                            }
                            else{
                                if(result[0].count == 1){
                                    console.log("found user");
                                    generalConnection.query("INSERT INTO messages(sender,receiver,content,time) VALUES(?,?,?,?)",[email,receiver, body.content,body.time],(error, result)=>{
                                        generalConnection.end();
                                        if(error){
                                            console.log("6");
                                            res.writeHead(500, {'Content-Type':'text/plain'});
                                            res.end("failed");
                                            return;
                                        }
                                        else{
                                            console.log("message sent");
                                            res.writeHead(200, {'Content-Type':'text/plain'});
                                            res.end("successful");
                                            return;
                                        }
                                    });
                                }
                                else if(result[0].count == 0){
                                    generalConnection.end();
                                    return;
                                }
                            }
                        });
                    });
                }
                else{
                    res.writeHead(400, {'Content-Type':'text/plain'});
                    res.end(); 
                }
            }
            else if(q.path.startsWith('/api/pull')){
                let receiverEmail = q.query.receiver;
                let lastId = q.query.lastId;
                
                validateUser(email, password, res, (err, result,generalConnection)=>{
                    if(result[0].count == 1){
                        generalConnection.query("SELECT * FROM messages WHERE (sender=? OR sender=?) AND (receiver=? OR receiver=?) AND id>?",[email, receiverEmail, email, receiverEmail,lastId],(error1, result1)=>{
                            if(error1){
                                generalConnection.end();
                                console.log("7");
                                res.writeHead(500, {'Content-Type':'text/plain'});
                                res.end();
                                return;
                            }
                            else{
                                res.writeHead(200, {'Content-Type':'application/JSON'});
                                res.end(JSON.stringify(result1));
                                generalConnection.end();
                                return;
                            }
                        });
                    }
                    else if(result[0].count == 0){
                        generalConnection.end();
                        res.writeHead(200, {'Content-Type':'text/plain'});
                        res.end("user not found");
                        return;
                    }
                });
            }
        }
        else{
            console.log("8");
            res.writeHead(500, {'Content-Type':'text/plain'});
            res.end();
        }
    }
    else{
        serverTools.fileServer('./client', q.path, '/index.html', res);
    }
}).listen(8080);

function validateUser(email,password,res,callback){
    let generalConnection = mysql.createConnection(databaseConnection);
    generalConnection.connect((err)=>{
        if(err){
            generalConnection.end();
            console.log("9");
            res.writeHead(500, {'Content-Type':'text/plain'});
            res.end();
            return;
        }
        else{
            generalConnection.query("SELECT COUNT(email) AS count FROM users WHERE BINARY email=? AND  BINARY password=?",[email, password],(err,result)=>{
                callback(err,result,generalConnection);
            });
        }
    });
}


function contacts(response, email){
    let array = [];
    for(let i = 0; i<response.length; i++){
        
        if(response[i].sender != email && !array.includes(response[i].sender)) array.push(response[i].sender);
        
        if(response[i].receiver != email && !array.includes(response[i].receiver)) array.push(response[i].receiver);
    }
    return array;
}

function getNames(contactList ,nameArr, generalConnection, res){
    generalConnection.query("SELECT name FROM users WHERE email = ?", [contactList[nameArr.length]], (error2, res2)=>{
        if(error2){

        }
        else{
            nameArr.push(res2[0].name);
            if(nameArr.length == contactList.length){
                res.writeHead(200, {'Content-Type':'application/JSON'});
                res.end(JSON.stringify([contactList, nameArr]));
                generalConnection.end();
                return;
            }
            else{
                getNames(contactList, nameArr, generalConnection, res);
            }
        }
    });
}