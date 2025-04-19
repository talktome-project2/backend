const {pool} = require('../../database');

exports.index = async (page, size, gender, region, age) => {
    const offset = (page - 1)* size;

    let query = `SELECT id, age, nickname, gender, profile_id, region, intro, message, latitude, longitude, recent_at FROM member`;

    const whereClause = [], params = [];

    if(gender != '전체남여') {
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

    if(whereClause.length > 0) {
        query += ` WHERE ` + whereClause.join(' AND ');
    }

    query += ` ORDER BY recent_at DESC LIMIT ? OFFSET ?`;
    params.push(`${size}`, `${offset}`);


    return await pool.query(query, params);
}

exports.message = async (id, message) => {
    const query =  `UPDATE member SET message = ?, recent_at = NOW() WHERE id = ?`;
    return await pool.query(query, [message, id]);
}

exports.updatePosition = async (id, latitude, longitude) => {
    const query = `UPDATE member SET latitude = ?, longitude = ? WHERE id = ?`;
    return await pool.query(query, [latitude, longitude, id]);
}

exports.getNotice = async () => {
    const query = `SELECT * FROM notice WHERE open = 1 ORDER BY created_at DESC LIMIT 1`;
    return await pool.query(query);
}