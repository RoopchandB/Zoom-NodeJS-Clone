//Importing socket
const socket = io("/");

//To add the video

const videoGrid = document.getElementById("video-grid");

//To play the video
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;

//Creating a new peer connection
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

//To access video and audio

const peers = {};
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    //adding the video to stream
    addVideoStream(myVideo, stream);

    //Answer the call
    peer.on("call", (call) => {
      call.answer(stream); // Answer the call
      const video = document.createElement("video"); // create a new video element for the new user
      call.on("stream", (userVideoStream) => {
        // Show stream in some video/canvas element.
        addVideoStream(video, userVideoStream); // Adding the new user to my stream
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    // input value
    let text = $("input");
    // when press enter send message
    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        // console.log(text.val());
        socket.emit("message", text.val()); //sending the value of the input
        text.val(""); //set the input value to empty
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`); // This message is coming from the server
      scrollToBottom();
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

//Peer generates automatic id's for the user
peer.on("open", (id) => {
  //Join the room with specific room id
  socket.emit("join-room", ROOM_ID, id);
});

//Making a call
const connectToNewUser = (userId, stream) => {
  var call = peer.call(userId, stream); // call the new user and send the user my stream and connect to my stream
  const video = document.createElement("video"); // create a new video element for the new user
  call.on("stream", (userVideoStream) => {
    // Show stream in some video/canvas element.
    addVideoStream(video, userVideoStream); // Adding the new user to my stream
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};
//Adding the functionality of streaming a video

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

//Scroll Down function
const scrollToBottom = () => {
  var d = $(".main__chatWindow");
  d.scrollTop(d.prop("scrollHeight"));
};

//Mute the video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

//Stop the video
const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

//setMuteButton
const setMuteButton = () => {
  const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `;
  document.querySelector(".main__muteButton").innerHTML = html;
};

//setUnmuteButton
const setUnmuteButton = () => {
  const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `;
  document.querySelector(".main__muteButton").innerHTML = html;
};

//setStopVideo
const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `;
  document.querySelector(".main__videoButton").innerHTML = html;
};

//setPlayVideo
const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `;
  document.querySelector(".main__videoButton").innerHTML = html;
};
