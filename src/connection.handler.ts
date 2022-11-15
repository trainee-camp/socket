import {isMainThread, workerData, parentPort} from 'worker_threads'

console.log(isMainThread, '\n', workerData)
parentPort?.postMessage("worker working")
const socket = workerData
socket.on("message", (arg1: any, arg2: any) => {
    const room = arg1 + arg2.author
    console.log("Got message", room)
    socket.join(room)
    socket.emit("message", arg1, arg2)
    console.log("Retranslated message")
})