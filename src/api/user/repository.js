const { pool } = require('../../database');

exports.register = async (email, password, age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform) => {
    const query = `INSERT INTO member (email, password, age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform, message, profile_id, receive_fcm, is_blocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '방금 가입했어요.', 0, 1, 0)`;
    
    return await pool.query(query, [email, password, age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform]);
}

exports.login = async (email, password) => {
    const query = `SELECT * FROM member WHERE email = ? AND password = ?`;
    let result = await pool.query(query, [email, password]);
    return (result.length < 0) ? null : result[0];
}

exports.findByEmail = async (email) => {
    const result = await pool.query(`SELECT count(*) count FROM member WHERE email = ?`, [email]);
    return (result.length < 0) ? null : result[0];
}

exports.findByNickname = async (nickname) => {
    const result = await pool.query(`SELECT count(*) count FROM member WHERE nickname = ?`, [nickname]);
    return (result.length < 0) ? null : result[0];
}

exports.fcmToken = async (userId, fcmToken) => {
    const query = `UPDATE member SET fcm_token = ? WHERE id = ?`;
    let result = await pool.query(query, [fcmToken, userId]);
    return result;
}

exports.getMemberInfo = async (userId) => {
    const query = `SELECT * FROM member WHERE id = ?`;
    let result = await pool.query(query, [userId]);
    return (result.length < 0) ? null : result[0];
}

exports.changeNickname = async (userId, nickname) => {
    const query = `UPDATE member SET nickname = ? WHERE id = ?`;
    let result = await pool.query(query, [nickname, userId]);
    return result;
}

exports.changeRegion = async (userId, region) => {
    const query = `UPDATE member SET region = ? WHERE id = ?`;
    let result = await pool.query(query, [region, userId]);
    return result;
}

exports.changeAge = async (userId, age) => {
    const query = `UPDATE member SET age = ? WHERE id = ?`;
    let result = await pool.query(query, [age, userId]);
    return result;
}

exports.changeIntro = async (userId, intro) => {
    const query = `UPDATE member SET intro = ? WHERE id = ?`;
    let result =
        await pool.query(query, [intro, userId]);
    return result;
}

exports.toggleFcm = async (userId, receive_fcm) => {
    const query = `UPDATE member SET receive_fcm = ? WHERE id = ?`;
    let result = await pool.query(query, [receive_fcm, userId]);
    return result;
}

exports.resetDeviceId = async (userId, device_id) => {
    const query = `UPDATE member SET device_id = ? WHERE id = ?`;
    let result = await pool.query(query, [device_id, userId]);
    return result;
}

exports.checkDeviceId = async (deviceId) => {
    const query = `SELECT * FROM blocked_devices WHERE device_id = ? AND apply = 1`;
    return await pool.query(query, [deviceId]);
}

exports.checkSelfDelete = async (userId) => {
    const query = `SELECT * FROM member WHERE id = ? AND is_blocked = 1`;
    return await pool.query(query, [userId]);
}