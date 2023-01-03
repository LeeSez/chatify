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

        let email = q.query.email;
        let password = q.query.password;

        if(email && password){
            if(q.path.startsWith('/api/login')){
                
                validateUser(email,password,res,(result,err)=>{
                    if(err){
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                    }
                    else{

                        if(result[0].count == 1){
                            console.log("login successful");

                            serverTools.query('SELECT DISTINCT sender, receiver FROM messages AS lee WHERE sender=? OR receiver=?',[email,email],(secondResult,error)=>{
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
            else if(q.path.startsWith('/api/send')){
    
            }
            else if(q.path.startsWith('/api/pull')){
                let receiverEmail = q.query.receiver;
                validateUser(email, password, res, (result,err)=>{
                    if(err){
                        res.writeHead(500, {'Content-Type':'text/plain'});
                        res.end();
                    }
                    else{
                        if(result[0].count == 1){
                            serverTools.query("SELECT * FROM messages WHERE (sender=? OR sender=?) AND (receiver=? OR receiver=?)",[email, receiverEmail, email, receiverEmail], (result, err)=>{
                                if(err){
                                    res.writeHead(500, {'Content-Type':'text/plain'});
                                    res.end();
                                    return;
                                }
                                else{
                                    res.writeHead(200, {'Content-Type':'application/JSON'});
                                    res.end(JSON.stringify(result));
                                    return;
                                }
                            },res, databaseConnection);
                        }
                        else if(result[0].count == 0){

                        }
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
    serverTools.query("SELECT COUNT(email) AS count FROM users WHERE email=? AND password=?",[email, password],(result,err)=>{
        callback(result,err);
    },res,databaseConnection);
}
