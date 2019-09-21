/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let id1;
  let id2;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

      test('Add one',function(done){
      chai.request(server)
      .post('/api/threads/test')
      .send({
        "text":"first",
        "delete_password":"delete",
      })
      .end((err,res)=>{
        assert.include(res.redirects[0], "/b/test")
      });
      chai.request(server)
      .post('/api/threads/test')
      .send({
        "text":"first",
        "delete_password":"delete",
      })
      .end(()=>{
        done();
      });
      
    });

    test('No text', function(done){
      chai.request(server)
      .post('/api/threads/test')
      .send({
        "delete_password":"delete"
      })
      .end((err,res)=>{
        assert.equal(res.status,200);
        assert.equal(res.text,"please complete required fields")
        done();
      });
    });

  });
    
    suite('GET', function() {
      
      test('Find last ten threads', function(done){
        chai.request(server)
        .get('/api/threads/test')
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body);
          assert.property(res.body[0], "text");
          assert.property(res.body[0], "replycount");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "bumped_on");
          assert.property(res.body[0], "replies");
          assert.isArray(res.body[0].replies);
          assert.equal(res.body[0].text, "first");
          id1 = res.body[0]._id;
          id2 = res.body[1]._id;
          done();
        })
      });

      test('Non-existant thread', function(done){
        chai.request(server)
        .get('/api/threads/nonexistant')
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text, "could not find thread");
          done();
        })
      });
    });
    
    suite('DELETE', function() {
      test("Delete one thread",function(done){
      chai.request(server)
      .delete('/api/threads/test')
      .send({
        "thread_id":id1,
        "delete_password": "delete"
      })
      .end((err,res)=>{
        assert.equal(res.status,200);
        assert.equal(res.text,"success");
        done();        
      })
    });
    test("Incorrect password",function(done){
      chai.request(server)
      .delete('/api/threads/test')
      .send({
        "thread_id":id2,
        "delete_password": "dele"
      })
      .end((err,res)=>{
        assert.equal(res.status,200);
        assert.equal(res.text,"incorrect password");
        done();        
      })
    });
  });
    
    suite('PUT', function() {
      test('report a thread', function(done){
        chai.request(server)
        .put('/api/threads/test')
        .send({
          "report_id":id2
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,"reported");
          done();
        })
      })
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Add reply', function(done){
        chai.request(server)
        .post('/api/replies/test')
        .send({
          "thread_id":id2,
          "delete_password":"delete",
          "text":"text"
        })
        .end((err,res)=>{
          assert.include(res.redirects[0], "/b/test/"+id2)
        })
        chai.request(server)
        .post('/api/replies/test')
        .send({
          "thread_id":id2,
          "delete_password":"delete",
          "text":"text"
        })
        .end(()=>{
          done();
        })
      });
    });
    
    suite('GET', function() {
      test("get all replies",(done)=>{
        chai.request(server)
        .get('/api/replies/test')
        .query({thread_id:id2})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.property(res.body.replies[0], "text");
          assert.property(res.body.replies[0], "created_on");
          assert.isArray(res.body.replies);
          assert.equal(res.body.replies[0].text, "text");
          id1 = res.body.replies[0]._id;
          done();
        })
      })
    });
    
    suite('PUT', function() {
      test('report reply', (done)=>{
        chai.request(server)
        .put('/api/replies/test')
        .send({
          "thread_id":id2,
          "reply_id":id1
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,"reported");
          done();
        })
      })
    });
    
    suite('DELETE', function() {
      test('delete one',(done)=>{
        chai.request(server)
        .delete('/api/replies/test')
        .send({
          "thread_id":id2,
          "reply_id":id1,
          "delete_password":"del"
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,"incorrect password");
          done();
        })
      });

      test('incorrect password',(done)=>{
        chai.request(server)
        .delete('/api/replies/test')
        .send({
          "thread_id":id2,
          "reply_id":id1,
          "delete_password":"delete"
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,"success");
          done();
        })
      });
      
    });
    
  });

});
