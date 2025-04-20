const repository = require('./repository');
const crypto = require('crypto');
const jwt = require('./jwt');

exports.register = async (req, res) => {

    const { email, password, age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform } = req.body;

    let { count } = await repository.findByEmail(email);

    if(count > 0) {
        return res.send({ result: 'fail', message: '중복된 이메일이 존재합니다.' });
    }

    const result = await crypto.pbkdf2Sync(password, process.env.SALT_KEY, 50, 100, 'sha512');

    const { affectedRows, insertId } = await repository.register(email, result.toString('base64'), age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform);
    
    if(affectedRows > 0) {
        const data = await jwt({ id: insertId, email: email });
        res.send({ result: 'ok', access_token: data, id: insertId });
    } else {
        res.send({ result: 'fail', message: '알 수 없는 오류' });
    }
}

exports.checkEmail = async (req, res) => {
    const { email } = req.params;

    let { count } = await repository.findByEmail(email);

    if(count > 0) {
        return res.send({ result: 'fail', message: '중복된 이메일이 존재합니다.' });
    }

    res.send({ result: 'ok', message: '사용 가능한 이메일입니다.' });
}

exports.checkNickname = async (req, res) => {
    const { nickname } = req.params;

    let { count } = await repository.findByNickname(nickname);

    if(count > 0) {
        return res.send({ result: 'fail', message: '중복된 닉네임이 존재합니다.' });
    }

    res.send({ result: 'ok', message: '사용 가능한 닉네임입니다.' });
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const result = await crypto.pbkdf2Sync(password, process.env.SALT_KEY, 50, 100, 'sha512');
    const item = await repository.login(email, result.toString('base64'));

    if(item == null) {
        res.send({ result: 'fail', message: '이메일 번호 혹은 비밀번호를 확인해 주세요.'});
    } else {
        item['is_me'] = true;
        //console.log('item : ', item);
        const data = await jwt({ id: item.id, email: item.email});
        res.send({ result: 'ok', access_token: data, data: item});
    }
}

exports.fcmToken = async (req, res) => {
    const {fcmToken} = req.body;
    const userId = req.user.id;

    const result = await repository.fcmToken(userId, fcmToken);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result}); 
    }
}

exports.getMemberInfo = async (req, res) => {
    const userId = req.params.id;

    const result = await repository.getMemberInfo(userId);

    if(result) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: '해당 유저가 존재하지 않습니다.'});
    }

}

exports.changeNickname = async (req, res) => {
    const userId = req.user.id;
    const { nickname } = req.body;

    const result = await repository.changeNickname(userId, nickname);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.changeRegion = async (req, res) => {
    const userId = req.user.id;
    const { region } = req.body;

    const result = await repository.changeRegion(userId, region);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.changeAge = async (req, res) => {
    const userId = req.user.id;
    const { age } = req.body;

    const result = await repository.changeAge(userId, age);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.changeIntro = async (req, res) => {
    const userId = req.user.id;
    const { intro } = req.body;

    const result = await repository.changeIntro(userId, intro);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}

exports.toggleFcm = async (req, res) => {
    const userId = req.params.id;
    const { receive_fcm } = req.body;

    const result = await repository.toggleFcm(userId, receive_fcm);

    if(result.affectedRows > 0) {
        res.json({result: 'ok', data: result});
    } else {
        res.json({result: 'fail', data: result});
    }
}