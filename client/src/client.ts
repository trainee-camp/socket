import {Request, Response} from "express";
import {createServer} from "http";
import {io} from "socket.io-client";
import * as bodyParser from 'body-parser';
import multer from 'multer';
import {randomUUID} from "crypto";
import {connect} from "./messageStore";

require('dotenv').config()
const express = require('express');

const app = express()
const httpServer = createServer(app)
const socket = io("ws://localhost:3000", {autoConnect: false, reconnection: true})

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

const messageStore = connect(process.env.REDIS_URL)
const upload = multer({
    storage: multer.memoryStorage()
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
//Routing for the app
app.get('/chat', (_req: Request, res: Response) => {
    res.status(200).json(messageStore)
})

app.get('/chat/:with', async (req: Request, res: Response) => {
    const target = req.params.with
    socket.emit("send chat", target, process.env.NAME)
    res.send("Sent chat invite")
})

app.post("/send/:to", upload.array('img', 10), async (req: Request, res: Response) => {
    //assemble message data
    const message = {...req.body, img: []}
    const receiver = req.params.to
    //upload files
    if (req.files) {
        (req.files as Array<Express.Multer.File>).forEach(file => {
            file.originalname = file.originalname.replace(/.*\./, '.' + randomUUID())
            message.img.push(file.originalname)
            socket.emit("upload", file)
        })
    }
    //send message
    socket.emit("message", receiver, {...message})
    //
    const response = "Sent message to " + receiver + " from " + message.sender
    res.send(response)
})

//Server startup
const port = process.env.PORT
httpServer.listen(port, () => {
    console.log("Listening on", port)
    socket.auth = {username: process.env.NAME}
    socket.connect()
})