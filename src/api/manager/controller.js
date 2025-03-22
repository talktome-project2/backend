const repository = require('./repository');

exports.index = async (req, res) => {
    const {page = 1, size = 20, gender = '전체남여', region = '전체지역', age = '전체나이', platform = '전체', date_select = '전체날짜', start_date, end_date} = req.query;

    const items = await repository.index(page, size, gender, region, age, platform, date_select, start_date, end_date);

    res.json({result: 'ok', data: items});

}

exports.getMemberInfoById = async (req, res) => {
    const userId = req.params.id;

    const result = await repository.getMemberInfoById(userId);

    if(result) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: '해당 유저가 존재하지 않습니다.'});
    }

}

exports.getMemberInfoByEmail = async (req, res) => {
    const email = req.params.email;

    const result = await repository.getMemberInfoByEmail(email);

    if(result) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: '해당 유저가 존재하지 않습니다.'});
    }

}

// 본인의 모든 친구들을 리턴
exports.getAcceptFriendList = async (req, res) => {
    const userId = req.params.id;
    const items = await repository.getAcceptFriendList(userId);
    res.json({result: 'ok', data: items});
}

exports.blockMeToOtherIndex = async (req, res) => {
    const userId = req.params.id;
    const items = await repository.blockMeToOtherIndex(userId);
    res.json({result: 'ok', data: items});
}

exports.blockOtherToMeIndex = async (req, res) => {
    const userId = req.params.id;
    const items = await repository.blockOtherToMeIndex(userId);
    res.json({result: 'ok', data: items});
}

exports.countDateFeed = async (req, res) => {
    const date = req.query.date;
    const items = await repository.countDateFeed(date);
    res.json({result: 'ok', data: items});
}

exports.countIOS = async (req, res) => {
    const items = await repository.countIOS();
    res.json({result: 'ok', data: items});
}

exports.countAndroid = async (req, res) => {
    const items = await repository.countAndroid();
    res.json({result: 'ok', data: items});
}

exports.countMan = async (req, res) => {
    const items = await repository.countMan();
    res.json({result: 'ok', data: items});
}

exports.countWoman = async (req, res) => {
    const items = await repository.countWoman();
    res.json({result: 'ok', data: items});
}

exports.countAge = async (req, res) => {
    const age = req.query.age;
    const items = await repository.countAge(age);
    res.json({result: 'ok', data: items});
}

exports.countRegion = async (req, res) => {
    const region = req.query.region;
    const items = await repository.countRegion(region);
    res.json({result: 'ok', data: items});
}

exports.deleteMember = async (req, res) => {
    const userId = req.params.id;
    const result = await repository.deleteMember(userId);
    const result2 = await repository.deleteBlock(userId);
    const result3 = await repository.deleteChat(userId);
    const result5 = await repository.deleteFriend(userId);
    const result6 = await repository.deleteImage(userId);
    const result7 = await repository.deleteRoom(userId);
    const result4 = await repository.deleteFiles(userId);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}