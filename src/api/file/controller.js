const repository = require('./repository');

exports.upload = async (req, res) => {
    const file = req.file;

    const {affectedRows, insertId} = await repository.create(
        file.originalname, file.path, file.size
    );

    if(affectedRows > 0) {
        return res.json({result: 'ok', data: insertId});
    }
    return res.json({result: 'fail'});
}

exports.download = async (req, res) => {
    const {id} = req.params;

    const item = await repository.show(id);

    if(item == null) {
        return res.send({result: 'fail'});
    }

    res.download(item.file_path, item.original_name, (err) => {
        if(err) {
            res.send({result: 'error', message: err.message});
        }
    });
}

exports.update = async (req, res) => {
    const {id} = req.params;
    const {image_id, seq} = req.body;

    const result = await repository.update(id, image_id, seq);
    if(result.affectedRows > 0) {
        return res.send({result: 'ok', data: result});
    }
    return res.send({result: 'fail'});
}

exports.getSeqImage = async (req, res) => {
    const {id} = req.params;
    const {seq} = req.query;

    const result = await repository.getSeqImageId(id, seq);
    if(result.length > 0) {
        res.send({result: 'ok', data: result});
    } else {
        res.send({result: 'fail'});
    }
}

exports.updateProfileImageId = async (req, res) => {
    const {id} = req.params;
    const {profile_id} = req.body;

    const result = await repository.updateProfileImageId(id, profile_id);

    if(result.affectedRows > 0) {
        res.send({result: 'ok'});
    } else {
        res.send({result: 'fail', message: '오류가 발생하였습니다.'});
    }
}

exports.getMemberProfileImage = async (req, res) => {
    const userId = req.user.id;

    const result = await repository.getMemberProfileImage(userId);
    if(result.length > 0) res.send({result: 'ok', data: result});
    else res.send({result: 'fail'});
}

exports.deleteSeqImage = async (req, res) => {
    const memberId = req.params.id; 
    const seq = req.query.seq;

    const result = await repository.deleteSeqImage(memberId, seq);

    if(result.affectedRows > 0) return res.send({result: 'ok'});
    return res.send({result: 'fail'});

}

exports.deleteProfileImage = async (req, res) => {
    const memberId = req.params.id;

    const result = await repository.deleteProfileImage(memberId);

    if(result.affectedRows > 0) return res.send({result: 'ok'})
}