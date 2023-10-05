const server = Bun.serve<{ randId: string }>({
    port: 7800,
    fetch(req, server) {
      const url = new URL(req.url);
      if (url.pathname === "/chat") {
        console.log(`upgrade!`);
        const randId = generateRandSocketId();
        const success = server.upgrade(req, { data: { randId } });
        return success
          ? undefined
          : new Response("WebSocket upgrade error", { status: 400 });
      }
  
      return new Response("Hello world");
    },
    websocket: {
      open(ws) {
        // const msg = `${ws.data.username} has entered the chat`;
        ws.subscribe(ws.data.randId);
        // ws.publish("the-group-chat", msg);
        console.log('socket opened', ws);
        ws.send(JSON.stringify({ev: 'conn', data: ws.data.randId}))
        
      },
      message(ws, message) {
        // this is a group chat
        // so the server re-broadcasts incoming message to everyone
        // ws.publish("the-group-chat", `${ws.data.username}: ${message}`);
        const parsedData = JSON.parse(message)
        console.log('data got', message);
        
        console.log(message);
        if (parsedData.ev == 'msg') {
            ws.publish(parsedData.socketId, message)
        }else if (parsedData.ev == 'join-session') {
            ws.subscribe(parsedData.sessionId)
            ws.send(JSON.stringify({ev: 'joined-success', msg: 'You have successfully joined ' + parsedData.sessionId + ' room'}))
            ws.publish(parsedData.sessionId, JSON.stringify({ev: 'user-joined', msg: 'user joined the chat room'}))
        }


      },
      close(ws) {
        // const msg = `${ws.data.username} has left the chat`;
        // ws.unsubscribe("the-group-chat");
        // server.publish("the-group-chat", msg);
      },
    },
  });

  const generateRandSocketId = () => {
    const nums = "abcdefghijklmnopqrstuvwxyz1234567890"
    let randId = ''
    for (let i = 0; i < 8; i++) {
        randId += nums[Math.floor(Math.random() * (nums.length - 1))]
    }
    return randId
  }
  
  console.log(`Listening on ${server.hostname}:${server.port}`);
  