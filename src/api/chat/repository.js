const {pool} = require('../../database');

exports.getRooms = async (userId) => {
    //const offset = (page - 1) * size;

    const query = `
        SELECT r.room_id, r.me_id, r.partner_id, m.nickname, m.profile_id, m.gender, latest_chat.content, latest_chat.created_at
        FROM room AS r
        INNER JOIN member AS m ON m.id = 
            CASE
                WHEN r.me_id = ? THEN r.partner_id
                ELSE r.me_id
            END
        LEFT OUTER JOIN (
			SELECT chat1.room_id, chat1.content, chat1.created_at, chat1.user_id
            FROM chat AS chat1
            INNER JOIN (
				SELECT room_id, MAX(created_at) AS latest
                FROM chat
                GROUP BY room_id
			) AS chat2 ON chat1.room_id = chat2.room_id AND chat1.created_at = chat2.latest
		) AS latest_chat ON r.room_id = latest_chat.room_id
        WHERE r.me_id = ? OR r.partner_id = ?
        ORDER BY latest_chat.created_at DESC;
        `;

    return await pool.query(query, [userId, userId, userId]);
};

exports.enterRoom = async (userId, partnerId) => {
    const checkQuery = `SELECT * FROM room WHERE (me_id = ? AND partner_id = ?) OR (me_id = ? AND partner_id = ?)`;
    const checkResult = await pool.query(checkQuery, [userId, partnerId, partnerId, userId]);

    if (checkResult.length > 0) {
        return checkResult[0].room_id; // 이미 방이 존재하면 해당 방의 id 반환
    } else {
        const insertQuery = `INSERT INTO room (me_id, partner_id) VALUES (?, ?)`;
        const insertResult = await pool.query(insertQuery, [userId, partnerId]);
        return insertResult.insertId; // 새로운 방이 생성되면 해당 방의 id 반환
    }
};

exports.saveMessage = async (roomId, userId, content) => {
    const insertQuery = `INSERT INTO chat (room_id, user_id, content) VALUES (?, ?, ?)`;
    const { insertId } = await pool.query(insertQuery, [roomId, userId, content]);

    const selectQuery = `SELECT * FROM chat WHERE id = ?`;
    const rows = await pool.query(selectQuery, [insertId]);
    //console.log('<<<<<<<<<<<<<>>>>>>>>>>>>>>>>');
    //console.log('rows = ', rows);
    return (rows.length < 0) ? null : rows[0];
};

exports.getMessagesAfter = async (roomId, page, size) => {
    const offset = (page - 1) * size;

    const query = `SELECT * FROM chat WHERE room_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?`;

    return await pool.query(query, [`${roomId}`, `${size}`, `${offset}`]);
};