DROP TABLE IF EXISTS `ids`;
CREATE TABLE `ids` (
  `IdName` varchar(16) NOT NULL DEFAULT '',
  `nowId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`IdName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Insert Into `ids` (`IdName`, `nowID`) values ('object',0);

DROP TABLE IF EXISTS `data`;
CREATE TABLE `data` (
  `id` bigint(20) NOT NULL,
  `list` varchar(32) NOT NULL,
  `tag` varchar(32) NOT NULL,
  `sort` bigint(20) NOT NULL,
  `bindid` bigint(20) NOT NULL,
  `created` DATETIME,
  `changed` DATETIME,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`,`list`,`bindid`,`tag`,`sort`),
  KEY `I_Table` (`list`,`id`,`tag`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;