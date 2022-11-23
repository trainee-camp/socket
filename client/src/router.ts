import {Router, Response, Request} from "express";
import {MessageController} from "./controllers/message.controller";
import {ChatController} from "./controllers/chat.controller";
import multer from "multer";

export function buildRoutes(socket: any) {
    const msgController = new MessageController(socket)
    const chatController = new ChatController(socket)
    const app = Router()
    const upload = multer({
        storage: multer.memoryStorage()
    })
    const routeObj = {
        getChat: '/:chat',
        chatWith: '/chat/:with',
        getChats: '/chats',
        sendMsg: '/send/:to',
        getPics: '/pics/:pic'


    }
    app.post(routeObj.getChat, chatController.getPrerendered)
    app.post(routeObj.chatWith, chatController.post)
    app.get(routeObj.getChats, chatController.getAll)
    app.post(routeObj.sendMsg, upload.array('img', 10), msgController.postMsg)
    app.get(routeObj.getPics, (req: Request, res: Response) => {
        res.redirect(process.env.HTTP_SERVER_PORT + req.params.pic)
    })

    return app
}

