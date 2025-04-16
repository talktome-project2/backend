require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./src/router');
const bodyParser = require('body-parser');
const http = require('http'); // HTTP 서버 모듈 추가
const cors = require('cors');
const { Server } = require("socket.io"); // socket.io 임포트
const chatController = require('./src/api/chat/controller');
const friendController = require('./src/api/friend/controller');

// 사용자 ID와 소켓 ID 매핑 (인증 없이는 신뢰도 낮음)
let userSockets = {};
let socketUsers = {};

// --- Express 및 서버 설정 (기존과 유사) ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 모든 오리진 허용 (개발용)
    methods: ["GET", "POST"]
  }
});

// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log(`사용자 연결됨: ${socket.id}`);

  // 채팅방 참여 이벤트 (사용자 ID 검증 제거)
  socket.on('join_room', (data) => { // data 객체로 userId 등을 받을 수 있음 (선택)
    const { roomId, userId } = data || {}; // 클라이언트가 roomId와 함께 userId를 보낸다고 가정

    console.log('((((((((((((((((((((((((((((((((((((((((((()))))))))))))))))))))))))))))');
    console.log(`jonin room 에 입성~~~~`);
    console.log('((((((((((((((((((((((((((((((((((((((((((()))))))))))))))))))))))))))))');

    if (!roomId) {
        console.error(`[참여 실패] ${socket.id}: roomId가 제공되지 않음`);
        socket.emit('error_message', 'roomId가 필요합니다.');
        return;
    }

    // 연결 시 인증이 없으므로, 이 시점에 user-socket 매핑 시도 (클라이언트가 userId 보낼 경우)
    if (userId) {
        const currentUserId = String(userId);
        console.log(`사용자 ${currentUserId} (소켓 ${socket.id}) 정보 수신됨.`);
        socketUsers[socket.id] = currentUserId;
        if (!userSockets[currentUserId]) {
            userSockets[currentUserId] = new Set();
        }
        userSockets[currentUserId].add(socket.id);
        console.log('현재 사용자 소켓:', userSockets);
    } else {
        console.warn(`[참여] ${socket.id}: userId 없이 방(${roomId}) 참여 시도. 매핑 불가.`);
    }

    socket.join(String(roomId));
    console.log('((((((((((((((((((((((((((((((((((((((((((()))))))))))))))))))))))))))))');
    console.log(`소켓 ${socket.id} 가 방 ${roomId} 에 참여`);
    console.log('((((((((((((((((((((((((((((((((((((((((((()))))))))))))))))))))))))))))');
  });

  // 메시지 전송 이벤트 (인증된 ID 비교 제거)
  socket.on('send_message', async (data) => {
    const { roomId, message, senderId: rawSenderId } = data;

    // roomId, message, senderId 필수 확인
    if (!roomId || !message || rawSenderId === undefined || rawSenderId === null) {
        console.error(`[메시지 실패] ${socket.id}: 필수 정보 누락 (roomId, message, senderId)`);
        socket.emit('error_message', '메시지 전송 실패: 필수 정보 누락');
        return;
    }

    const senderId = String(rawSenderId); // 클라이언트가 보낸 ID 신뢰

    // 메시지 내용 검증
    if (String(message).trim() === '') {
        console.warn(`[메시지 실패] ${senderId}가 빈 메시지 전송 시도 (방: ${roomId})`);
        socket.emit('error_message', '메시지 내용이 비어있습니다.');
        return;
    }

    // 이 시점에 user-socket 매핑 시도 (만약 join_room에서 안했다면)
    if (!socketUsers[socket.id]) {
        console.warn(`[메시지] ${socket.id}: 사용자 ID 매핑 없이 메시지 전송 (senderId: ${senderId})`);
        // 필요하다면 여기서도 매핑 시도
        // socketUsers[socket.id] = senderId;
        // if (!userSockets[senderId]) userSockets[senderId] = new Set();
        // userSockets[senderId].add(socket.id);
    }

    try {
      // 1. 상대방 ID 확인 (클라이언트가 보낸 senderId 사용)
      const recipientId = await chatController.getRecipientId(roomId, senderId);
      console.log('recipientId = ', recipientId);
      if (!recipientId) {
        console.error(`[메시지 실패] ${roomId}: 상대방 ID를 확인할 수 없음 (발신자: ${senderId})`);
        socket.emit('error_message', '메시지 전송 실패: 상대방을 찾을 수 없음');
        return;
      }

      // 2. 상대방 온라인 상태 및 방 참여 여부 확인 (userSockets 매핑 신뢰도 낮음)
      const recipientSocketIds = userSockets[recipientId];
      const roomSockets = io.sockets.adapter.rooms.get(String(roomId));
      let isRecipientOnlineInRoom = false;

      if (recipientSocketIds && roomSockets) {
        for (const sockId of recipientSocketIds) {
          if (roomSockets.has(sockId)) {
            isRecipientOnlineInRoom = true;
            break;
          }
        }
      }

      console.log(`[메시지] 발신: ${senderId}, 수신: ${recipientId}, 방: ${String(roomId)}, 온라인: ${isRecipientOnlineInRoom} (매핑 신뢰도 낮음)`);

      // 3. 온라인/오프라인 처리
      if (isRecipientOnlineInRoom) {
        // 온라인: 메시지 전송 (클라이언트가 보낸 senderId 사용)
        const result = await chatController.saveMessage(roomId, senderId, 1, message);
        console.log('sends message : ', result);
        io.to(String(roomId)).emit('receive_message', result);
        console.log(`[Socket 전송] ${roomId} 방으로 메시지 전송됨.`);
        
      } else {
        const result = await chatController.saveMessage(roomId, senderId, 0, message);
        //const result = '호호호호호호호';
        console.log('sends message : ', result);
        io.to(String(roomId)).emit('receive_message', result);
        console.log(`[Socket 전송] ${roomId} 방으로 메시지 전송됨.`);
        // 오프라인: DB 저장 (클라이언트가 보낸 senderId 사용)
        console.log(`[DB 저장] 상대방(${recipientId}) 부재중 또는 매핑 없음. 메시지를 DB에 저장합니다.`);
        friendController.sendFcmChatMessage(recipientId, message);
        
        // TODO: 발신자에게 저장 알림
      }
       // TODO: 메시지 전송 ACK

    } catch (error) {
      console.error(`[메시지 처리 오류] ${roomId}:`, error);
      socket.emit('error_message', '메시지 처리 중 서버 오류 발생');
    }
  });

  // 연결 종료 처리 (socketUsers 맵 사용)
  socket.on('disconnect', (reason) => {
    const userId = socketUsers[socket.id]; // 연결 시 또는 이벤트 발생 시 매핑된 userId
    console.log(`소켓 연결 끊어짐: ${socket.id}, 추정 사용자: ${userId || '매핑안됨'}, 이유: ${reason}`);
    //socket.off('receive_message');
    if (userId) { // 매핑된 사용자가 있었던 경우
      console.log(`사용자 ${userId} (소켓 ${socket.id}) 연결 해제 시도.`);
      if (userSockets[userId]) {
        userSockets[userId].delete(socket.id);
        if (userSockets[userId].size === 0) {
          delete userSockets[userId];
          console.log(`사용자 ${userId} 모든 소켓 연결 해제됨.`);
        }
      }
      delete socketUsers[socket.id];
      console.log('현재 사용자 소켓:', userSockets);
      // TODO: 유저 퇴장 알림
    } else {
         console.log(`매핑되지 않았던 소켓(${socket.id}) 연결 해제됨.`);
    }
  });

  // 에러 처리
  socket.on('error', (error) => {
    const userId = socketUsers[socket.id] || 'N/A'; // 추정 사용자 ID
    console.error(`소켓 에러 발생: 사용자 ${userId} (소켓 ${socket.id})`, error);
  });
});

// 서버 시작
server.listen(port, () => {
  console.log(`talktome 웹 서버 시작: 포트 = ${port}`);
  console.log(`Socket.IO 서버 실행 중 (인증 없음)`); // 로그 메시지 변경
});