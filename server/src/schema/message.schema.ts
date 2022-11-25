import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {ChatSchema} from "./chat.schema";

@Entity()
export class MessageSchema {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("date")
    setAt: string

    @Column()
    sender: string

    @Column("varchar", {nullable: true})
    text: string

    @Column("varchar", {array: true, nullable: true})
    smallImg: string[]

    @Column("varchar", {array: true, nullable: true})
    img: string[]

    @ManyToOne(() => ChatSchema, (chat) => chat.messages, {})
    chat: ChatSchema
}
