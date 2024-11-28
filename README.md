# hkpost-correct-addr-proxy

Proxy for HongKong Post Correct Addressing Services

透過此 API 寻找正确的香港地址

[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/mmhk/hkpost-correct-addr-proxy/latest)](https://hub.docker.com/r/mmhk/hkpost-correct-addr-proxy)
[![Docker Pulls](https://img.shields.io/docker/pulls/mmhk/hkpost-correct-addr-proxy)](https://hub.docker.com/r/mmhk/hkpost-correct-addr-proxy)
[![GitHub license](https://img.shields.io/github/license/mmhk/hkpost-correct-addr-proxy)](https://github.com/mmhk/hkpost-correct-addr-proxy/blob/master/LICENSE)

## 基础项目介绍
本项目提供了一个代理服务，用于调用香港邮政的正确地址查询服务。用户可以通过此API查询特定地区的详细地址信息，包括但不限于地区（District）、街道（Street）和建筑物（Building）。

### 示例地址
- 地区 (District): Kowloon City
- 街道 (Street): Nathan Road
- 建筑物 (Building): Mirador Mansion

### 使用方法
1. 访问 [香港邮政正确地址查询服务](https://webapp.hongkongpost.hk/correct_addressing/index.jsp?lang=en_US)
2. 输入地址信息，逐步填写地区、街道和建筑物。
3. 获取并使用返回的准确地址信息。


### Docker 使用说明

#### 前提条件
- 安装 Docker 和 Docker Compose。确保你的系统上已经安装了这两个工具。你可以通过以下命令检查是否已安装：
  ```sh
  docker --version
  docker-compose --version
  ```


#### 环境变量配置
在项目根目录下创建一个 `.env` 文件，并添加以下环境变量：
```env
PORT=3000
API_ENDPOINT=https://webapp.hongkongpost.hk/correct_addressing/api
AUTH_TOKEN=your_auth_token_here
```

请根据实际情况修改 `API_ENDPOINT` 和 `AUTH_TOKEN` 的值。

#### 启动服务
1. 使用 `docker-compose` 启动服务：
   ```sh
   docker-compose up -d
   ```

   这将以后台模式启动 `hkpost-correct-addr-proxy` 服务。

#### 验证服务
服务启动后，你可以通过访问以下 URL 来验证服务是否正常运行：
```
http://localhost:3004
```


#### 停止服务
要停止并移除所有容器，可以使用以下命令：
```sh
docker-compose down
```


#### 查看日志
你可以查看容器的日志以调试或监控服务：
```sh
docker-compose logs -f
```


#### 清理资源
如果你不再需要这些容器和网络，可以使用以下命令彻底清理：
```sh
docker-compose down --volumes --rmi all
```


### 注意事项
- 确保 `API_ENDPOINT` 和 `AUTH_TOKEN` 的值正确无误。
- 如果遇到任何问题，请检查 Docker 和 Docker Compose 的日志输出。

希望这些说明能帮助你顺利使用 Docker 来启动和管理 `hkpost-correct-addr-proxy` 服务。
