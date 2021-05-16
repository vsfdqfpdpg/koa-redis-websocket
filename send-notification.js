const {io} = require("socket.io-client");

const socket = io("ws://localhost:3000");

socket.on("connect", () => {
    console.log(socket.id + " command line");
    socket.emit("app:notifications:cli", "This message is from cli");
});

socket.on("disconnect", () => {
    console.log("Socket closed.")
});

