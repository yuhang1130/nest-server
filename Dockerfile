FROM node:16.20.2

# 设置实例个数
ENV INSTANCES=2

# 设置时区
ENV TZ=Asia/Shanghai \
  DEBIAN_FRONTEND=noninteractive
RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime

# 创建工作目录
RUN mkdir -p /app

# 指定工作目录
WORKDIR /app

#复制package到工作目录
COPY package.json package-lock.json ./

# 安装Pm2
RUN npm config set registry https://registry.npmmirror.com && \
	npm install pm2@5.3.0 -g

#install
RUN npm install

# 复制当前所有代码到/app工作目录
COPY . ./

# 打包
RUN npm run build

# 启动服务
CMD [ "pm2-runtime", "/app/pm2/ecosystem.config.js", "--only", "Web"]

#暴露端口9090（与服务启动端口一致）
EXPOSE 9090
