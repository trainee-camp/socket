import {DataSource} from "typeorm";

const express = require("express");

interface Startable_Worker {
    start(): Promise<void>
}

export interface dbProvider {
    (sync: boolean, drop: boolean): DataSource
}

export class Base_Worker implements Startable_Worker {
    app
    db

    constructor(app: typeof express, dbConnection: dbProvider) {
        this.app = app
        this.db = dbConnection
    }

    async start() {
        throw new Error("Can't start base worker")
    }
}