"use strict";
exports.__esModule = true;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var app = require('express');
var httpServer = (0, http_1.createServer)(app);
var socket = new socket_io_1.Server(httpServer, {});
var base = [];
app.get('/', function (res) {
    res.status(200).json({ chat: base });
});
app.get("/send", function () {
    var message = {
        author: "Abobus",
        payload: "ajsgdfkjshdfjka"
    };
    var receiver = "Gebebus";
    socket.emit("message", message.author + receiver, function () {
        console.log("Sent message to ", receiver, " from ", message.author);
    });
});
httpServer.listen(3000);
