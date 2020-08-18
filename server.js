const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server); //install socket.io
const { ExpressPeerServer } = require("peer"); //Importing peer server => to communicate
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidv4 } = require("uuid"); // install uuid package -> Create unique id for each room

app.use("/peerjs", peerServer); //Url -> Peer to peer communicate

app.set("view engine", "ejs");
app.use(express.static("public")); //Url-> importing the public folder to use script.js file

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//each Socket in Socket.IO is identified by a random, unguessable,
//unique identifier Socket#id. For your convenience,
//each socket automatically joins a room identified by its own id.

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);
