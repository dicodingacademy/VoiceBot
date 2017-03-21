function createUserMessage(payload) {
  var msgUser   = payload.user;
  var msgText   = payload.message;
  var msgTS     = payload.ts;
  var msgMoment = moment(msgTS).format('HH:mm:ss a');
  var msgType   = payload.type || 'text';
  var msgPos    = payload.position || (!(payload.user=="Client"));

  var userImg = document.createElement('img');
  userImg.setAttribute('class','img-circle');
  userImg.setAttribute('alt','User Avatar')
  if(!msgPos) userImg.setAttribute('src','http://placehold.it/100/f00/fff.jpg?text=C');
  else userImg.setAttribute('src','http://placehold.it/100/00f/fff.jpg?text=S');

  var chatImg = document.createElement('span');
  if(!msgPos) chatImg.setAttribute('class','chat-img pull-left');
  else chatImg.setAttribute('class','chat-img pull-right');
  chatImg.appendChild(userImg);

  var msgTxt  = document.createElement('p');
  if(msgType=='audio'){
    var msgAudio = document.createElement('audio');
    msgAudio.setAttribute('controls', true);
    msgAudio.setAttribute('autoplay', true);
    msgAudio.setAttribute('src', msgText);
    msgTxt.appendChild(msgAudio);
  } else {
    var message = document.createTextNode(msgText);
    msgTxt.appendChild(message);
  }

  var user    = document.createTextNode(msgUser + " | " + msgMoment);
  var msgTime = document.createElement('div');
  if(!msgPos) msgTime.setAttribute('class','chat-time pull-right');
  else msgTime.setAttribute('class','chat-time pull-left');
  msgTime.appendChild(user);

  var msgBox  = document.createElement('div');
  if(!msgPos) msgBox.setAttribute('class','chat-body left clearfix');
  else msgBox.setAttribute('class','chat-body right clearfix');
  msgBox.appendChild(msgTxt);
  msgBox.appendChild(msgTime);

  var chatBox = document.createElement('li');
  chatBox.setAttribute('id', 'msg'+msgTS);
  chatBox.setAttribute('class','left clearfix');
  chatBox.appendChild(chatImg);
  chatBox.appendChild(msgBox);

  var chatArea = document.querySelector('.chat-area');
  var chatList = document.querySelector('ul');
  chatList.appendChild(chatBox);
  chatArea.scrollTop = chatArea.scrollHeight;
}

var socket = io('/');
socket.on('connect', function () {
  socket.on('replymsg', function (msg) {
    if(msg.type=='audio'){
      textMessage = msg.message;
      msg.message = msg.url;
      createUserMessage(msg);
      var elm     = document.querySelector('#msg'+msg.ts+' .chat-body p');
      var msgBox  = document.createElement('p');
      msgBox.innerHTML = "<i>"+textMessage+"</i>";
      elm.parentNode.insertBefore(msgBox, elm.nextSibling);
    } else createUserMessage(msg);
  });

  socket.on('audiomsg', function (msg) {
    var elm     = document.querySelector('#msg'+msg.ts+' .chat-body p');
    var msgBox  = document.createElement('p');
    msgBox.innerHTML = "<i>"+msg.message+"</i>";
    elm.parentNode.insertBefore(msgBox, elm.nextSibling);
    msg.type = "audio";
    socket.emit('sendmsg', msg);
  });
});

function sendAudioMessage(blob, timestamp){
  var file   = blob;
  var stream = ss.createStream();
  // upload a file to the server.
  ss(socket).emit('audio', stream, {ts: timestamp});
  ss.createBlobReadStream(file).pipe(stream);
}

function sendMessage() {
  var message  = document.getElementById('message');
  var payload = {
    user: "Client",
    message: message.value.trim(),
    ts: (new Date()).getTime()
  };
  createUserMessage(payload);
  socket.emit('sendmsg', payload);
  message.value = "";
};

function enterMsg(event) {
  if(document.getElementById("quickMsg").checked){
    event.preventDefault();
    if (event.keyCode == 13) sendMessage();
  }
};
