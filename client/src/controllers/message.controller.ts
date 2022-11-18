import {Response, Request} from "express";
import {randomUUID} from "crypto";
import {Socket} from "socket.io-client";

export class MessageController {
    socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    postMsg = async (req: Request, res: Response) => {
        //assemble message data
        const date = new Date()
        const message = {...req.body, setAt: date.toLocaleDateString(), img: []}
        const receiver = req.params.to
        //upload files
        if (req.files) {
            (req.files as Array<Express.Multer.File>).forEach(file => {
                file.originalname = file.originalname.replace(/.*\./, randomUUID() + '.')
                message.img.push(file.originalname)
                this.socket.emit("upload", file)
            })
        }
        //send message
        this.socket.emit("message", receiver, {...message})
        //
        const response = "Sent message to " + receiver + " from " + message.sender
        res.send(response)
    }
}