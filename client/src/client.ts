import {Request, Response} from "express";
import {createServer} from "http";
import {io} from "socket.io-client";
import * as bodyParser from 'body-parser';
import multer from 'multer';
import {randomUUID} from "crypto";

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
    messageStore.push(msg)
})

const messageStore: any[] = []
const upload = multer({dest: '/uploads'})
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

app.post("/send/:to", upload.array('img'), async (req: Request, res: Response) => {
    //assemble message data
    const message = req.body.formData || {
        sender: process.env.NAME,
        text: "ajsgdfkjshdfjka",
        setAt: Date(),
        img: []
    }
    const receiver = req.params.to
    //upload files
    if (req.files) {
        for (const file of <File[]><unknown>req.files) {
            const nufile = {...file, name: randomUUID()}
            socket.emit("upload", nufile)
        }
    }
    //send message
    socket.emit("message", receiver, {...message})
    //
    const response = "Sent message to " + receiver + " from " + message.sender
    console.log(response)
    res.send(response)
})

//Server startup
const port = process.env.PORT
httpServer.listen(port, () => {
    console.log("Listening on", port)
    socket.auth = {username: process.env.NAME}
    socket.connect()
})