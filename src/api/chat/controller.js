const WebSocket = require('ws');
const chatRepository = require('./repository');
const { json } = require('body-parser');
let wss;

exports.setWss = (webSocketServer) => {
    wss = webSocketServer;
}

exports.roomIndex = async (req, res) => {
    //const { page = 1, size = 20 } = req.query;
    const userId = req.user.id;

    try {
        const roomsData = await chatRepository.getRooms(userId);
        res.send({result: 'ok', data: roomsData});
    } catch (error) {
        res.send({result: 'error', data: error.message});
    }
};

// 채팅버튼을 누르면 채팅룸이 생성되거나 채팅방이 있는경우 해당 채팅방에 입장 
exports.enterRoom = async (req, res) => {
    const {partnerId} = req.body;
    const userId = req.user.id;
    try {
        const roomId = await chatRepository.enterRoom(userId, partnerId);
        console.log('roomId : ', roomId);
        res.send({result: 'ok', roomId: roomId});
    } catch (error) {
        res.send({result: 'error', data: error.message});
    }
};

//index.js 에서 사용하는 웹 소캣 메시지가 수신되었을 때의 처리 함수
exports.handleMessage = async (mews, partnerws, user, message) => {
    const { roomId, content } = message;

    try {
        // 메시지 저장
        const saveMessage = await chatRepository.saveMessage(roomId, user.id, content);  
        // 해당 메시지를 다시 전송
        sendMessageToClient(mews, partnerws, saveMessage);
    } catch (error) {
        console.error('Error handling message : ', error);
    }
};

const sendMessageToClient = (mews, partnerws, message) => {
    console.log('sendMessageToClient : ', message);
    if(mews && mews.readyState === WebSocket.OPEN) {
        console.log('enter mews && OPEN');
        mews.send(JSON.stringify(message));
    }
    if(partnerws && partnerws.readyState === WebSocket.OPEN) {
        console.log('enter partnerws && OPEN');
        partnerws.send(JSON.stringify(message));
    }
};

// 채팅방에 접속했을 때 미처 수신하지 못한 메시지들을 한 번에 받아올 수 있는 함수
exports.getMissedMessages = async (req, res) => {
    const { page =1, size = 20 } = req.query;
    const { id } = req.params;

    try {
        const missedMessages = await chatRepository.getMessagesAfter(id, page, size);
        res.send({result: 'ok', data: missedMessages});
    } catch (error) {
        res.send({result: 'error', data: error.message});
    }
};