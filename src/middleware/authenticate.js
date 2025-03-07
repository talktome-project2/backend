const jwt = require('jsonwebtoken');

// 문제 없음.
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).send({message: '토큰이 없습니다.'});
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if(err) {
            return res.status(403).send({message: '유효하지 않은 토큰'});
        }
        req.user = decoded;
        //console.log(decoded);
        next();
    });
}

module.exports = authenticateToken;