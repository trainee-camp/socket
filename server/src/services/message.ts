import {MessageSchema} from "../schema/message.schema";
import {Between, DataSource, Repository} from "typeorm";
import {ChatSchema} from "../schema/chat.schema";
import {Message_IF} from "../interfaces/message.if";


export class MessageService {
    msgRepo: Repository<MessageSchema>
    chatRepo: Repository<ChatSchema>

    constructor(db: DataSource) {
        this.msgRepo = db.getRepository(MessageSchema)
        this.chatRepo = db.getRepository(ChatSchema)
    }

    async post(msg: Message_IF, chat: string) {
        const cht = await this.chatRepo.findOne({
            where: {
                id: chat
            }, relations: {
                messages: true
            }
        })
        const message = this.msgRepo.create(msg)
        if (!cht) {
            return;
        }
        cht.messages.push(<MessageSchema><unknown>message)
        await this.chatRepo.save(cht)
    }

    //gets a set slice of messages from the whole chat history
    async getSomeForChat(chat: string, opts: { date: string }) {
        const date = new Date(opts.date)
        const toDate = new Date(opts.date)
        toDate.setUTCDate(date.getDate() + 10)
        return await this.msgRepo.find({
            where: {
                setAt: Between(formatDate(date), formatDate(toDate)),
                chat: {
                    id: chat
                }
            }, relations: {
                chat: true
            }
        })
    }
}

function formatDate(date: Date) {
    return date.toISOString().replace(/T.*/, '')
}