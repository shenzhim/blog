var qiniu = require("qiniu");
var config = require("./qiniuconfig.json");

qiniu.conf.ACCESS_KEY = config.ak;
qiniu.conf.SECRET_KEY = config.sk;

exports.uploadFile = function(key, filePath) {
    //构建上传策略函数
    var putPolicy = new qiniu.rs.PutPolicy(config.bucket + ":" + key),
        token = putPolicy.token();

    qiniu.io.putFile(token, key, filePath, new qiniu.io.PutExtra(), function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret.hash, ret.key, ret.persistentId);
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
        }
    });

}