import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {MessageSchema} from "./message.schema";

@Entity()
export class ChatSchema {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({nullable:false})
    user1: string

    @Column({nullable:false})
    user2: string

    @OneToMany(() => MessageSchema, (message) => message.chat, {
        cascade:true
    })
    messages: MessageSchema[]
}


