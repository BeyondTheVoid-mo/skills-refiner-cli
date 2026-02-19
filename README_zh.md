# Skill Refiner CLI 🚀

[English Version](./README.md)

**Skill Refiner CLI** 是一个为 AI 工程师打造的终端工具，旨在通过自动化的语言转译与逻辑重构（CoT），让你的 `SKILL.md` 文件在 AI 引擎中发挥最大效能。

## 🌟 核心特性

- **母语思维**：支持中文编写逻辑，一键重构为地道的 AI 原生指令（English context）。
- **逻辑升维**：自动重构为思维链（Chain of Thought）结构，提升 Agent 执行成功率。
- **全量下载**：不仅是 SKILL.md，支持递归下载 GitHub 技能库的所有子目录。
- **隐私优先**：你的 **API Key 仅存储在本地**。
- **极简认证**：支持自动浏览器回调登录，无需手动粘贴 Key。

## 📦 安装

```bash
npm install -g skills-refiner
```

## 🚀 快速开始

### 1. 登录
只需运行重构命令，如果点数不足，CLI 会指引你完成登录：
```bash
skills-refiner -l zh-CN
```

### 2. 下载并重构技能
```bash
# 下载指定技能并重构为中文
skills-refiner facebook/react -l zh-CN
```

### 3. 本地重构
在包含 `SKILL.md` 的目录下运行：
```bash
skills-refiner -l zh-CN
```

## 🔒 隐私声明

1. **API Key 存储**：您的 API Key 使用 [conf](https://github.com/sindresorhus/conf) 存储在您本地的系统配置目录下（由 OS 保护）。
2. **数据传输**：仅在执行重构任务时，会将 `SKILL.md` 内容发送至我们的服务器进行 AI 处理。
3. **设备 ID**：匿名生成的设备 ID 仅用于访客额度统计。

## 🛠 开发与贡献

欢迎提交 Issue 或 Pull Request！

```bash
git clone https://github.com/BeyondTheVoid-mo/skills-refiner.git
cd CLI
npm install
npm link
```

## 📄 开源协议

[MIT License](./LICENSE)
