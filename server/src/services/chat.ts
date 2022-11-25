import {ChatSchema} from "../schema/chat.schema";
import {DataSource, Repository} from "typeorm";


export class ChatService {
    chatRepo: Repository<ChatSchema>

    constructor(db: DataSource) {
        this.chatRepo = db.getRepository(ChatSchema)
    }

    //adds a chat to db
    async create(to: any, from: any) {

        const check = await this.chatRepo.findOneBy({
            user1: to,
            user2: from
        })
        if (!check) {
            return await this.chatRepo.save({
                user1: to,
                user2: from
            })
        }
        return;
    }

    async getUsers(chat: string) {
        const found = await this.chatRepo.findOneBy({id: chat})
        if (!found) {
            return [];
        }
        return [found.user1, found.user2]
    }

    async getAll(user: string) {
        const found: ChatSchema[] = await this.chatRepo.findBy([
            {user1: user},
            {user2: user}
        ])
        return found;
    }

}