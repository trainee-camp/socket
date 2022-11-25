import cluster from "cluster";
import connect from './session.store'

require('dotenv').config()
const app = require('express')()
//Db connect
import {RedisClientType} from "redis";
import {Master} from "./clusters/master";
import Connect from "./db.connection";
import {Worker} from "./clusters/worker";

const client = connect({url: String(process.env.REDIS_URL)});
//Clusters
(async function main() {
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);
        const master = new Master(app, Connect)
        await master.start()
    } else {
        console.log(`Worker ${process.pid} started on ${process.env.PORT}`);
        const worker = new Worker(app, Connect, client as RedisClientType)
        await worker.start()
    }
})()







