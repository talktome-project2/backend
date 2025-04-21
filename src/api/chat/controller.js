const WebSocket = require('ws');
const chatRepository = require('./repository');
const { json } = require('body-parser');

exports.roomIndex = async (req, res) => {
    const { page = 1, size = 20 } = req.query;
    const userId = req.user.id;

    try {
        const roomsData = await chatRepository.getRooms(userId, page, size);
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
        //console.log('roomId : ', roomId);
        res.send({result: 'ok', roomId: roomId});
    } catch (error) {
        res.send({result: 'error', data: error.message});
    }
};

// 채팅방에 접속했을 때 미처 수신하지 못한 메시지들을 한 번에 받아올 수 있는 함수
exports.getMissedMessages = async (req, res) => {
    //const { page =1, size = 20 } = req.query;
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const missedMessages = await chatRepository.getMessagesAfter(id, user_id);
        res.send({result: 'ok', data: missedMessages});
    } catch (error) {
        res.send({result: 'error', data: error.message});
    }
};

exports.getRecipientId = async (roomId, senderId) => {
    const user_id = await chatRepository.getRecipientId(roomId, senderId);
    //console.log('user_id => ', user_id);
    return user_id;
}

exports.saveMessage = async (roomId, userId, read_check, content) => {
    return await chatRepository.saveMessage(roomId, userId, read_check, content);
}

exports.deleteRoom = async (req, res) => {
    const { roomId } = req.params;

    try {
        const result0 = await chatRepository.deleteChat(roomId);
        const result1 = await chatRepository.deleteRoom(roomId);
        res.send({result: 'ok', data: result1});
    } catch (error) {
        res.send({result: 'error', data: error.message});
    }
}