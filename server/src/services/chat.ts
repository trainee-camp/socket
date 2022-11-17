import {ChatSchema} from "../schema/chat.schema";
import dbConnection from "../db.connection";

const chatRepo = dbConnection.getRepository(ChatSchema)

export class ChatService {
    //adds a chat to db
    create = async function (to: any, from: any) {

        const check = await chatRepo.findOneBy({
            user1: to,
            user2: from
        })
        if (!check) {
            return await chatRepo.save({
                user1: to,
                user2: from
            })
        }
        return;
    }
    getUsers = async function (chat: string) {
        const found = await chatRepo.findOneBy({id: chat})
        if (!found) {
            return [];
        }
        return [found.user1, found.user2]
    }
    //gets a set slice of messages from the whole chat history
    getSomeMessages = async function () {

    }
}