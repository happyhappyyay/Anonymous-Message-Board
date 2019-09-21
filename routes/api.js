/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let ReplyController = require('../controllers/replyController.js');
let ThreadController = require('../controllers/threadController.js');

module.exports = function (app) {
  let reply = new ReplyController;
  let thread = new ThreadController;
  
  app.route('/api/threads/:board')

    .get((req,res)=>{
      thread.getAllThreads(req,res);
    })

    .post((req,res)=>{

    thread.insertThread(req,res);      

    })

    .put((req,res)=>{

      thread.updateThreadReported(req,res);

    })

    .delete((req,res)=>{

      thread.deleteThread(req,res);
    })
    
  app.route('/api/replies/:board')

    .get((req,res)=>{

      reply.getAllReplies(req,res);
    })

    .post((req,res)=>{
    reply.insertReply(req,res);     
    })

    .put((req,res)=>{

      reply.updateReplyReported(req,res);
    })

    .delete((req,res)=>{
      reply.deleteReply(req,res);
    })
};
