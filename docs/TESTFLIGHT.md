# TestFlight 内测发布指南

把"绿晋机械臂" App 发到 Apple TestFlight，让指定的测试者通过 TestFlight App 安装。
**这不是正式上架 App Store**，但已经能在真实 iPhone 上跑。

> 全程不需要 Mac！EAS 在云端帮你构建。

---

## ⏱ 时间预估

| 步骤 | 耗时 |
|------|------|
| 注册 Apple Developer | 1-2 天（Apple 审核身份） |
| 注册 Expo 账号 + EAS 设置 | 10 分钟 |
| 第一次云构建 | 15-40 分钟 |
| TestFlight beta review | 通常 < 24 小时 |
| **总计** | **大约 2-4 天** |

## 💰 费用

| 项 | 价格 |
|------|------|
| Apple Developer Program | **$99 美元/年** |
| Expo 账号 / EAS Build 免费额度 | 30 build/月免费 |
| **总计** | **$99 一年** |

---

## 阶段 ① — 一次性准备（你做）

### 1.1 注册 Apple Developer Program

1. 访问 https://developer.apple.com/programs/enroll/
2. 用你的 Apple ID 登录（如果没有先注册）
3. 选 **Individual / 个人** 或 **Organization / 公司**（个人就够 TestFlight 用）
4. 填资料、付 $99
5. Apple 验证身份（1-2 天，有时邮件来回核对）
6. **审核通过后** 才能继续

### 1.2 注册 Expo 账号

1. 访问 https://expo.dev/signup
2. 用邮箱注册，记住 **username**

---

## 阶段 ② — 本地配置（一次性，5 分钟，跟着做）

打开 PowerShell，照着复制：

```powershell
# 进项目目录
cd C:\Users\Q\greenjin-mobile

# 登录 Expo（用 1.2 注册的账号）
eas login

# 初始化 EAS 项目（会自动写 projectId 到 app.json）
eas init

# 跟随提示：
#   Create a new project? → Yes
#   Name → greenjin-mobile（默认就行）
```

完成后 `app.json` 会多出一段：
```json
"extra": {
  "eas": { "projectId": "xxxxx-xxxx-xxxx-xxxx" }
}
```

---

## 阶段 ③ — 配置苹果签名（一次性）

EAS 帮你自动管理证书，但需要你授权它访问 Apple 账号：

```powershell
# 第一次会要求登录 Apple ID，输入开发者邮箱+密码+2FA
eas credentials -p ios
```

跟着提示选：
- **Set up build credentials** → Generate new keychain / certificate
- 它会自动:
  - 在 Apple Developer 注册你的 bundleId `tech.greenjin.mobile`
  - 创建分发证书
  - 创建 provisioning profile
  - 把这些存到 EAS 服务器

如果半路报 "App not found in App Store Connect"：
- 浏览器打开 https://appstoreconnect.apple.com/apps
- 点 **+ 号** → New App
  - Platform: iOS
  - Name: 绿晋机械臂
  - Bundle ID: 下拉选 `tech.greenjin.mobile`
  - SKU: `greenjin-001`（随便）
- 保存。然后回去重跑 `eas credentials -p ios`

---

## 阶段 ④ — 第一次构建（15-40 分钟）

```powershell
# 触发生产构建
eas build --platform ios --profile production
```

终端会显示一个链接 `https://expo.dev/accounts/.../builds/xxx`
打开能实时看构建日志。构建完会生成一个 `.ipa` 文件。

> 第一次构建可能要等 5-20 分钟队列（免费用户）。

---

## 阶段 ⑤ — 提交到 TestFlight

构建成功后：

```powershell
eas submit --platform ios --latest
```

它会自动把 `.ipa` 上传到 App Store Connect。
上传完后 Apple 会做 30-60 分钟的"processing"。

---

## 阶段 ⑥ — 在 App Store Connect 配置 TestFlight

1. 打开 https://appstoreconnect.apple.com/apps
2. 选 **绿晋机械臂**
3. 点 **TestFlight** 标签
4. 等 build 状态变成 **Ready to Test**（可能要等几分钟）
5. 第一次会要求填 **Test Information**（合规问题、测试备注）

**测试备注例文**（贴上即可，方便审核员理解）：
```
本应用是 LVJIN ROBOTICS SO101 工业机械臂的远程遥控器。

主要功能：
  - 实时监控关节角度、电机温度、末端位姿
  - 通过虚拟摇杆 / 滑块控制 6 自由度
  - 紧急停止按钮 + 触觉反馈
  - 数据采集模式

测试方式：
  - 应用启动后默认连接"模拟设备"（Mock），无需任何物理硬件
  - 可在 4 个标签页（监控/遥控/采集/设置）之间切换体验完整功能
  - 急停按钮按下后会切换为"解除急停"状态，再按一次恢复

合规：
  - 不收集任何个人数据
  - 不连接互联网（仅访问用户主动添加的局域网设备）
  - 使用 AES 等仅限于本地数据加密的库
```

6. 添加内测者：
   - **Internal Testers**：最多 100 人，App Store Connect 团队成员，立即可用
   - **External Testers**：最多 10000 人，需要 Apple 轻量 beta review（≈ 24h）
   - 把测试者邮箱填进去
7. 选择刚才的 build → 加入测试群组

---

## 阶段 ⑦ — 测试者安装

测试者收到邮件后：

1. 在 iPhone 上下载 **TestFlight**（App Store 免费）
2. 打开邮件里的链接，自动跳转 TestFlight
3. 点 **Install** 即可

---

## 后续：每次推新版本

```powershell
# 改完代码后 …

# 1. 升版本号（可选，eas 也会 auto-increment）
#    修改 app.json 的 version 和 ios.buildNumber

# 2. 构建
eas build --platform ios --profile production

# 3. 上传
eas submit --platform ios --latest
```

测试者会自动收到推送提示有新版本。

---

## 常见问题

### Q：第一次 `eas build` 卡在 "Waiting in queue"
A：免费版有队列。等 5-20 分钟即可。或升级 Pro $29/月跳过队列。

### Q：报错 "No matching profiles found"
A：跑 `eas credentials -p ios` 让它重新生成 provisioning profile。

### Q：build 成功但 TestFlight 看不到
A：去 App Store Connect → TestFlight → 等 "Processing" 完成（最长 1 小时）。

### Q：测试者收不到邀请邮件
A：检查邮箱拼写。或在 App Store Connect 给他们一个 **Public Link**（不限邮箱）。

### Q：Beta review 失败说"无法测试"
A：在 Test Information 里说明"应用启动后默认连接 Mock 模拟设备，无需硬件"，
   并附 demo 视频链接。

---

## 同时想发 Android？

```powershell
# Google Play Console 注册：https://play.google.com/console（$25 一次性）
# 然后：
eas build --platform android --profile production
eas submit --platform android --latest
```

Google Play 审核约 7-14 天，比 Apple 慢但更宽松。
