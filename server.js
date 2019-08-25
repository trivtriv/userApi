const express = require('express');
const app = express();
const router = express.Router();
const config = require('./config');
const logic = require('./logic');
var rp = require('request-promise');

router.get('/reserveHotel', function(req, res, next){
  let token = req.query.token;

  //better option would be using tokens per tenant, storing it in db and using encryption/decryption while sending it from the client. For the simplicity, I've left it like this
  if (token !== config.publicToken) { 
    return res.status(401);
  }

  logic.reserveHotel(req.query.uid, req.query.roomName)
  .then((reserveRes)=>{
    res.status(200).send({ status: reserveRes });
  })
  .catch((err)=>{
    res.status(500).send({ error: err });
  })
});

router.get('/addBonusPoints',(req, res, next) => {
  let token = req.query.token;

  if (token !== config.secretToken) {
    return res.status(401);
  }

  logic.addBonusPoints(req.query.uid, req.query.points)
  .then(()=>{
    res.status(200).send({ status: 'OK' });
  })
  .catch((err)=>{
    res.status(500).send({ error: err });
  })
})

router.get('/releaseRoom',(req, res, next) => {
  let token = req.query.token;

  if (token !== config.secretToken) {
    return res.status(401);
  }

  logic.releaseRoom(req.query.roomName)
  .then(()=>{
    res.status(200).send({ status: 'OK' });
  })
  .catch((err)=>{
    res.status(500).send({ error: err });
  })
})

app.use('/', router);
const port = config.port || 8081;
app.listen(port, function () {
  console.log('Public API listening on port 8081')
})