/* 创建数据库 */
CREATE DATABASE hh;

/* 用于健康检测 */
CREATE TABLE `ping` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  PRIMARY KEY (`id`)
) COMMENT = '健康检测表';