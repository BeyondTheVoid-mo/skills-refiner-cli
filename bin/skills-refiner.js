#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import osLocale from 'os-locale';
import nodeMachineId from 'node-machine-id';
const { machineId } = nodeMachineId;
import Conf from 'conf';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import Table from 'cli-table3';
import { languages } from '../languages.js';
import axios from 'axios';
import { select, password } from '@inquirer/prompts';
import AdmZip from 'adm-zip';
import http from 'http';

const program = new Command();
const config = new Conf({ projectName: 'skills-refiner' });

const API_BASE = process.env.API_URL || 'https://skills-refiner.com/api/v1';

async function getLanguage() {
  return config.get('default_lang') || await detectOSLocale();
}

async function detectOSLocale() {
  try {
    const locale = await osLocale();
    return locale.split('-')[0] || 'en';
  } catch {
    return 'en';
  }
}

async function getDeviceId() {
  let id = config.get('device_id');
  if (!id) {
    try {
      id = await machineId();
    } catch {
      const crypto = await import('crypto');
      id = crypto.randomUUID();
    }
    config.set('device_id', id);
  }
  return id;
}

async function handleServerAction(data) {
  if (!data.action) return false;

  const action = data.action;
  const message = data.message || data.error || 'Action required';

  switch (action.type) {
    case 'OPEN_LOGIN':
      console.log(chalk.yellow(`\n✖ ${message}`));
      if (action.url) {
        await handleAuthFlow(action.url);
      }
      return true;
    case 'RECHARGE':
      console.log(chalk.yellow(`\n✖ ${message}`));
      if (action.url) {
        console.log(chalk.cyan(`Opening recharge page: ${action.url}`));
        await open(action.url);
      }
      process.exit(1);
    case 'REQUIRE_UPDATE':
      console.log(chalk.red(`\n✖ ${message}`));
      console.log(chalk.yellow(`Please update your CLI tool.`));
      if (action.url) {
        console.log(chalk.dim(`More info: ${action.url}`));
      }
      console.log(chalk.white(`Run: npm install -g skills-refiner@latest`));
      process.exit(1);
    case 'CHECK_UPDATE':
      console.log(chalk.cyan(`\nℹ Update available: ${message}`));
      console.log(chalk.yellow(`Run: ${action.update_command || 'npm install -g skills-refiner@latest'}`));
      process.exit(1);
    default:
      return false;
  }
}

async function handleAuthFlow(loginUrl) {
  // Start temporary local server to receive API Key
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // Handle CORS for browser
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === 'POST' && req.url === '/callback') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.apiKey) {
              config.set('api_key', data.apiKey);
              console.log(chalk.green(`\n✔ API Key saved successfully!`));
              console.log(chalk.cyan(`Please re-run your command to continue with your new points.`));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));

              setTimeout(() => {
                server.close();
                process.exit(0);
              }, 1000);
            }
          } catch (e) {
            res.writeHead(400);
            res.end();
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    const port = 3105; // Fixed port for easier browser callback or find free one
    server.listen(port, async () => {
      const authUrlWithCallback = `${loginUrl}&callback=http://localhost:${port}/callback`;
      console.log(chalk.blue(`\nLogin URL: ${authUrlWithCallback}`));
      console.log(chalk.yellow('Waiting for browser authentication...'));
      await open(authUrlWithCallback);
    });

    server.on('error', (err) => {
      console.log(chalk.red(`\nLocal server error: ${err.message}`));
      console.log(chalk.yellow(`Fallback: After logging in, copy your API Key and run: skills-refiner config`));
      resolve(false);
    });

    // Timeout if user takes too long
    setTimeout(() => {
      if (server.listening) {
        server.close();
        resolve(false);
      }
    }, 300000); // 5 mins
  });
}



async function refineContent(content, lang, slugForDisplay = 'local', version = '1.0.0') {
  const spinner = ora(chalk.cyan(`Refining ${slugForDisplay} into [${lang}]...`)).start();
  const deviceId = await getDeviceId();
  const apiKey = config.get('api_key');

  try {
    const response = await axios.post(`${API_BASE}/cli/refine`, {
      content,
      target_lang: lang,
      client_type: 'cli',
      client_version: version
    }, {
      headers: {
        'X-Device-ID': deviceId,
        'Authorization': apiKey ? `Bearer ${apiKey}` : undefined
      }
    });

    spinner.succeed(chalk.green(`Refined successfully!`));
    return response.data.refined_content;
  } catch (err) {
    spinner.stop();
    if (err.response && err.response.data) {
      const handled = await handleServerAction(err.response.data);
      if (handled) return null;
      console.log(chalk.red(`\nAPI Error: ${err.response.data.error || 'Unknown error'}`));
    } else {
      console.log(chalk.red(`\nNetwork Error: ${err.message}`));
    }
    process.exit(1);
  }
}

async function downloadAndExtractSkill(slug, targetDir, refinedContent = null) {
  const spinner = ora(chalk.cyan(`Downloading full skill bundle [${slug}]...`)).start();
  try {
    const response = await axios.post(`${API_BASE}/cli/skills/${slug}/download`, {
      refined_content: refinedContent
    }, {
      responseType: 'arraybuffer',
      timeout: 60000 // 60s timeout
    });

    const zip = new AdmZip(Buffer.from(response.data));
    zip.extractAllTo(targetDir, true);
    spinner.succeed(chalk.green(`Skill [${slug}] downloaded and extracted to ${targetDir}`));
  } catch (err) {
    spinner.fail(chalk.red(`Failed to download skill bundle: ${err.message}`));
    process.exit(1);
  }
}

