const repository = require('./repository');

exports.index = async (req, res) => {
    const {page = 1, size = 20, gender = '전체남여', region = '전체지역', age = '전체나이'} = req.query;

    const userId = req.user.id;

    const items = await repository.index(page, size, gender, region, age);

    const mItems = items.map(item => ({...item, is_me: (userId == item.id)}));

    res.json({result: 'ok', data: mItems});

}

exports.message = async (req, res) => {
    const {message} = req.body;
    const user = req.user;

    const result = await repository.message(user.id, message);

    if(result.affectedRows > 0) {
        res.send({result: 'ok'});
    } else {
        res.send({result: 'fail', message: '오류가 발생하였습니다.'});
    }
}

exports.updatePosition = async (req, res) => {
    const {latitude, longitude} = req.body;
    const user = req.user;

    const result = await repository.updatePosition(user.id, latitude, longitude);

    if(result.affectedRows > 0) {
        res.send({result: 'ok'});
    } else {
        res.send({result: 'fail', message: '오류가 발생하였습니다.'});
    }
}