const { pool } = require('../../database');
const { message } = require('../feed/repository');

exports.getMemberInfo = async (memberId) => {
    let query = `SELECT id, age, nickname, gender, profile_id, region, intro, message, recent_at FROM member WHERE id = ? LIMIT 1`;
    return await pool.query(query, [memberId]);
}

exports.getAcceptFriendList = async (userId, page, size) => {
    const offset = (page - 1)* size;
    let query =
    `SELECT * FROM (SELECT m.id, m.nickname, m.age, m.region, m.profile_id, m.gender, m.intro, m.message, m.latitude, m.longitude, m.recent_at, f.created_at FROM member AS m INNER JOIN friend AS f ON m.id = f.partner_id WHERE me_id = ? AND permit = 1
    UNION
    SELECT m.id, m.nickname, m.age, m.region, m.profile_id, m.gender, m.intro, m.message, m.latitude, m.longitude, m.recent_at, f.created_at FROM member AS m INNER JOIN friend AS f ON m.id = f.me_id WHERE partner_id = ? AND permit = 1) AS x
    ORDER BY x.created_at DESC LIMIT ? OFFSET ?`;
    return await pool.query(query, [userId, userId, `${size}`, `${offset}`]);
}

// userId 의 모든 친구들을 리턴
exports.getAcceptMeFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.nickname, m.age, m.region, m.profile_id, m.gender FROM member AS m INNER JOIN friend AS f ON m.id = f.partner_id WHERE me_id = ? AND permit = 1`;
    return await pool.query(query, [userId]);
}

// userId 의 모든 친구들을 리턴
exports.getAcceptOtherFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.nickname, m.age, m.region, m.profile_id, m.gender FROM member AS m INNER JOIN friend AS f ON m.id = f.me_id WHERE partner_id = ? AND permit = 1`;
    return await pool.query(query, [userId]);
}

exports.getSendFriendList = async (userId, page, size) => {
    const offset = (page - 1)* size;
    let query = `SELECT * FROM (SELECT m.id, m.nickname, m.age, m.region, m.profile_id, m.gender, m.intro, m.message, m.latitude, m.longitude, m.recent_at, f.created_at, f.permit, f.message AS greeting FROM member AS m INNER JOIN friend AS f ON m.id = f.partner_id WHERE me_id = ? AND (permit = 0 OR permit IS NULL)) AS x
    ORDER BY x.created_at DESC LIMIT ? OFFSET ?`;
    return await pool.query(query, [`${userId}`, `${size}`, `${offset}`]);
}

exports.getReceiveFriendList = async (userId, page, size) => {
    const offset = (page - 1)* size;
    let query = `SELECT * FROM (SELECT m.id, m.nickname, m.age, m.region, m.profile_id, m.gender, m.intro, m.message, m.latitude, m.longitude, m.recent_at, f.created_at, f.permit, f.message AS greeting FROM member AS m INNER JOIN friend AS f ON m.id = f.me_id WHERE partner_id = ? AND permit IS NULL) AS x
    ORDER BY x.created_at DESC LIMIT ? OFFSET ?`;
    return await pool.query(query, [userId, `${size}`, `${offset}`]);
}

// 특정 사람과 친구사이인가
exports.isFriend = async (userId, partnerId) => {
    let query = `SELECT * FROM friend WHERE ((me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)) AND permit = 1`;
    return await pool.query(query, [userId, partnerId, partnerId, userId]);
}

// 특정 사람과 친구거절인가
exports.isDenyFriend = async (userId, partnerId) => {
    let query = `SELECT * FROM friend WHERE ((me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)) AND permit = 0`;
    return await pool.query(query, [userId, partnerId, partnerId, userId]);
}

//특정 사람과 친구 신청중인가
exports.isPendingFriend = async (userId, partnerId) => {
    let query = `SELECT * FROM friend WHERE ((me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)) AND permit IS NULL`;
    return await pool.query(query, [userId, partnerId, partnerId, userId]);
}

// 특정 사람과 친구 해제
exports.delete = async (userId, partnerId) => {
    let query = `DELETE FROM friend WHERE (me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)`;
    return await pool.query(query, [userId, partnerId, partnerId, userId]);
}

exports.blockFriend = async (userId, partnerId) => {
    let query = `INSERT INTO block(me_id, block_id) VALUES (?, ?)`;
    return await pool.query(query, [userId, partnerId]);
}

exports.isBlockFriend = async (userId, partnerId) => {
    let query = `SELECT * FROM block WHERE (me_id = ? AND block_id = ?) OR (me_id = ? AND block_id = ?)`;
    return await pool.query(query, [userId, partnerId, partnerId, userId]);
}

exports.blockIndex = async (userId) => {
    let query = `SELECT * FROM block WHERE me_id = ? OR block_id = ?`;
    return await pool.query(query, [userId, userId]);
}

exports.sendMessageFriend = async (userId, partnerId, message) => {
    let query = `INSERT INTO friend(me_id, partner_id, message) VALUES (?, ?, ?)`;
    return await pool.query(query, [userId, partnerId, message]);
}

exports.getFcmToken = async (partnerId) => {
    let query = `SELECT fcm_token FROM member WHERE id = ?`;
    return await pool.query(query, [partnerId]);
}

exports.agreeSuggestion = async (userId, partnerId) => {
    let query = `UPDATE friend SET permit = 1 WHERE me_id = ? AND partner_id = ?`;
    return await pool.query(query, [partnerId, userId]);
}

exports.denySuggestion = async (userId, partnerId) => {
    let query = `UPDATE friend SET permit = 0 WHERE me_id = ? AND partner_id = ?`;
    return await pool.query(query, [partnerId, userId]);
}