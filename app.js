const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

/*
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
    res.sendFile(__dirname + "/style.css");
});
*/

//connected socket array
//format is for each index is (socketid, "hexcolour")
var socketObj = {};

io.on("connection", (socket) => {
    console.log(`user ${socket.id} connected from ${socket.handshake.address}`);
    
    //sends socketid to client
    io.to(socket.id).emit("sendID", socket.id);

    //sends list of connected sockets to newly connected socket
    io.to(socket.id).emit("loadCubes", socketObj);

    //adds connecting socket to array
    socket.on("sendColour", (color) => {
        socketObj[socket.id] = color;
        //signals new socket to connected sockets
        socket.broadcast.emit("newCube", socket.id, color);
    });

    //asking sockets to send their current locations when a new socket joins
    socket.broadcast.emit("posReq");

    socket.on("updateServer", (position) => {
        socket.broadcast.emit("updateSockets", socket.id, position);
    });

    //on colourChange
    socket.on("colourChangeTOSERVER", (color) => {
        socket.broadcast.emit("colourChangeTOCLIENT", socket.id, color);
        socketObj[socket.id] = color;
    });

    socket.on("disconnect", (reason) => {
        console.log(`user ${socket.id} disconnected (reason: ${reason})`);
        socket.broadcast.emit("cubeDisconnect", socket.id);
        delete socketObj[socket.id];
    });

});

server.listen(80, () => {
    console.log("listening on *:80");
});

