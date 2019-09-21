let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

let CONNECTION_STRING = process.env.DB;

function threadController(){

        this.getAllThreads=(req,res)=>{
                let board = req.params.board;
                if(board){
                        MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                                let db = client.db("boards").collection(board);
                                db.find().sort({"bumped_on":-1}).limit(10).toArray((err,data)=>{
                                        if(data.length>0){
                                                for(let i = 0; i<data.length;i++){
                                                        delete data[i].reported;
                                                        delete data[i].delete_password;
                                                        data[i].replycount=data[i].replies.length;
                                                        if(data[i].replycount > 3){
                                                                data[i].replies = data[i].replies.slice(0,2);
                                                        }
                                                }
                                                !err? res.json(data):res.send("could not find thread");
                                        }
                                        else {
                                                res.send("could not find thread");
                                        }
                                })
                        });
                }
                else {
                        res.send("please complete required fields")
                }
        }

        this.insertThread=(req,res)=>{
                let board = req.params.board;
                let text = req.body.text;
                let deletePassword = req.body.delete_password;
                if(board && text && deletePassword){
                        let thread = {
                                "text":text,
                                "reported":false,
                                "delete_password":deletePassword,
                                "created_on":new Date(),
                                "bumped_on":new Date(),
                                "replies":[]
                        };
                        MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                                let db = client.db("boards").collection(board);
                                db.insertOne(thread,(err)=>{
                                        if(!err) res.redirect("/b/"+board+"/");
                                })
                        });
                }
                else {
                        res.send("please complete required fields")
                }
        }

        this.updateThreadReported=(req,res)=>{
                let board = req.params.board;
                let threadId = req.body.report_id;
                if(board && threadId){
                        MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                                let db = client.db("boards").collection(board);
                                db.findOneAndUpdate({_id:new ObjectID(threadId)},{$set:{reported:true}},(err,data)=>{
                                        if(data){
                                                data.lastErrorObject.n!=0? res.send("reported"):res.send("failed to report thread");
                                        }
                                })
                        });
                }
                else {
                        res.send("please complete required fields")
                }
        }

        this.deleteThread=(req,res)=>{      
                let board = req.params.board;
                let threadId = req.body.thread_id;
                let deletePassword = req.body.delete_password;
                if(board && threadId && deletePassword){
                        MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                                let db = client.db("boards").collection(board);
                                db.deleteOne({_id:new ObjectID(threadId),delete_password:deletePassword},(err, data)=>{
                                        if(data){
                                                data.result.n!=0? res.send("success"):res.send("incorrect password");
                                        }
                                })
                        });
                }
                else {
                        res.send("please complete required fields")
                }
        }
}
module.exports = threadController;