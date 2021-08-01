const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://doctorPortal:doctorPortal@cluster0.9pksi.mongodb.net/doctorPortalUser?retryWrites=true&w=majority";


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("doctorPortalUser").collection("user");
  const collectionAppoint = client.db("doctorPortalUser").collection("appoint");
    app.post('/addUser',(req,res) => {
      collection.insertOne(req.body)
    })
    app.get('/get',(req,res) => {
      collection.find({})
      .toArray((err,documents) => {
        res.send(documents);
      })
    })
    app.post('/appoint',(req,res) => {
      collectionAppoint.insertOne(req.body)
    })
    app.get('/getAppoint',(req,res) => {
      collectionAppoint.find({})
      .toArray((err,documents) => {
        res.send(documents)
      })
    })
});

app.listen(process.env.PORT || 4000)