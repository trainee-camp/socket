import {Message_IF} from "./message.if";

export interface Chat_IF{
    id: string;
    user1: string;
    user2: string;
    messages?: Message_IF[]
}