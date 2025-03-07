require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./src/router');
const bodyParser = require('body-parser');
const http = require('http'); // HTTP 서버 모듈 추가
const WebSocket = require('ws');
const chatController = require('./src/api/chat/controller')
const jwt = require('jsonwebtoken');

// JSON 형식의 데이터 처리
app.use(bodyParser.json());
// URL 인코딩된 데이터 처리
app.use(bodyParser.urlencoded({ extended: true }));

// 라우터를 애플리케이션에 등록
app.use('/', router);

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성 및 설정
const wss = new WebSocket.Server({ server });

// WebSocket 서버 설정을 controller에 전달
chatController.setWss(wss);

const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('클라이언트 접속');
  const myId = new URL(req.url, 'http://${req.headers.host}').searchParams.get('id');
  if(!myId) {
    ws.close();
    return;
  }
  clients.set(myId, ws);

  console.log(`마이 아이디는 무엇 : ${myId}`);


  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    console.log(parsedMessage);
    jwt.verify(parsedMessage.token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        console.log('에러 땜시 소캣 종료야');
          ws.close();
      } else {
        // decoded : user 정보 
        const { partnerId } = parsedMessage;
        const wsPartner = clients.get(partnerId);

        chatController.handleMessage(ws, wsPartner, decoded, parsedMessage);
      }
    });
  });
  ws.on('close', () => {
    console.log('소켓이 종료 하였음...종료 id : ', myId);
    clients.delete(myId);
  });
});

// 서버 시작
server.listen(port, () => {
  console.log(`talktome 웹서버 구동 : port = ${port}`);
});