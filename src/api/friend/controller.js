const repository = require('./repository');
const send = require('../../sendNotification');

exports.getMemberInfo = async (req, res) => {
    const userId = req.params.id;
    const item = await repository.getMemberInfo(userId);

    res.json({result: 'ok', data: item});
}

// 본인의 모든 친구들을 리턴
exports.getAcceptFriendList = async (req, res) => {
    const userId = req.user.id;
    const {page = 1, size = 20} = req.query;
    //const items = await repository.getAcceptMeFriendList(userId);
    //const items2 = await repository.getAcceptOtherFriendList(userId);
    //const merge = items.concat(items2);
    const items = await repository.getAcceptFriendList(userId, page, size);

    const mItems = items.map(item => ({...item, is_me: (userId == item.id)}));

    res.json({result: 'ok', data: items});
}

exports.getSendFriendList = async (req, res) => {
    const userId = req.user.id;
    const {page = 1, size = 20} = req.query;
    const items = await repository.getSendFriendList(userId, page, size);
    console.log('getSendFriendList items : ', items);
    const mItems = items.map(item => ({...item, is_me: (userId == item.id)}));
    res.json({result: 'ok', data: mItems});
}

exports.getReceiveFriendList = async (req, res) => {
    const userId = req.user.id;
    const {page = 1, size = 20} = req.query;
    const items = await repository.getReceiveFriendList(userId, page, size);
    const mItems = items.map(item => ({...item, is_me: (userId == item.id)}));
    res.json({result: 'ok', data: mItems});
}

// 특정 사람과 친구사이인가
exports.isFriend = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;
    const items = await repository.isFriend(userId, partnerId);
    if(items.length > 0) {
        res.json({result: 'true', data: items});
    } else {
        res.json({result: 'false', data: items})
    }
    
}

//특정 사람과 친구 신청중인가
exports.isPendingFriend = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;
    const items = await repository.isPendingFriend(userId, partnerId);
    if(items.length > 0) {
        res.json({result: 'true', data: items});
    } else {
        res.json({result: 'false', data: items});
    }
    
}

// 특정 사람과 친구거절인가
exports.isDenyFriend = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;
    const items = await repository.isDenyFriend(userId, partnerId);
    if(items.length > 0) {
        res.json({result: 'true', data: items});
    } else {
        res.json({result: 'false', data: items});
    }
}

// 특정 사람과 친구 해제
exports.delete = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;
    const result = await repository.delete(userId, partnerId);
    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', message: '삭제하는데 실패했습니다.'});
    }
}

exports.blockFriend = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.body.partnerId;

    const result = await repository.blockFriend(userId, partnerId);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.isBlockFriend = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;

    const result = await repository.isBlockFriend(userId, partnerId);

    if(result.length > 0) {
        res.json({result: 'true', data: result});
    } else {
        res.json({result: 'false', data: result});
    }
}

exports.blockIndex = async (req, res) => {
    const userId = req.user.id;
    
    const result = await repository.blockIndex(userId);

    const list = result.map((m) => m.me_id == userId? m.block_id : m.block_id == userId? m.me_id : m.block_id);

    res.json({result: 'ok', data: list});
}

exports.sendMessageFriend = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.body.partnerId;
    const message = req.body.message;

    const result = await repository.sendMessageFriend(userId, partnerId, message);

    if(result.affectedRows > 0) {
        const fcm_token = await repository.getFcmToken(partnerId);
        if(fcm_token.length > 0) {
            const token = fcm_token[0].fcm_token;
            send.sendPushNotification(token, '친구신청', message, {type: 'friend'});
        }
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.agreeSuggestion = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;

    const result = await repository.agreeSuggestion(userId, partnerId);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.denySuggestion = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.params.id;

    const result = await repository.denySuggestion(userId, partnerId);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}