import {Request, Response} from "express";
import {createServer} from "http";
import {io} from "socket.io-client";

const app = require('express')()
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
    console.log("new message!",msg)
    messageStore.push(msg)
})

const messageStore : any[] = []

//Routing for the app
app.get('/chat', (_req: Request, res: Response) => {
    res.status(200).json(messageStore)
})

app.get('/chat/:with', async (req: Request, res: Response) => {
    const target = req.params.with
    socket.emit("send chat", target, process.env.NAME)
    res.send("Sent chat invite")
})

app.get("/send/:to", (req: Request, res: Response) => {
    //assemble message data
    const message = {
        sender: process.env.NAME,
        text: "ajsgdfkjshdfjka",
        setAt: Date()
    }
    const receiver = req.params.to
    //send message
    socket.emit("message", receiver, message)
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