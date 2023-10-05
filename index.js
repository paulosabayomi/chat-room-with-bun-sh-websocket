const chatInput = document.querySelector('#chat-input')
const sock = new WebSocket('ws://127.0.0.1:7800/chat')
const chatBody = document.querySelector('.chat-body')
let mySocketId = ''
let connectedSocketId = ''
const sessionIdInput = document.querySelector('#session-id-input')
const sessionIdBtn = document.querySelector('#session-id-btn')
const msgCont = document.querySelector('.msg-cont')
const mySocketIdEl = document.querySelector('.my-socket-id')

chatInput.onkeyup = (ev) => {
    // console.log(ev);
    const thisInput = ev.currentTarget
    if (ev.key.toLowerCase() == 'enter') {
        console.log(thisInput.value);
        sock.send(JSON.stringify({ev: 'msg', msg: thisInput.value, socketId: connectedSocketId != '' ? connectedSocketId : mySocketId}))
        thisInput.value = ""
    }
}


const handleSocketOpen = (data) => {
    console.log('socket is opened', data);
}

const handleSocketMessage = (data) => {
    console.log('socket got message', data)
    const parsedData = JSON.parse(data.data)

    switch (parsedData.ev) {
        case 'msg':
            // <div class="chat-item">Hi how are you doing?</div>
            const chatItem = document.createElement('div')
            chatItem.className = "chat-item"
            chatItem.innerHTML = parsedData.msg
            chatBody.appendChild(chatItem)
            break;
        
        case 'conn':
            mySocketId = parsedData.data
            mySocketIdEl.innerHTML = mySocketId
            break;
        
        case 'user-joined':
            showMessage(parsedData.msg)
            break;
        
        case 'joined-success':
            showMessage(parsedData.msg)
            break;

    
        default:
            break;
    }
}

const handleSocketError = (data) => {
    console.log('an error occured with the socket', data)
    
}

const handleSocketClose = (data) => {
    console.log('socket has closed', data)
    
}

sessionIdBtn.onclick = (ev) => {
    connectedSocketId = sessionIdInput.value
    sock.send(JSON.stringify({ev: 'join-session', sessionId: sessionIdInput.value}))
}

const showMessage = (msg) => {
    msgCont.innerHTML = msg
    setTimeout(() => {
        msgCont.innerHTML = ''
    }, 2000);
}

sock.addEventListener('open', handleSocketOpen)
sock.addEventListener('message', handleSocketMessage)
sock.addEventListener('error', handleSocketError)
sock.addEventListener('close', handleSocketClose)