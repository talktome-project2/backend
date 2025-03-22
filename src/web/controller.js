const path = require('path');

exports.home = (req, res) => {
    
    res.sendFile(path.join(__dirname, './manager.html'));
    
}

exports.page = (req, res) => {
    const route = req.params.route;

    if(route == 'policy') {
        res.send('개인정보 처리방침');
    }

    if(route == 'terms') {
        res.send('이용 약관');
    }
}