# ArcOJ-BackEnd

## 部署

1. 环境：
   - 项目：`drwxrwsr-x ojmaster www-data /var/www/ArcOJ-BackEnd`
   - 日志：`-rw-rw-r-- ojmaster www-data /var/log/ArcOJ-BackEnd/api.log`
   - PostgreSQL 10.3+
   - Node.js 10.0.0+, npm, node-pm2
   - Docker (judgecore)
   - Nginx (optional)
2. 安装：
   - 安装环境，确保项目和日志的位置及权限正确无误；
   - 配置PostgreSQL数据库，建立OJMaster用户和NKOJ-BackEnd-Database数据库（UTF8），使用Navicat等工具导入数据表；
   - 配置NKOJ-OnlineJudge-JudgeCore，项目位于https://github.com/NankaiACM/NKOJ-OnlineJudge-JudgeCore，若存在`ArcOJ-BackEnd/init/judgecore-default.json`，则需替换judgecore的同名文件；
   - Nginx是可选项，默认服务器配置位于`ArcOJ-BackEnd/init`，可能需要修改地址：前端默认后端位于http://acm.nankai.edu.cn/api。如不使用Nginx，请注意修改express框架的trust proxy和express-fileupload上传文件限制等配置。

## 启动

```sh
pm2 start bin/www --name api --watch --log /var/log/ArcOJ-BackEnd/api.log
```

## 维护

查看日志：`pm2 monit`或`pm2 log api`

