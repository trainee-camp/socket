import * as http from "http";
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
    for (let i = 0; i < numCPUs / 2; i++) {
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
        // setup connection with the primary process
        setupWorker(io);
        //Db
        await dbConnection.initialize()
        //Redis
        const subClient = client.duplicate()
        await Promise.all([client.connect(), subClient.connect()])
        io.adapter(createAdapter(client, subClient))
        // client.connect()
        const session = client
        //Socket connections
        io.on("connection", async (socket) => {

            const sessionKey = socket.handshake.auth.username
            await session.set(sessionKey, socket.id)

            //Client requesting to create a chat room with another client
            socket.on("send chat", async (receiver, sender) => {
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
            //Client sending message to a room
            socket.on("message", async (room, message) => {
                //Log message to db
                await msgService.post(message, room)
                //Add users to the room if not already in (possible to send message to each sockets default room though, no real need to create one, but whatever)
                if (!socket.rooms.has(room)) {
                    const users = await chatService.getUsers(room)
                    for (const user of users) {
                        const socket_id = await session.get(user)
                        if (socket.handshake.auth.username === user) {
                            io.in(String(socket_id)).local.socketsJoin(room)
                        } else {
                            io.in(String(socket_id)).socketsJoin(room)
                        }
                    }
                }
                //Retranslate message to the chat room
                io.to(room).emit("message", message)
            })
        })
    }())

}






