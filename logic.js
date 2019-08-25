const express = require('express');
const app = express();
const config = require('./config');
const requestPromise = require('request-promise');
const dataHandlerApi =`${config.dataHandler.url}:${config.dataHandler.port}`;

//It's better to abstract this thing. Since tomorrow we can work with the library other than bull, would be nice to have a package which adds/ gets from queue without knowing about any implementation
const Queue = require('bull');
const queue = new Queue("hotelsQueue", {redis: {port: config.redis.port, host: config.redis.host}});

function storeTaskInQueue(task){
  return new Promise ((resolve, reject)=>{
    queue.add(task)
    .then(()=>{
      resolve('PENDING');
    });
  })
}

function handleDataHandlerRes(res, params) {
    if (res.isSuccess) {
        return Promise.resolve('OK');
    }

    let task = Object.assign(params, {dealId: res.dealId});

    return storeTaskInQueue(task);
}

function reserveHotel(uid, roomName) {
  let params = {roomName, uid};

  return requestPromise({
    uri: dataHandlerApi + '/closeDeal',
    qs:  params
  })
  .then(function (res) {
    return handleDataHandlerRes(JSON.parse(res), params);
  })
}

function addBonusPoints(uid, points) {
  return requestPromise({
    uri: dataHandlerApi + '/addBonusPoints',
    qs: {points, uid}
  })
}

function releaseRoom(roomName){
  return requestPromise({
    uri: dataHandlerApi + '/releaseRoom',
    qs: {roomName}
  })
}

module.exports = { reserveHotel, addBonusPoints, releaseRoom }