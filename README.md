# Skill Refiner CLI 🚀

[中文文档](./README_zh.md)

**Skill Refiner CLI** is a terminal tool built for AI engineers, designed to maximize the effectiveness of your `SKILL.md` files in AI engines through automated language translation and logic reconstruction (CoT).

## 🌟 Key Features

- **Native Thinking**: Write logic in your native language and reconstruct it into authentic AI-native instructions (English context) with one click.
- **Logic Elevation**: Automatically reconstruct into Chain of Thought (CoT) structures to significantly improve Agent task success rates.
- **Full Package Download**: Recursively downloads all subdirectories and files from the GitHub skill repository.
- **Privacy First**: Your **API Key is only stored locally**.
- **Minimalist Authentication**: Supports automatic browser callback login, no manual copy-pasting required.

## 📦 Prerequisites

- **Node.js**: [Required] Please ensure Node.js is installed. [Node.js Official Website (https://nodejs.org)](https://nodejs.org)

## 📦 Installation

You can install globally or run without installation using `npx`.

```bash
# Global installation
npm install -g skills-refiner
```

## 🚀 Usage Guide

### 1. Configure Default Language
```bash
skills-refiner config
```
Once configured, subsequent commands will use your default language if `-l <language>` is not specified.

### 2. Download Skill (Raw)
```bash
skills-refiner OpenAI/doc
```
Downloads the full package for the `OpenAI/doc` skill.

### 3. Download & Refine/Translate
```bash
skills-refiner <skill_name> -l <language>
# Example:
skills-refiner OpenAI/doc -l zh-CN
```

### 4. Refine Existing Local File
```bash
# Enter the directory containing the SKILL.md file first
skills-refiner -l <language>
```

### 5. List Supported Languages
```bash
skills-refiner -ls
```

### 6. Help Information
```bash
skills-refiner -h
```

## 🔒 Privacy Statement

1. **API Key Storage**: Your API Key is stored in your local system configuration directory using [conf](https://github.com/sindresorhus/conf), protected by the OS.
2. **Data Transmission**: `SKILL.md` content is sent to our servers for AI processing ONLY during refinement tasks.
3. **Device ID**: Anonymously generated device IDs are used solely for visitor quota tracking.

## 📄 License

[MIT License](./LICENSE)
