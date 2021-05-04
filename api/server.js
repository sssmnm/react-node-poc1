const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const mailerConfig = require('./config.js').app;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mailerConfig.email,
        pass: mailerConfig.password
    }
});
const app = express(),
      bodyParser = require("body-parser");
      port = 80;


app.use(bodyParser.json());
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

  //  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});
app.use(express.static(path.join(__dirname, '../my-app/build')));


app.get('/api/invoices', (req, res) => {
  console.log('api/invoices called!');
  fs.readFile('invoiceDetails.json', (err, data) => {
    if (err) res.json({error: err});
    let invoiceDeatils = JSON.parse(data);
    console.log(invoiceDeatils);
    res.json(invoiceDeatils);
  });
});

app.post('/api/updateStatus', (req, res) => {
  let invoiceDeatils=[];
  fs.readFile('invoiceDetails.json', (err, data) => {
    if (err) res.json({error: err});
     invoiceDeatils = JSON.parse(data);
     const invoiceNumberToBeUpdated = req.body.invoiceNumber;
  const status=req.body.status;
  invoiceDeatils.map(details => {
    if(details.invoice_number === invoiceNumberToBeUpdated){
      details.invoice_status=status;
    }
  })
  console.log('Adding status:::::', invoiceNumberToBeUpdated, status);
  fs.writeFile("invoiceDetails.json", JSON.stringify(invoiceDeatils), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
  });

  res.json("user addedd");
});

app.post('/api/sendMail', (req, res) => {
  console.log("send emaillll",req.body);
  
  const enquiry = req.body.mailData;
  const mailSubject = 'Request For invoice';
  const mailOptions = {
      from: enquiry.email,
      to: mailerConfig.email,
      subject: mailSubject,
      html: '<p>Hi! I am Santwana</p>'
  };
  console.log("mailOptions",mailOptions);
  
  transporter.sendMail(mailOptions, function (error, info) {
      const respObj = {
          status: 'success'
      };
      if (error) {
          console.log(error);
          respObj.status = 'error';
      } else {
          console.log('Email sent: ' + info.response);
      }
      transporter.close();
      res.send(respObj);
  });
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../my-app/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});