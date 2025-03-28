const { pool } = require('../../database');

exports.register = async (email, password, age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform) => {
    const query = `INSERT INTO member (email, password, age, nickname, gender, region, intro, fcm_token, latitude, longitude, platform, message, profile_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '방금 가입했어요.', 0)`;
    //const imageId = profile_id === undefined ? null : profile_id;
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