const {pool} = require('../../database');
const fs = require('fs');

exports.index = async (page, size, gender, region, age, platform, date_select, start_date, end_date) => {
    const offset = (page - 1)* size;

    let query = `SELECT m.id, m.email, m.age, m.nickname, m.gender, m.profile_id, m.region, m.intro, m.message, m.platform, m.created_at,
                (SELECT count(*) FROM friend WHERE (me_id = m.id OR partner_id = m.id) AND permit = 1) AS friend_count FROM member AS m`;

    const whereClause = [], params = [];

    if(gender != '전체남여') { // 남성, 여성
        whereClause.push('gender = ?');
        params.push(gender.trim());
    }

    if(region != '전체지역') {
        whereClause.push('region = ?');
        params.push(region);
    }

    if(age != '전체나이') {
        switch(age) {
            case '20대': whereClause.push('(age >= 20 AND age <= 29)');
                    break;
            case '30대': whereClause.push('(age >= 30 AND age <= 39)');
                    break;
            case '40대': whereClause.push('(age >= 40 AND age <= 49)');
                    break;
            case '50대': whereClause.push('(age >= 50 AND age <= 59)');
                    break;
            case '60대': whereClause.push('age >= 60');
                    break;
        }
    }

    if(platform != '전체') {
        whereClause.push('platform = ?');
        params.push(platform);
    }

    if(date_select != '전체날짜') {
        whereClause.push('(DATE(created_at) BETWEEN ? AND ?)');
        params.push(start_date, end_date);
    }

    if(whereClause.length > 0) {
        query += ` WHERE ` + whereClause.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(`${size}`, `${offset}`);


    return await pool.query(query, params);
}

exports.getMemberInfoById = async (userId) => {
    const query = `SELECT * FROM member WHERE id = ?`;
    let result = await pool.query(query, [userId]);
    return (result.length < 0) ? null : result[0];
}

exports.getMemberInfoByEmail = async (email) => {
    const query = `SELECT * FROM member WHERE email = ?`;
    let result = await pool.query(query, [email]);
    return (result.length < 0) ? null : result[0];
}

// userId 의 모든 친구들을 리턴
exports.getAcceptFriendList = async (userId) => {
    let query = `SELECT m.id AS member_id, m.email, m.nickname, m.age, m.region, m.profile_id, m.gender FROM member AS m INNER JOIN friend AS f ON m.id = f.partner_id WHERE me_id = ? AND permit = 1 
                UNION
                SELECT m.id AS member_id, m.email, m.nickname, m.age, m.region, m.profile_id, m.gender FROM member AS m INNER JOIN friend AS f ON m.id = f.me_id WHERE partner_id = ? AND permit = 1`;
    return await pool.query(query, [userId, userId]);
}

exports.blockMeToOtherIndex = async (userId) => {
    let query = `SELECT m.id, m.email, m.nickname, m.age, m.region, m.gender, m.platform, m.created_at FROM member AS m INNER JOIN block AS b ON m.id = b.block_id WHERE b.me_id = ?`;
    return await pool.query(query, [userId]);
}

exports.blockOtherToMeIndex = async (userId) => {
    let query = `SELECT m.id, m.email, m.nickname, m.age, m.region, m.gender, m.platform, m.created_at FROM member AS m INNER JOIN block AS b ON m.id = b.me_id WHERE b.block_id = ?`;
    return await pool.query(query, [userId]);
}

exports.countDateFeed = async (date) => {
    let query = `SELECT count(*) FROM member WHERE DATE(created_at) = ?`;
    return await pool.query(query, [date]);
}

exports.countIOS = async () => {
    let query = `SELECT count(*) FROM member WHERE platform = 'iOS'`;
    return await pool.query(query);
}

exports.countAndroid = async () => {
    let query = `SELECT count(*) FROM member WHERE platform = 'android'`;
    return await pool.query(query);
}

exports.countMan = async () => {
    let query = `SELECT count(*) FROM member WHERE gender = '남성'`;
    return await pool.query(query);
}

exports.countWoman = async () => {
    let query = `SELECT count(*) FROM member WHERE gender = '여성'`;
    return await pool.query(query);
}

exports.countAge = async (age) => {
    let query = `SELECT count(*) FROM member WHERE `;
    switch(age) {
        case '20대': query += ' age >= 20 AND age <= 29';
                break;
        case '30대': query += ' age >= 30 AND age <= 39';
                break;
        case '40대': query += ' age >= 40 AND age <= 49';
                break;
        case '50대': query += ' age >= 50 AND age <= 59';
                break;
        case '60대': query += 'age >= 60';
                break;
    }
    return await pool.query(query);
}

exports.countRegion = async (region) => {
    let query = `SELECT count(*) FROM member WHERE region = ?`;
    return await pool.query(query, [region]);
}

exports.deleteMember = async (userId) => {
    let query = `DELETE FROM member WHERE id = ?`;
    return await pool.query(query, [userId]);
}

exports.deleteBlock = async (userId) => {
    const query = `DELETE FROM block WHERE me_id = ? OR block_id = ?`;
    return await pool.query(query, [userId, userId]);
}

exports.getherRoomIdsAndDeleteChatDB = async (userId) => {
    const query = `SELECT DISTINCT room_id FROM chat WHERE user_id = ?`
    const result = await pool.query(query, [userId]);
    const roomIds = result.map(row => row.room_id);
    for(let i = 0; i < roomIds.length; i++) {
        const query = `DELETE FROM chat WHERE room_id = ?`;
        await pool.query(query, [roomIds[i]]);
    }
}

exports.deleteChat = async (userId) => {
    const query = `DELETE FROM chat WHERE user_id = ?`;
    return await pool.query(query, [userId]);
}

exports.deleteFriend = async (userId) => {
    const query = `DELETE FROM friend WHERE me_id = ? OR partner_id = ?`;
    return await pool.query(query, [userId, userId]);
}

exports.deleteImage = async (userId) => {
    const query = `DELETE FROM image WHERE member_id = ?`;
    return await pool.query(query, [userId]);
}

exports.deleteRoom = async (userId) => {
    const query = `DELETE FROM room WHERE me_id = ? OR partner_id = ?`;
    return await pool.query(query, [userId, userId]);
}

exports.deleteFiles = async (userId) => {
    const query = `SELECT file_path FROM files WHERE member_id = ?`;
    let result = await pool.query(query, [userId]);

    if(result.length > 0) {
        for(let i = 0; i < result.length; i++) {
            fs.unlinkSync(result[i].file_path);
        }
    }

    const query2 = `DELETE FROM files WHERE member_id = ?`;
    return await pool.query(query2, [userId]);
}

exports.applyNotify = async (partnerId) => {
    
    const query2 = `UPDATE member SET is_blocked = 1 WHERE id = ?`;
    let result = await pool.query(query2, [partnerId]);

    const query = `UPDATE blocked_devices SET apply = 1 WHERE member_id = ?`;
    return await pool.query(query, [partnerId]);
}