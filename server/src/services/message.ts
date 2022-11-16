import {MessageSchema} from "../schema/message.schema";
import dbConnection from "../db.connection";

const msgRepo = dbConnection.getRepository(MessageSchema)

export class MessageService {
    post = async function (msg: any, chat: any) {
        await msgRepo.save({
            ...msg,
            chat: {
                id: chat
            }
        })
    }
}