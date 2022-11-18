import {MessageSchema} from "../schema/message.schema";
import dbConnection from "../db.connection";
import {Between} from "typeorm";
import {ChatSchema} from "../schema/chat.schema";

const msgRepo = dbConnection.getRepository(MessageSchema)
const chatRepo = dbConnection.getRepository(ChatSchema)

export class MessageService {
    post = async function (msg: any, chat: any) {
        const cht = await chatRepo.findOne({
            where: {
                id: chat
            }, relations: {
                messages: true
            }
        })
        //wtf why does it return an array ??
        const message = msgRepo.create(msg)
        if (!cht) {
            return;
        }
        cht.messages.push(<MessageSchema><unknown>message)
        await chatRepo.save(cht)
    }
    //gets a set slice of messages from the whole chat history
    getSomeForChat = async (chat: string, opts: any) => {
        const date = new Date(opts.date)
        const toDate = new Date(opts.date)
        toDate.setUTCDate(date.getDate()+10)
        const found = await msgRepo.find({
            where: {
                setAt: Between(date.toISOString().replace(/T.*/,''), toDate.toISOString().replace(/T.*/,'')),
                chat: {
                    id: chat
                }
            }, relations: {
                chat: true
            }
        })
        return found
    }
}