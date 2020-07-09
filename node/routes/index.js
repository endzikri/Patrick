var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'patrick';
let db = null;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db = client.db(dbName);

});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.post('/addPlayer', async function(req, res, next) {
  console.log(req.body);
  await db.collection('players').insertOne(req.body);
  res.send({success: true});
});
router.post('/players', async function(req, res, next) {
  console.log(req.body);
  let players = await db.collection('players').find().toArray();
  res.send(players);
});
module.exports = router;
