import http from "http";
import {Server} from "socket.io";
import {setupWorker} from "@socket.io/sticky";
import {createAdapter} from "@socket.io/redis-adapter";
import {registerHandlers} from "../events/handlers";

const express = require('express');

export async function worker_start(expressapp: any, redisclient: any, dbConnection: any) {

    const httpServer = http.createServer(expressapp);
    const io = new Server(httpServer);
    // setup connection with the primary process
    setupWorker(io);
    //Db
    await dbConnection.initialize()
    //Redis
    const subClient = redisclient.duplicate()
    await Promise.all([redisclient.connect(), subClient.connect()])
    io.adapter(createAdapter(redisclient, subClient))
    //Handle socket connections
    io.on("connection", async (socket) => {
        console.log("connected ", socket.id)
        await registerHandlers(io, socket, redisclient)
    })
    //Serve static data
    expressapp.use('/pics', express.static(String(process.env.PATH_TO_DATA)))
}