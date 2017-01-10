var qiniu = require("qiniu");
var config = require("./qiniuconfig.json");

qiniu.conf.ACCESS_KEY = config.ak;
qiniu.conf.SECRET_KEY = config.sk;

exports.uploadFile = function(params) {
    return new Promise(function(resolve, reject) {
        //构建上传策略函数
        var putPolicy = new qiniu.rs.PutPolicy(config.bucket + ":" + params.key),
            token = putPolicy.token();

        qiniu.io.putFile(token, params.key, params.filePath, new qiniu.io.PutExtra(), function(err, ret) {
            if (!err) {
                resolve({
                    key: ret.key
                });
            } else {
                resolve({});
            }
        });  
    });
}