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
    //console.log('getAcceptFriendList items : ', items);

    const mItems = items.map(item => ({...item, is_me: (userId == item.id)}));



    res.json({result: 'ok', data: items});
}

exports.getSendFriendList = async (req, res) => {
    const userId = req.user.id;
    const {page = 1, size = 20} = req.query;
    const items = await repository.getSendFriendList(userId, page, size);
    //console.log('getSendFriendList items : ', items);
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

    // 채팅룸이 있는지 확인
    const roomId = await repository.getRoomId(userId, partnerId);
    if(roomId != null) {
        // chat 없애기
        const result0 = await repository.deleteChatByOneRoom(roomId);
        // room 없애기
        const result1 = await repository.deleteRoom(userId, partnerId);
    }
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

    // 채팅룸이 있는지 확인
    const roomId = await repository.getRoomId(userId, partnerId);
    if(roomId != null) {
        // chat 없애기
        const result0 = await repository.deleteChatByOneRoom(roomId);
        // room 없애기
        const result1 = await repository.deleteRoom(userId, partnerId);
    }
    // friend 없애기
    const result2 = await repository.deleteFriend(userId, partnerId);
    // block 하기
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
        const result1 = await repository.getFcmToken(partnerId);
        //const nickname = await repository.getNickname(partnerId);
        if(result1.length > 0) {
            const token = result1[0].fcm_token;
            const nickname = result1[0].nickname;
            const receive_fcm = result1[0].receive_fcm;
            if(receive_fcm == 1 && token != null) {
                send.sendPushNotification(token, `${nickname}님의 친구신청`, message, {type: 'friend'});
            }

            res.json({result: 'ok', data: result1});
        } else {
            res.json({result: 'fail', message: '상대방의 fcm_token을 찾을 수 없습니다.'});
        }
        
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.sendFcmChatMessage = async (partnerId, message) => {
    const result = await repository.getFcmToken(partnerId);
    //const nickname = await repository.getNickname(partnerId);
    if(result.length > 0) {
        const token = result[0].fcm_token;
        const nickname = result[0].nickname;
        const receive_fcm = result[0].receive_fcm;
        if(receive_fcm == 1 && token != null) {
            send.sendPushNotification(token, `${nickname}님의 채팅요청`, message, {type: 'friend'});
        }
        return true;
    }else{
        return false;
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

exports.notifyMember = async (req, res) => {
    const userId = req.user.id;
    const partnerId = req.body.partnerId;
    const reason = req.body.reason;

    //const device_id = await repository.getDeviceId(partnerId);

    const result = await repository.notifyMember(userId, partnerId, reason);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }

    // if(device_id != null) {
    //     const result = await repository.notifyMember(userId, partnerId, device_id, reason);
    //     if(result.affectedRows > 0) {
    //         res.json({result: 'ok', data: result});
    //     } else {
    //         res.json({result: 'fail', data: result});
    //     }
    // }else {
    //     res.json({result: 'fail', message: '상대방의 device_id를 찾을 수 없습니다.'});
    // }
}