# Skill Refiner CLI 🚀

[English Version](./README.md)

**Skill Refiner CLI** 是一个为 AI 工程师打造的终端工具，旨在通过自动化的语言转译与逻辑重构（CoT），让你的 `SKILL.md` 文件在 AI 引擎中发挥最大效能。

## 🌟 核心特性

- **母语思维**：支持中文编写逻辑，一键重构为地道的 AI 原生指令（English context）。
- **逻辑升维**：自动重构为思维链（Chain of Thought）结构，提升 Agent 执行成功率。
- **全量下载**：递归下载 GitHub 技能库的所有子目录及所有文件。
- **隐私优先**：你的 **API Key 仅存储在本地**。
- **极简认证**：支持自动浏览器回调登录，无需手动粘贴 Key。

## 📦 准备工作

- **Node.js**: [必选] 请确保已安装 Node.js。 [Node.js 官网 (https://nodejs.org)](https://nodejs.org)

## 📦 安装

可以使用全局安装，也可以使用 `npx` 免安装运行。

```bash
# 全局安装
npm install -g skills-refiner
```

## 🚀 使用指南

### 1. 配置默认语言
```bash
skills-refiner config
```
当配置完成语言后，后续命令如果没有指定 `-l <language>`，会默认读取你的配置。

### 2. 下载技能 (Raw)
```bash
skills-refiner OpenAI/doc
```
直接下载 `OpenAI/doc` skill 完整包。

### 3. 下载并重构/翻译
```bash
skills-refiner <skill_name> -l <language>
# 例如：
skills-refiner OpenAI/doc -l zh-CN
```

### 4. 对现有本地文件进行重构
```bash
# 需要先进入包含 SKILL.md 文件的目录
skills-refiner -l <language>
```

### 5. 查看支持语种
```bash
skills-refiner -ls
```

### 6. 帮助信息
```bash
skills-refiner -h
```

## 🔒 隐私声明

1. **API Key 存储**：您的 API Key 使用 [conf](https://github.com/sindresorhus/conf) 存储在您本地的系统配置目录下（由 OS 保护）。
2. **数据传输**：仅在执行重构任务时，会将 `SKILL.md` 内容发送至我们的服务器进行 AI 处理。
3. **设备 ID**：匿名生成的设备 ID 仅用于访客额度统计。

## 📄 开源协议

[MIT License](./LICENSE)
