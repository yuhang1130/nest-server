FROM node:20.10.0-alpine AS package-builder

# 指定工作目录，没有就自动创建
WORKDIR /app-server

#复制package到工作目录
COPY package.json package-lock.json ./

# 安装依赖
RUN npm config set registry https://registry.npmmirror.com --global
RUN npm install

# 复制当前所有代码到工作目录
COPY . .

# 打包
RUN npm run build

# 再次使用基础镜像
FROM node:20.10.0-alpine

WORKDIR /app
ARG ENV_FLAG

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
  && apk update \
  && apk add curl \
  && apk add -U tzdata

# 安装Pm2
RUN npm config set registry https://registry.npmmirror.com --global
RUN npm install pm2@5.3.0 -g

# 从package-builder阶段复制打包后的文件
COPY --from=package-builder /app-server/node_modules /app-server/node_modules
COPY --from=package-builder /app-server/dist /app-server/dist
COPY ./pm2 /app-server/pm2

#暴露端口9090（与服务启动端口一致）
EXPOSE 9090

# 环境变量
ENV PORT=9090
ENV ENV_FLAG=${ENV_FLAG}

# 启动服务
CMD [ "pm2-runtime", "/app/pm2/ecosystem.config.js", "--only", "Web"]
