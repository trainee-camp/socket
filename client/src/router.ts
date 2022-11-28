import {Router, Response, Request} from "express";
import {MessageController} from "./controllers/message.controller";
import {ChatController} from "./controllers/chat.controller";
import multer from "multer";
import {Socket} from "socket.io-client";
import Validator from "./validators/Validator";

export function buildRoutes(socket: Socket): Router {
    const msgController = new MessageController(socket)
    const chatController = new ChatController(socket)
    const validator = new Validator()
    const app = Router()
    const upload = multer({
        storage: multer.memoryStorage()
    })

    const endpointObj = {
        '/chat/:id': [validator.to, validator.options, chatController.getPrerendered],
        '/invite/:with': [validator.to, validator.from, chatController.post],
        '/chats': [validator.from, chatController.getAll],
        '/send/:to': [upload.array('img', 10), validator.message, msgController.postMsg],
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

