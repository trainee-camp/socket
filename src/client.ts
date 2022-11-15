import {Request, Response} from "express";
import {createServer} from "http";
import {io} from "socket.io-client";

const app = require('express')()
const httpServer = createServer(app)
const socket = io("ws://localhost:3000", {reconnection: true})

socket.on("connect", () => {
    console.log("Connected to server")
})
socket.on("message", (arg1, arg2) => {
    console.log("new message!")
    if(!base[arg1]){
        base[arg1]=[]
    }
    base[arg1].push(arg2)
})

const base: any = {}

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({chat: base})
})

app.get("/send", (_req: Request, res: Response) => {
    const message = {
        author: "Abobus",
        payload: "ajsgdfkjshdfjka"
    }
    const receiver = "Gebebus"

    socket.emit("message", receiver, message)

    console.log("Sent message to ", receiver, " from ", message.author)
    res.send("Sent message to " + receiver + " from " + message.author)
})

httpServer.listen(process.env.PORT,()=>{
    console.log("Listening on ",process.env.PORT)
})