import * as http from "http";
import {Emitter} from '@socket.io/redis-emitter'
import {createAdapter} from "@socket.io/redis-adapter";
import cluster from "cluster";
import {setupMaster, setupWorker} from "@socket.io/sticky";
import {setupPrimary} from "@socket.io/cluster-adapter";
import {Server} from "socket.io";
import {MessageService} from "./services/message";
import {ChatService} from "./services/chat";
import {connect} from './session.store'

require('dotenv').config()
const app = require('express')()
//Connect to DB
import dbConnection from "./db.connection";
//services instantiation
const chatService = new ChatService()
const msgService = new MessageService()
//Session configuration
const client = connect({url: process.env.REDIS_URL})
//Clusters
const numCPUs = require("os").cpus().length;
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    const httpServer = http.createServer();
    // setup sticky sessions
    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection",
    });
    // setup connections between the workers
    setupPrimary();
    cluster.setupMaster();
    //Server startup
    const port = process.env.PORT
    httpServer.listen(port)
    //fork clusters
    for (let i = 0; i < numCPUs/2; i++) {
        cluster.fork();
    }
    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    (async function worker_start() {
        console.log(`Worker ${process.pid} started on ${process.env.PORT}`);
        const httpServer = http.createServer(app);
        //socket.io
        const io = new Server(httpServer);
        //Db
        await dbConnection.initialize()
        //Redis
        await client.connect()
        const subClient = client.duplicate()
        const emitter = new Emitter(client)
        const session = client
        // setup connection with the primary process
        setupWorker(io);
        //Adapter handling
        io.adapter(createAdapter(client, subClient))
        io.of("/").adapter.on("create-room", (room) => {
            console.log(`room ${room} was created`);
        });
        io.of("/").adapter.on("join-room", (room, id) => {
            console.log(`socket ${id} has joined room ${room}`);
        });
        //Socket connections
        io.on("connection", async (socket) => {

            console.log("Emitting in general on", process.pid)
            emitter.emit("message", "AAAAAAAAAAAAAAAA")

            const sessionKey = socket.handshake.auth.username
            console.log("Client connected with name ", sessionKey, " on ", process.pid)
            await session.set(sessionKey, socket.id)

            //Client requesting to create a chat room with another client
            socket.on("send chat", async (receiver, sender) => {
                const chatId = await chatService.create(receiver, sender)
                if (chatId) {
                    //Send to other client
                    const receiver_room = await session.get(receiver)
                    if (receiver_room) {
                        emitter.to(receiver_room).emit("accept chat", chatId)
                        console.log("Created new chat")
                    }
                }
            })
            //Client sending message to a room
            socket.on("message", async (room, message) => {
                console.log("Got message to room ", room, " from ", message.sender)
                //Log message to db
                await msgService.post(message, room)
                //Add users to the room if not already in (possible to send message to each sockets default room though, no real need to create one, but whatever)
                if (!socket.rooms.has(room)) {
                    const users = await chatService.getUsers(room)
                    const sockets = await Promise.all(users.map(user => session.get(user!)))
                    sockets.forEach(socket => {
                        io.sockets.sockets.get(socket!)?.join(room)
                    })
                }
                //Retranslate message to the chat room
                emitter.to(room).emit("message", message)
                console.log("Retranslated message to the group")
            })
        })
    }())

}






