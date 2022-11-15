import * as http from "http";
import {Server} from "socket.io";

require('dotenv').config()
const app = require('express')()
const httpServer = http.createServer(app)
const socket = new Server(httpServer, {});
import {Worker} from 'worker_threads'

//
socket.on("connection", (socket) => {
    console.log("Client connected")
    //create new worker
    const worker = new Worker('./connection.handler.ts', {
        workerData: socket
    })
    worker.on('error', err => {
        console.log(err)
    })
    worker.on('message', msg => {
        console.log(msg)
    })
    worker.on('exit', () => {
        console.log('Worker finished')
    })
})


httpServer.listen(3000, () => {
    console.log("Listening")
})



