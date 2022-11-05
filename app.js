// http 서버 설정
const express = require("express");
const app = express();

app.use(express.static("public"));

app.listen(8000, () => {
  console.log(`listening on port 8000`);
});

// 웹소켓 서버 설정
const WebSocket = require("ws");
const { insertChattingLog } = require("./src/config/db-command");
const wss = new WebSocket.Server({ port: 8001 });

// broadcast : 클라이언트에게 송신
wss.broadcast = (message) => {
  wss.clients.forEach((client) => {
    client.send(message.toString());
  });
};

// 웹소켓 서버(wss) 연결 이벤트
wss.on("connection", (ws, req) => {
  wss.broadcast(`새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`);

  // 연결 시 송신
  console.log(`접속`);

  // 클라이언트(ws) 데이터 수신 이벤트
  ws.on("message", (log) => {
    const logInfo = log.toString().split("%");
    const nickname = logInfo[0];
    const message = logInfo[1];
    wss.broadcast(`${nickname}: ${message}`);
    insertChattingLog(nickname, message);
  });

  ws.on("close", () => {
    wss.broadcast(`유저 한명이 떠났습니다. 현재 유저 ${wss.clients.size} 명`);
    console.log(`접속해제`);
  });
});
