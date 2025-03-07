const {pool} = require('../../database');

exports.create = async (name, path, size) => {
    const query = `INSERT INTO files (original_name, file_path, file_size) VALUES(?,?,?)`;
    return await pool.query(query, [name, path, size]);
}

exports.show = async (id) => {
    const query = `SELECT * FROM files WHERE id = ?`;
    const result = await pool.query(query, [id]);
    return (result.length < 0) ? null : result[0];
}

exports.update = async (id, image_id, seq) => {
    const delete_query = `DELETE FROM image WHERE member_id = ? AND seq = ?`;
    await pool.query(delete_query, [id, seq]);
    const query = `INSERT INTO image (member_id, seq, image_id) VALUES(?, ?, ?)`;
    return await pool.query(query, [id, seq, image_id]);
}

exports.getSeqImageId = async (id, seq) => {
    const query = `SELECT image_id FROM image WHERE member_id = ? AND seq = ?`;
    return await pool.query(query, [id, seq]);
}

exports.updateProfileImageId = async (id, profile_id) => {
    const query = `UPDATE member SET profile_id = ? WHERE id = ?`;
    return await pool.query(query, [profile_id, id]);
}

exports.getMemberProfileImage = async (userId) => {
    const query = `SELECT profile_id FROM member WHERE id = ?`;
    return await pool.query(query, [userId])
}

exports.deleteSeqImage = async (id, seq) => {
    const query = `DELETE FROM image WHERE member_id = ? AND seq = ?`;
    return await pool.query(query, [id, seq]);
}

exports.deleteProfileImage = async (id) => {
    const query = `UPDATE member SET profile_id = NULL WHERE id = ?`;
    return await pool.query(query, [id]);
}