DROP TABLE IF EXISTS `ids`;
CREATE TABLE `ids` (
  `IdName` varchar(16) NOT NULL DEFAULT '',
  `nowId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`IdName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Insert Into `ids` (`IdName`, `nowID`) values ('object',0);
Insert Into `ids` (`IdName`, `nowID`) values ('sms',0);
Insert Into `ids` (`IdName`, `nowID`) values ('tasks',0);

DROP TABLE IF EXISTS `name2id`;
CREATE TABLE `name2id` (
  `name` varchar(255) NOT NULL DEFAULT '',
  `id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `data`;
CREATE TABLE `data` (
  `id` bigint(20) NOT NULL,
  `appid` bigint(20) NOT NULL,
  `list` varchar(32) NOT NULL,
  `tag` varchar(32) NOT NULL,
  `sort` bigint(20) NOT NULL,
  `bindid` bigint(20) NOT NULL,
  `created` DATETIME,
  `changed` DATETIME,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`,`appid`,`list`,`bindid`,`tag`,`sort`),
  KEY `I_Table` (`appid`,`list`,`id`,`tag`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment` (
  `k` varchar(128) NOT NULL DEFAULT '',
  `v` mediumblob NOT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `attachinfo`;
CREATE TABLE `attachinfo` (
  `k` varchar(128) NOT NULL DEFAULT '',
  `size` int  NOT NULL,
  `height` SMALLINT  NOT NULL,
  `width` SMALLINT  NOT NULL,
  `type` varchar(16)  NOT NULL,
  `isdelete` TINYINT  NOT NULL,
  `userid` bigint  NOT NULL,
  `exif` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` DATETIME NOT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `list` varchar(32) NOT NULL DEFAULT '',
  `k` varchar(128) NOT NULL DEFAULT '',
  `v` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `changed` datetime DEFAULT NULL,
  PRIMARY KEY (`list`, `k`),
  KEY `I_Change` (`changed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `appIds`;
CREATE TABLE `appIds` (
  `appid` int(4) NOT NULL DEFAULT '0',
  `version` SMALLINT(2) NOT NULL DEFAULT '0',
  `id` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`appid`,`version`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;