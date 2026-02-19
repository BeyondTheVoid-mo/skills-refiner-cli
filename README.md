# Skill Refiner CLI 🚀

[中文文档](./README_zh.md)

**Skill Refiner CLI** is a terminal tool built for AI engineers, designed to maximize the effectiveness of your `SKILL.md` files in AI engines through automated language translation and logic reconstruction (CoT).

## 🌟 Key Features

- **Native Thinking**: Write logic in your native language (e.g., Chinese) and reconstruct it into authentic AI-native instructions (English context) with one click.
- **Logic Elevation**: Automatically reconstruct into Chain of Thought (CoT) structures to significantly improve Agent task success rates.
- **Full Package Download**: Not just `SKILL.md`—supports recursive downloading of all subdirectories from the GitHub skill repository.
- **Privacy First**: Your **API Key is only stored locally**.
- **Minimalist Authentication**: Supports automatic browser callback login, no manual copy-pasting required.

## 📦 Installation

```bash
npm install -g skills-refiner
```

## 🚀 Quick Start

### 1. Login & Auth
Simply run the refinement command. If points are insufficient, the CLI will guide you through the login process:
```bash
skills-refiner -l zh-CN
```

### 2. Download & Refine a Skill
```bash
# Download a specific skill and refine it into Chinese
skills-refiner facebook/react -l zh-CN
```

### 3. Local Refinement
Run in a directory containing `SKILL.md`:
```bash
skills-refiner -l zh-CN
```

## 🔒 Privacy Statement

1. **API Key Storage**: Your API Key is stored in your local system configuration directory using [conf](https://github.com/sindresorhus/conf), protected by the OS.
2. **Data Transmission**: `SKILL.md` content is sent to our servers for AI processing ONLY during refinement tasks.
3. **Device ID**: Anonymously generated device IDs are used solely for visitor quota tracking.

## 🛠 Development & Contribution

Issues and Pull Requests are welcome!

```bash
git clone https://github.com/BeyondTheVoid-mo/skills-refiner.git
cd CLI
npm install
npm link
```

## 📄 License

[MIT License](./LICENSE)
