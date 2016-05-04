DROP TABLE IF EXISTS 'ids';
CREATE TABLE ids (IdName VARCHAR(16),nowId INTEGER,PRIMARY KEY (IdName));
Insert Into ids (IdName, nowID) values ('object',0);
Insert Into ids (IdName, nowID) values ('sms',0);
Insert Into ids (IdName, nowID) values ('tasks',0);

DROP TABLE IF EXISTS 'sms';
CREATE TABLE sms (id INTEGER,objectid INTEGER NOT NULL,sessionid VARCHAR(36) NOT NULL,ip VARCHAR(15),phonenumber VARCHAR(20)  NOT NULL,msg Varchar(64)  NOT NULL,status VARCHAR(10)  NOT NULL,createtime DATETIME,updatetime DATETIME,PRIMARY KEY(id));

DROP TABLE IF EXISTS 'name2id';
CREATE TABLE name2id (name VARCHAR(255),id INTEGER,PRIMARY KEY (name));


DROP TABLE IF EXISTS 'listsearch';
CREATE TABLE listsearch (appid INTEGER, id INTEGER, list VARCHAR(32), tag VARCHAR(32), bindid INTEGER, updatetime INTEGER, doc TEXT, PRIMARY KEY (appid, id, list, tag, bindid));


DROP TABLE IF EXISTS 'namesearch';
CREATE TABLE namesearch (appid INTEGER, id INTEGER,doc TEXT, updatetime INTEGER, life INTEGER, PRIMARY KEY(appid, id));


DROP TABLE IF EXISTS 'data';
CREATE TABLE data (id INTEGER,appid INTEGER,`list` VARCHAR(32),tag VARCHAR(32),sort INTEGER,bindid INTEGER,created DATETIME,changed DATETIME,value MEDIUMTEXT,PRIMARY KEY (id,appid,`list`,bindid,tag,sort));
CREATE INDEX I_Table ON data (id,appid,`list`,tag,sort);


DROP TABLE IF EXISTS 'attachment';
CREATE TABLE attachment (k VARCHAR(128),v MEDIUMBLOB,PRIMARY KEY (k));

DROP TABLE IF EXISTS 'attachinfo';
CREATE TABLE attachinfo (k VARCHAR(128),size INTEGER, height SMALLINT,width SMALLINT,`type` VARCHAR(16),isdelete TINYINT,userid INTEGER,exif MEDIUMTEXT,created DATETIME,PRIMARY KEY (k));


DROP TABLE IF EXISTS 'cache';
CREATE TABLE cache (`list` varchar(32),k VARCHAR(128),v TEXT,changed DATETIME,PRIMARY KEY (`list`,k));
CREATE INDEX I_Change ON cache (changed);


DROP TABLE IF EXISTS 'invitecode';
CREATE TABLE invitecode (no INTEGER, code VARCHAR(32),userid INTEGER,activeid INTEGER,actived VARCHAR(1),expiryd DATETIME,PRIMARY KEY (code,no,actived));
CREATE INDEX I_activeid ON invitecode (activeid);
CREATE INDEX I_userid ON invitecode (userid);


DROP TABLE IF EXISTS 'appids';
CREATE TABLE appids (appid INTEGER, version smallint, id INTEGER,PRIMARY KEY (appid,version,id));


DROP TABLE IF EXISTS 'jobs';
CREATE TABLE jobs (appid INTEGER, jobname VARCHAR(32), profile TEXT, PRIMARY KEY(appid));

DROP TABLE IF EXISTS 'tasks';
CREATE TABLE tasks (taskid INTEGER, id INTEGER, appid INTEGER, jobname VARCHAR(32), steptype VARCHAR(32), step VARCHAR(32), status VARCHAR(32), level INTEGER,  value TEXT,  createtime DATETIME, nexttime DATETIME, changetime DATETIME,runcount INTEGER,PRIMARY KEY(taskid));
CREATE INDEX I_Step ON tasks (steptype, status, nexttime, level);

DROP TABLE IF EXISTS 'tasklogs';
CREATE TABLE tasklogs (id INTEGER, step VARCHAR(32), result TEXT, starttime DATETIME, endtime DATETIME, PRIMARY KEY(id));

DROP TABLE IF EXISTS `statdata`;
CREATE TABLE `statdata`(`name` VARCHAR(32) NOT NULL,  `key` VARCHAR(128)  NOT NULL , `duration` VARCHAR(32) NOT NULL, `date` DATETIME   NOT NULL,   `value` INT, PRIMARY KEY(name, `key`, duration, `date`));

DROP TABLE IF EXISTS `newstatdata`;
CREATE TABLE `newstatdata`(`name` VARCHAR(32) NOT NULL,  `key` VARCHAR(128)  NOT NULL , `duration` VARCHAR(32) NOT NULL, `date` DATETIME   NOT NULL,   `value` INT, PRIMARY KEY(name, `key`, duration, `date`));

DROP TABLE IF EXISTS `statextdata`;
CREATE TABLE `statextdata`( `name` VARCHAR(32) NOT NULL,  `key` VARCHAR(128)  NOT NULL , `duration` VARCHAR(32) NOT NULL, `date` DATETIME   NOT NULL,   `value` INT, PRIMARY KEY(name, `key`, duration, `date`));

DROP TABLE IF EXISTS `openids`;
CREATE TABLE `openids` ( `appkey` VARCHAR(36) NOT NULL,  `objectid` INTEGER NOT NULL,  `openid` VARCHAR(36) NOT NULL,  `uid` INTEGER NOT NULL,  `subscribe` INTEGER , created DATETIME,changed DATETIME, PRIMARY KEY(`appkey`,`openid`,`objectid`,`uid`));