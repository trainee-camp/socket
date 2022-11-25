import http from "http";
import {setupMaster} from "@socket.io/sticky";
import {setupPrimary} from "@socket.io/cluster-adapter";
import cluster from "cluster";
import {Base_Worker, dbProvider} from "./base";

const express = require("express");

export class Master extends Base_Worker {
    constructor(app: typeof express, dbConnection: dbProvider) {
        super(app, dbConnection);
    }

    async start() {
        const numCPUs = require("os").cpus().length;
        const httpServer = http.createServer();
        //Serve static data
        this.app.use('/pics', express.static(String(process.env.PATH_TO_DATA)))
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
        await this.db(true, !!process.env.DROP_DB).initialize()
        //fork clusters
        for (let i = 0; i < numCPUs / 2; i++) {
            cluster.fork();
        }
        cluster.on("exit", (worker) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster.fork();
        });
    }
}