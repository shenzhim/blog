#!/bin/js

"use strict";
var process = require('process');

// var params = process.argv;
// if (params.length < 3) {
// 	console.error("params error");
// 	process.exit(-1);
// }

// var config = require("configs/" + params[1].split("/")[1].split(".")[0] + "/" + params[2])
// var s = config.runtime.database.dbTable;
//变量database, 获取相同配置的数据库, 备份.

console.log("start backup...");
// var cmd = "mysqldump -h127.0.0.1 -uroot -p123456 --single-transaction baoz ids name2id data inviteCode | gzip > /var/mysqlbackup/`date +%Y%m%d_%H:%M`.gz";
var cmd = "mysqldump --single-transaction -hbaozrdshello.mysql.rds.aliyuncs.com -umysql_reborn -pqqf3s4m94ftds00j5xv89e7jrxuay3j6 baoz_reborn appids ids name2id data inviteCode | gzip > /var/mysqlbackup/`date +%Y%m%d_%H:%M`.gz";
process.system(cmd);
console.log("backup ok!");