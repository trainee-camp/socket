import {Socket} from "socket.io-client";
import {Request, Response} from "express";

export class ChatController {
    socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    post = async (req: Request, res: Response) => {
        const to = req.params.with
        const from = req.body.user
        this.socket.emit("send chat", to, from)
        return res.send("Sent chat invite")
    }
    getPrerendered = async (req: Request, res: Response) => {
        const chat = req.params.chat
        const opts = req.body
        this.socket.emit("get chat", chat, opts)
        this.socket.on("send chat", async (chat) => {
            return res.status(200).send(await this.renderChat(chat))
        })
    }
    getAll = async (req: Request, res: Response) => {
        this.socket.emit("get chats", req.body.user)
        this.socket.on("send chats", (chats) => {
            return res.status(200).json({chats})
        })
    }
    //todo Will generate the page
    renderChat = async (chat: any) => {
        return chat
    }
}