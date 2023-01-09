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
                
                validateUser(email,password,res,(result,err)=>{
                    if(err){
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                    }
                    else{

                        if(result[0].count == 1){
                            console.log("login successful");

                            serverTools.query('SELECT DISTINCT sender, receiver FROM messages WHERE sender=? OR receiver=?',[email,email],(secondResult,error)=>{
                                if(error){
                                    res.writeHead(200, {'Content-Type':'text/plain'});
                                    res.end("noMessagesFound");
                                    return;
                                }
                                else{
                                    res.writeHead(200, {'Content-Type':'application/JSON'});
                                    res.end(JSON.stringify(secondResult));
                                    return;
                                }
                            },res,databaseConnection);
                        }

                        else if(result[0].count == 0){
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
                let conn = mysql.createConnection(databaseConnection);
                conn.connect((err)=>{
                    if(err){
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                        return;
                    }
                    else{
                        conn.query("INSERT INTO users(email,password,name) VALUES(?,?,?)",[email,password,name],(error,secondResult)=>{
                            if(error){
                                console.log("user already exists");
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("alreadyExists");
                                return;
                            }
                            else{
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
                    let conn = mysql.createConnection(databaseConnection);
                    conn.connect((err)=>{
                        if(err){
                            res.writeHead(500, {'Content-Type':'text/plain'});
                            res.end();
                            return; 
                        }
                        else{
                            conn.query("SELECT COUNT(email) AS count FROM users WHERE BINARY email=?",[contactEmail],(error, result)=>{
                                if(error){
                                    res.writeHead(500, {'Content-Type':'text/plain'});
                                    res.end();
                                    return; 
                                }
                                else{
                                    if(result[0].count == 1){
                                        res.writeHead(200, {'Content-Type':'text/plain'});
                                        res.end("user_found");
                                        return;   
                                    }
                                    else if(result[0].count == 0){
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

                        validateUser(email,password,res,(result,err)=>{
                            if(err){
                                res.writeHead(500, {'Content-Type':'text/plain'});
                                res.end();
                                return;
                            }
                            else{
                                if(result[0].count == 1){
                                    console.log("found user");
                                    serverTools.query("INSERT INTO messages(sender,receiver,content) VALUES(?,?,?)",[email,receiver, body.content],(result, error)=>{
                                        if(error){
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
                                    },res, databaseConnection);
                                }
                                else if(result[0].count == 0){
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
                let conn = mysql.createConnection(databaseConnection);
                conn.connect((err)=>{
                    if(err){
                        conn.destroy();
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                        return;
                    }
                    else{
                        conn.query("SELECT COUNT(email) AS count FROM users WHERE BINARY email=? AND BINARY password=?",[email, password],(error1,result)=>{
                            if(err){
                                res.writeHead(500, {'Content-Type':'text/plain'});
                                res.end();
                            }
                            else{
                                if(result[0].count == 1){
                                    conn.query("SELECT * FROM messages WHERE (sender=? OR sender=?) AND (receiver=? OR receiver=?) AND id>?",[email, receiverEmail, email, receiverEmail,lastId],(err, result)=>{
                                        res.writeHead(200, {'Content-Type':'application/JSON'});
                                        res.end(JSON.stringify(result));
                                        conn.destroy();
                                        return;
                                    });
                                }
                                else{
                                    conn.destroy();
                                    res.writeHead(200, {'Content-Type':'text/plain'});
                                    res.end("user not found");
                                    return;
                                }
                            }
                            
                        });
                    }
                });
            }
        }
        else{
            res.writeHead(500, {'Content-Type':'text/plain'});
            res.end();
        }
    }
    else{
        serverTools.fileServer('./client', q.path, '/index.html', res);
    }
}).listen(8080);

function validateUser(email,password,res,callback){
    serverTools.query("SELECT COUNT(email) AS count FROM users WHERE BINARY email=? AND  BINARY password=?",[email, password],(result,err)=>{
        callback(result,err);
    },res,databaseConnection);
}
