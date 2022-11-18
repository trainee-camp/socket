import cluster from "cluster";
import {connect} from './session.store'

require('dotenv').config()
const app = require('express')()
import {worker_start} from "./clusters/worker";
//Db connect
import dbConnection from "./db.connection";
import http from "http";
import {setupMaster} from "@socket.io/sticky";
import {setupPrimary} from "@socket.io/cluster-adapter";
//Session configuration
const client = connect({url: process.env.REDIS_URL})
//Clusters
if (cluster.isMaster) {
    const numCPUs = require("os").cpus().length;
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
    console.log(`Worker ${process.pid} started on ${process.env.PORT}`);
    worker_start(app, client, dbConnection)
}






