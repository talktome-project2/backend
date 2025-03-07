const { pool } = require('../../database');
const { message } = require('../feed/repository');

exports.getMemberInfo = async (memberId) => {
    let query = `SELECT id, age, nickname, gender, profile_id, region, intro, message, recent_at FROM member WHERE id = ? LIMIT 1`;
    return await pool.query(query, [memberId]);
}

// userId 의 모든 친구들을 리턴
exports.getAcceptMeFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.nickname, m.age, m.region, m.profile_id, m.gender FROM member AS m INNER JOIN friend AS f ON m.id = f.partner_id WHERE me_id = ? AND permit = true`;
    return await pool.query(query, [userId]);
}

// userId 의 모든 친구들을 리턴
exports.getAcceptOtherFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.nickname, m.age, m.region, m.profile_id, m.gender FROM member AS m INNER JOIN friend AS f ON m.id = f.me_id WHERE partner_id = ? AND permit = true`;
    return await pool.query(query, [userId]);
}

exports.getSendFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.nickname, m.age, m.region, m.profile_id, m.gender, f.permit FROM member AS m INNER JOIN friend AS f ON m.id = f.partner_id WHERE me_id = ? AND (permit != true OR permit IS NULL)`;
    return await pool.query(query, [userId]);
}

exports.getReceiveFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.nickname, m.age, m.region, m.profile_id, m.gender, f.message FROM member AS m INNER JOIN friend AS f ON m.id = f.me_id WHERE partner_id = ? AND permit IS NULL`;
    return await pool.query(query, [userId]);
}

// 특정 사람과 친구사이인가
exports.isFriend = async (userId, partnerId) => {
    let query = `SELECT * FROM friend WHERE ((me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)) AND permit = true`;
    return await pool.query(query, [userId, partnerId, partnerId, userId]);
}

// 특정 사람과 친구거절인가
exports.isDenyFriend = async (userId, partnerId) => {
    let query = `SELECT * FROM friend WHERE ((me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)) AND permit = false`;
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
    let query = `UPDATE friend SET permit = true WHERE me_id = ? AND partner_id = ?`;
    return await pool.query(query, [partnerId, userId]);
}

exports.denySuggestion = async (userId, partnerId) => {
    let query = `UPDATE friend SET permit = false WHERE me_id = ? AND partner_id = ?`;
    return await pool.query(query, [partnerId, userId]);
}