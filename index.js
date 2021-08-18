const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config()
const fs = require('fs-extra')

const app = express();

const { MongoClient } = require('mongodb');
const Object = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.9pksi.mongodb.net/doctorPortalUser?retryWrites=true&w=majority`;


app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('doctors'))
app.use(fileUpload());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("doctorPortalUser").collection("user");
  const appointCollection = client.db("doctorPortalUser").collection("appoint");
  app.post("/checkEmail", (req, res) => {
    collection.find({ email: req.body.checkUser })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  app.post('/login', (req, res) => {
    collection.insertOne(req.body)
  })
  app.post('/insertAppoint', (req, res) => {
    appointCollection.insertOne(req.body)
  })
  app.post('/AddDoctors', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const status = req.body.status;
    const filePath = `${__dirname}/doctors/${file.name}`;
    file.mv(filePath,err => {
      const image = fs.readFileSync(filePath)
      const encImg = image.toString('base64')
      const img = {
        contentType:file.mimetype,
        size:file.size,
        img:Buffer(encImg,'base64')
      }
      collection.insertOne({ name: name, email: email, password: password, phone: phone, img, status: status })
      .then(result => {
        fs.remove(filePath,err => {
          console.log(err)
        })
      })
    })
  })
  app.post('/appointment', (req, res) => {
    const email = req.body.email;
    const status = req.body.status;
    const date = req.body.date;
    if (status == 'user') {
      appointCollection.find({ userEmail: email, date: date })
        .toArray((err, documents) => {
          res.send(documents)
        })
    }
    if (status == 'doctor') {
      appointCollection.find({ date: date })
        .toArray((err, documents) => {
          res.send(documents)
        })
    }


  })
  app.post('/allPatients', (req, res) => {
    const email = req.body.email;
    const status = req.body.status;
    if (status == 'user') {
      appointCollection.find({ userEmail: email })
        .toArray((err, documents) => {
          res.send(documents)
        })
    }
    if (status == 'doctor') {
      appointCollection.find()
        .toArray((err, documents) => {
          res.send(documents)
        })
    }
  })
  app.get('/RecentPost', (req, res) => {
    appointCollection.find().limit(20)
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.put('/AppointAction', (req, res) => {
    appointCollection.updateOne({ _id: Object(req.body.id) }, { $set: { status: req.body.status } })
  })

  app.get('/Pending', (req, res) => {
    appointCollection.find({ status: 'Pending' })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  app.get('/TodayAppointment', (req, res) => {
    const date = new Date();
    const dates = date.toDateString();
    appointCollection.find({ date: dates })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/Finished', (req, res) => {
    appointCollection.find({ status: 'Finished' })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/AllAppoint', (req, res) => {
    appointCollection.find()
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/CheckEmailIsValid',(req,res) => {
    collection.find({email:req.body.userEmail})
    .toArray((err,documents) => {
      res.send(documents)
    })
  })

  app.post('/mail',(req,res) => {


    let transporter  = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:465,
      secure:true,
      requireTLS:true,
      auth:{
        user:'emonwordpress.1000@gmail.com',
        pass:process.env.EMAIL_PASS
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    },
    });
    let mailOption = {
      from:'emonwordpress.1000@gmail.com',
      to:`${req.body.email}`,
      subject:'doctor portal verify code',
      text:`${req.body.code}`
    }
    transporter .sendMail(mailOption,function(error,info){
      if(error){
        console.log(error)
      }else{
        console.log('success')
      }
    })
  })

  app.put('/changePassword', (req, res) => {
    collection.updateOne({ email:req.body.email}, { $set: { password: req.body.pass } })
    .then(data => res.send('success'))
  })

  app.patch('/deleteAppoint',(req,res) => {
    appointCollection.deleteOne({_id:Object(req.body.id)})
  })
  app.get('/doctors',(req,res) => {
    collection.find({status:'doctor'})
    .toArray((err,documents) => {
      res.send(documents)
    })
  })

});


app.listen(4000)