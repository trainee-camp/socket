import {createServer} from "http";
import {io} from "socket.io-client";
import * as bodyParser from 'body-parser';
import {createClient} from "redis";
import {buildRoutes} from "./router";

require('dotenv').config()
const express = require('express');

const app = express()
const httpServer = createServer(app)
const socket = io(String(process.env.WS_SERVER_PORT), {autoConnect: true, reconnection: true})

//Socket connections
//BUG: occasionally : "CONNECT" fired on client but no connection on server when using clusters
socket.on("connect", () => {
    console.log("Connected to server")
})
socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});
//Get a chat room invite notification
socket.on("accept chat", (arg) => {
    console.log("Chat invite\n", arg)
})
//Get a message from a chatroom
socket.on("message", (msg) => {
    console.log("new message!", msg)
    messageStore.set(msg.id, msg)
})

const messageStore = createClient({url: process.env.REDIS_URL})

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
//Routing for the app
app.use(buildRoutes(socket))

//Server startup
const port = process.env.PORT
httpServer.listen(port, () => {
    console.log("Listening on", port)
})