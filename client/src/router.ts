import {Router, Response, Request} from "express";
import {MessageController} from "./controllers/message.controller";
import {ChatController} from "./controllers/chat.controller";
import multer from "multer";
import {Socket} from "socket.io-client";

export function buildRoutes(socket: Socket): Router {
    const msgController = new MessageController(socket)
    const chatController = new ChatController(socket)
    const app = Router()
    const upload = multer({
        storage: multer.memoryStorage()
    })

    const endpointObj = {
        '/chat/:id': [chatController.getPrerendered],
        '/invite/:with': [chatController.post],
        '/chats': [chatController.getAll],
        '/send/:to': [upload.array('img', 10), msgController.postMsg],
        '/pics/:pic': [async (req: Request, res: Response) => {
            return res.redirect(process.env.HTTP_SERVER_PORT + '/pics/' + req.params.pic)
        }]
    }
    Object.keys(endpointObj).forEach(key => {
        app.post(key, ...endpointObj[key as keyof typeof endpointObj])
        console.log(`Mounted route POST: ${key}`)
    })

    return app
}