(async () => {
  try {
    // We can't always rely on package.json being relative if installed globally in a weird way,
    // but standard node CLI structure usually keeps them together.
    const pkgPath = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));

    // Alias -ls to --ls
    process.argv = process.argv.map(arg => arg === '-ls' ? '--ls' : arg);

    program
      .name('skills-refiner')
      .version(pkg.version)
      .description('Refine your SKILL.md for AI Agents')
      .argument('[skillName]', 'Optional: Name of the skill to download (e.g., OpenAI/doc)')
      .option('-l, --lang <lang>', 'Target language (e.g., zh-CN)')
      .option('--ls, --list', 'Show supported languages')
      .action(async (skillName, options) => {
        // --- 1. Handle --list / -ls ---
        if (options.list) {
          const table = new Table({ head: [chalk.cyan('Language'), chalk.cyan('Code')] });
          languages.forEach(l => table.push([l.name, l.code]));
          console.log(table.toString());
          process.exit(0);
        }

        // --- 2. Determine Target Language ---
        // For download (<skillName>), we ONLY refine if -l is explicitly provided (per latest user request).
        // For local (no <skillName>), we use -l or config or auto-detect.
        let targetLang = options.lang;
        if (!skillName && !targetLang) {
          targetLang = config.get('default_lang');
        }

        let content;

        // --- 3. Scenario A: Download specific skill ---
        if (skillName) {
          // Fetch metadata first to ensure it exists
          const skillMeta = await axios.get(`${API_BASE}/cli/skills/${skillName}`);
          if (!skillMeta.data.success) {
            console.log(chalk.red(`Skill not found: ${skillName}`));
            process.exit(1);
          }
          content = skillMeta.data.data.content;
          console.log(chalk.green(`Skill [${skillName}] found.`));
        } else {
          // --- 4. Scenario B: Local File Refinement ---
          const localPath = path.resolve(process.cwd(), 'SKILL.md');
          try {
            content = await fs.readFile(localPath, 'utf-8');
            console.log(chalk.blue(`Found local SKILL.md.`));
          } catch {
            console.log(chalk.yellow(`SKILL.md not found in current directory.`));
            console.log(chalk.dim(`Usage:`));
            console.log(chalk.dim(`  Download: skills-refiner <skill-name>   (e.g. OpenAI/doc)`));
            console.log(chalk.dim(`  Refine:   skills-refiner -l <lang>      (Refine local SKILL.md)`));
            process.exit(1);
          }
        }

        // --- 5. Validate Language and Refine ---
        let finalContent = content;

        if (targetLang) {
          const isValid = languages.some(l => l.code === targetLang || l.code.split('-')[0] === targetLang);
          if (!isValid) {
            console.log(chalk.red(`Invalid language code: ${targetLang}`));
            console.log(chalk.yellow(`Use --ls to see available languages.`));
            process.exit(1);
          }

          const refined = await refineContent(content, targetLang, skillName || 'local', pkg.version);
          if (refined) finalContent = refined;
        } else if (!skillName) {
          // Local file, but no lang and no config. Auto-detect OS.
          targetLang = await detectOSLocale();
          console.log(chalk.dim(`No language specified. Defaulting to system locale: ${targetLang}`));
          const refined = await refineContent(content, targetLang, 'local', pkg.version);
          if (refined) finalContent = refined;
        } else {
          // Downloading raw
          console.log(chalk.cyan(`Saving raw skill content...`));
        }

        // --- 6. Final Execution & Download ---
        if (skillName) {
          const targetDir = path.resolve(process.cwd(), skillName);
          await downloadAndExtractSkill(skillName, targetDir, targetLang ? finalContent : null);

          if (!targetLang) {
            console.log(chalk.cyan(`\nTip: To refine/translate this skill, run:`));
            console.log(chalk.white(`  skills-refiner -l zh-CN`));
          }
        } else {
          // Local refinement save logic
          const savePath = path.resolve(process.cwd(), 'SKILL.md');
          const backupPath = path.resolve(process.cwd(), 'SKILL_BAK.md');

          try {
            await fs.access(savePath);
            await fs.copyFile(savePath, backupPath);
            console.log(chalk.dim(`Backed up existing SKILL.md to SKILL_BAK.md`));
          } catch { }

          await fs.writeFile(savePath, finalContent);
          console.log(chalk.green(`\n✔ Refinement applied to SKILL.md`));
        }
      });

    program
      .command('config')
      .description('Configure default settings')
      .action(async () => {
        const choice = await select({
          message: 'What would you like to configure?',
          choices: [
            { name: 'Default Language', value: 'lang' },
            { name: 'API Key', value: 'key' },
            { name: 'Exit', value: 'exit' }
          ]
        });

        if (choice === 'lang') {
          const lang = await select({
            message: 'Select default target language:',
            choices: languages.map(l => ({ name: `${l.name} (${l.code})`, value: l.code })),
            default: config.get('default_lang') || 'zh-CN'
          });
          config.set('default_lang', lang);
          console.log(chalk.green(`Default language set to: ${lang}`));
        } else if (choice === 'key') {
          const key = await password({
            message: 'Enter your API Key:',
            mask: '*',
          });
          if (key) {
            config.set('api_key', key);
            console.log(chalk.green('API Key updated!'));
          }
        }
      });

    program
      .command('logout')
      .description('Remove API Key and login state')
      .action(() => {
        config.delete('api_key');
        console.log(chalk.green('Logged out successfully.'));
      });

    program.parse();
  } catch (err) {
    console.error(chalk.red(`Fatal Error: ${err.message}`));
    process.exit(1);
  }
})();
