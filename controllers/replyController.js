let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

let CONNECTION_STRING = process.env.DB;

function replyController(){

    this.getAllReplies=(req,res)=>{
        let board = req.params.board;
        let threadId = req.query.thread_id;
        if(board && threadId){
            MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                let db = client.db("boards").collection(board);
                db.findOne({_id:new ObjectID(threadId)},(err,data)=>{
                    if (data){
                        delete data.delete_password;
                        delete data.reported;
                        if(data.replies.length > 0){
                            for(let i = 0; i<data.replies.length; i++){
                                delete data.replies[i].delete_password;
                                delete data.replies[i].reported;
                                if(i==2)break;
                            }
                        }
                        res.json(data);
                    }
                    else{
                        res.send("failed");
                    }
                })
            });
        }
    }

    this.insertReply=(req,res)=>{
        let board = req.params.board;
        let threadId = req.body.thread_id;
        let text = req.body.text;
        let deletePassword = req.body.delete_password;
        if(board && threadId && text && deletePassword){
            let reply = {
                "_id":new ObjectID(),
                "text":text,
                "reported":false,
                "delete_password":deletePassword,
                "created_on":new Date()
            };
            MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                let db = client.db("boards").collection(board);
                db.findOneAndUpdate({_id:new ObjectID(threadId)},{$push:{replies:reply}, $set:{bumped_on:new Date()}}, {returnOriginal: false},(err,data)=>{
                        if(data){ 
                            if(data.value) res.redirect("/b/"+board+"/"+threadId);
                        }
                        else{
                            res.send("failed");
                        }
                })
            });
        }
    }

    this.updateReplyReported=(req,res)=>{
        let board = req.params.board;
        let threadId = req.body.thread_id;
        let replyId = req.body.reply_id;
        if(board && threadId && replyId){
            MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                let db = client.db("boards").collection(board);
                db.findOneAndUpdate({"_id":new ObjectID(threadId), "replies._id":new ObjectID(replyId)},{$set:{"replies.$.reported":true}},(err,data)=>{
                        if(data){
                        data.lastErrorObject.n!=0? res.send("reported"):res.send("failed to report reply");
                        }
                        else {
                            res.send("failed to reporty reply")
                        }
                })
            });
        }
    }

    this.deleteReply=(req,res)=>{
        let board = req.params.board;
        let threadId = req.body.thread_id;
        let replyId = req.body.reply_id;
        let deletePassword = req.body.delete_password;
        if(board && threadId && replyId && deletePassword){
            MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
                let db = client.db("boards").collection(board);
                db.findOneAndUpdate({"_id":new ObjectID(threadId), "replies._id":new ObjectID(replyId),delete_password:deletePassword},{$set:{"replies.$.text":"[deleted]"}},(err,data)=>{
                    if(data){    
                    data.value? res.send("success"):res.send("incorrect password");
                    }
                    else {
                        res.send("failed");
                    }
                })
            });
        }
    }
    
}
module.exports = replyController;