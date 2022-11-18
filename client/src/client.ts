import {createServer} from "http";
import {io} from "socket.io-client";
import * as bodyParser from 'body-parser';
import multer from 'multer';
import {createClient} from "redis";
import {MessageController} from "./controllers/message.controller";
import {ChatController} from "./controllers/chat.controller";


require('dotenv').config()
const express = require('express');

const app = express()
const httpServer = createServer(app)
const socket = io("ws://localhost:3000", {autoConnect: false, reconnection: true})
const msgController = new MessageController(socket)
const chatController = new ChatController(socket)
//Socket connections
socket.on("connect", () => {
    console.log("Connected to server")
})
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
const upload = multer({
    storage: multer.memoryStorage()
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
//Routing for the app
app.post('/:chat', chatController.getPrerendered)
app.post('/chat/:with', chatController.post)
app.get('/chats', chatController.getAll)
app.post("/send/:to", upload.array('img', 10), msgController.postMsg)

//Server startup
const port = process.env.PORT
httpServer.listen(port, () => {
    console.log("Listening on", port)
    socket.auth = {username: process.env.NAME}
    socket.connect()
})