import http from "http";
import {Server} from "socket.io";
import {setupWorker} from "@socket.io/sticky";
import {createAdapter} from "@socket.io/redis-adapter";
import {promises as fs} from "fs";
import path from "path";
import {ChatService} from "../services/chat";
import {MessageService} from "../services/message";

export async function worker_start(expessapp: any, redisclient: any, dbConnection: any) {
    const chatService = new ChatService()
    const msgService = new MessageService()
    const httpServer = http.createServer(expessapp);
    const io = new Server(httpServer);
    // setup connection with the primary process
    setupWorker(io);
    //Db
    await dbConnection.initialize()
    //Redis
    const subClient = redisclient.duplicate()
    await Promise.all([redisclient.connect(), subClient.connect()])
    io.adapter(createAdapter(redisclient, subClient))
    const session = redisclient
    //Handle socket connections
    io.on("connection", async (socket) => {
        console.log("connected ", socket.id)
        const sessionKey = socket.handshake.auth.username
        await session.set(sessionKey, socket.id)

        //Client requesting to create a chat room with another client
        socket.on("send chat", async (receiver: any) => {
            const sender = sessionKey
            const chatId = await chatService.create(receiver, sender)
            if (!chatId) {
                return;
            }
            //Send to other client
            const receiver_room = await session.get(receiver)
            if (receiver_room) {
                io.to(receiver_room).emit("accept chat", chatId)
            }
        })
        //Get chat and a first bunch of messages
        socket.on("get chat", async (chat, opts) => {
            const response = await msgService.getSomeForChat(chat, opts)
            socket.emit("send chat", response)
        })
        //Get all chats for a user
        socket.on("get chats", async () => {
            const user = sessionKey
            const chats = await chatService.getAll(user)
            if (chats.length) {
                socket.emit("send chats", chats)
            }
        })
        //Client sending message to a room
        socket.on("message", async (room: any, message: any) => {
            //Log message to db
            await msgService.post(message, room)
            //Wait for file upload, save them to disk
            //Add users to the room if not already in (possible to send message to each sockets default room though, no real need to create one, but whatever)
            if (!socket.rooms.has(room)) {
                const users = await chatService.getUsers(room)
                const sockets = await Promise.all(users.map(user => {
                    return {
                        user: user, id: session.get(user)
                    }
                }))
                sockets.forEach(sock => {
                    if (socket.handshake.auth.username === sock.user) {
                        io.in(String(sock.id)).local.socketsJoin(room)
                    } else {
                        io.in(String(sock.id)).socketsJoin(room)
                    }
                })
            }
            //Retranslate message to the chat room

            io.to(room).emit("message", message)
        })
        //Client uploads images to server
        socket.on("upload", async (file) => {
            await fs.writeFile(path.join(String(process.env.PATH_TO_DATA), file.originalname), file.buffer)
        })
    })
}