"use strict";
exports.__esModule = true;
var http = require("http");
var socket_io_1 = require("socket.io");
require('dotenv').config();
var app = require('express');
var httpServer = http.createServer(app);
var socket = new socket_io_1.Server(httpServer, {});
//
socket.on("connect", function () {
    console.log("Client connected");
});
socket.on("message", function (arg) {
    console.log(arg);
});
httpServer.listen(3000, function () {
    console.log("Listening");
});
