import {Router,Response,Request} from "express";
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

    app.post('/:chat', chatController.getPrerendered)
    app.post('/chat/:with', chatController.post)
    app.get('/chats', chatController.getAll)
    app.post("/send/:to", upload.array('img', 10), msgController.postMsg)
    app.get('/pics/:pic', (req: Request, res: Response) => {
        res.redirect(process.env.HTTP_SERVER_PORT + req.params.pic)
    })

    return app
}

