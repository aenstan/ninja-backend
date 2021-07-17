# Ninja

一次对于 koa2 vue3 vite 的简单尝试

## 说明

Ninja 仅供学习参考使用，请于下载后的 24 小时内删除，本人不对使用过程中出现的任何问题负责，包括但不限于 `数据丢失` `数据泄露`，`通知错乱`。

Ninja 仅支持 qinglong 2.8+

## 文档

1. 容器映射 5701 端口，ninja 目录至宿主机

   例：

   ```diff
   version: "3"
   services:
     qinglong:
       image: whyour/qinglong:latest
       container_name: qinglong
       restart: unless-stopped
       tty: true
       ports:
         - 5700:5700
   +      - 5701:5701
       environment:
         - ENABLE_HANGUP=true
         - ENABLE_WEB_PANEL=true
       volumes:
         - ./config:/ql/config
         - ./log:/ql/log
         - ./db:/ql/db
         - ./repo:/ql/repo
         - ./raw:/ql/raw
         - ./scripts:/ql/scripts
         - ./jbot:/ql/jbot
   +      - ./ninja:/ql/ninja
       labels:
         - com.centurylinklabs.watchtower.enable=false
   ```

2. 进容器内执行以下命令

   ```bash
   git clone https://github.com/MoonBegonia/ninja-backend.git /ql/ninja
   cd /ql/ninja
   pnpm install
   pm2 start
   cp sendNotify.js /ql/scripts/sendNotify.js
   ```

3. 将一下内容粘贴到 `extra.sh`

   ```bash
   cd /ql/ninja
   pm2 start
   cp sendNotify.js /ql/scripts/sendNotify.js
   ```

4. 修改网站更新面板命令（不使用网页上的更新面板可忽略

   ```diff
   - ql update
   + ql update && ql extra
   ```

## 注意事项

* 执行 `ql update` 命令后务必执行一次 `ql extra` 保证 Ninja 配置成功。

* 更新 Ninja 只需要在容器中 `ninja` 目录执行 `git pull` 然后 `pm2 start`

* Qinglong 需要在登录状态（`auth.json` 中有 token）

* Push token 存放在 qinglong 环境变量的备注中，添加 push token 会覆盖备注，请知悉。
