import http from "http";
import {Server} from "socket.io";
import {setupWorker} from "@socket.io/sticky";
import {createAdapter} from "@socket.io/redis-adapter";
import {registerHandlers} from "../events/handlers";
import {RedisClientType} from "redis";
import {Base_Worker, dbProvider} from "./base";

const express = require('express');

export class Worker extends Base_Worker {
    redis: RedisClientType;

    constructor(app: typeof express, dbConnection: dbProvider, redisCLient: RedisClientType) {
        super(app, dbConnection);
        this.redis = redisCLient
    }

    async start() {
        const httpServer = http.createServer(this.app);
        const io = new Server(httpServer);
        // setup connection with the primary process
        setupWorker(io);
        //Db
        const ds = await this.db(false, false).initialize()
        //Redis
        const subClient = this.redis.duplicate()
        await Promise.all([this.redis.connect(), subClient.connect()])
        io.adapter(createAdapter(this.redis, subClient))
        //Handle socket connections
        io.on("connect", async (socket) => {
            console.log("connected ", socket.id)
            await registerHandlers(io, socket, this.redis, ds)
            socket.on("disconnect",()=>{
                console.log("Disconnected")
            })
        })
        //Serve static data
        this.app.use('/pics', express.static(String(process.env.PATH_TO_DATA)))
    }
}
