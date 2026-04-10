'use strict';

const MAX_LINES = 200;
const MAX_INPUT = 200;

const output = document.getElementById('output');
const input = document.getElementById('input');
const promptEl = document.getElementById('prompt');

const USER = 'matteo';
const HOST = 'home';

let cwd = ['~'];

/* ================= FILESYSTEM ================= */
const fs = {
    '~': {
        type: 'dir',
        contents: {

            'about.txt': {
                type: 'file',
                content: `ABOUT ME

Matteo Rosati
Junior CyberSecurity Engineer with a strong interest in software development and Cybersecurity.

During my Bachelor's degree in Computer Science at the University of Parma, I developed skills in:
- Software engineering
- Cybersecurity fundamentals
- OSINT and threat intelligence

Currently I'm working as a Junior CyberSecurity Engineer at Mead Informatica.`
            },

            'experience.txt': {
                type: 'file',
                content: `WORK EXPERIENCE

[february 2025 - april 2025]
Internship in Cybersecurity Delivery division - Mead Informatica

Project: Design and Development of a OSINT data collection solution

[april 2025 - now]
CyberSecurity Engineer — Mead Informatica

Main activities:
- Vulnerability Assessment (Qualys, Rapid7)
- Web Application Security Testing
- Active Directory Hardening
- Cloud Security Posture Evaluation
- Threat Intelligence (OSINT)
- Ethical phishing campaigns
- Internal scripting and automation`
            },

            'education.txt': {
                type: 'file',
                content: `EDUCATION

Bachelor's Degree in Computer Science
University of Parma (2022 – 2025)

Key areas:
- Cybersecurity & Networking
- Cloud & Linux systems
- Algorithms & Data Structures
- Software Engineering`
            },

            'contact.txt': {
                type: 'file',
                html: true,
                content: `CONTACT

Email: <a href="mailto:rosati.matteo2001@gmail.com">rosati.matteo2001@gmail.com</a>
LinkedIn: <a href="https://www.linkedin.com" target="_blank">linkedin.com</a>`
            }
        }
    }
};

/* ================= UTILS ================= */
function setPrompt() {
    promptEl.textContent = `${USER}@${HOST}:${cwd.join('/')}$`;
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

function print(text, className = '') {
    const line = document.createElement('div');

    // evidenzia titoli (tutto maiuscolo)
    if (text === text.toUpperCase() && text.trim() !== '' && text.length > 3) {
        className += ' title-line';
    }

    line.className = `terminal-line ${className} output-line`;
    line.textContent = text;

    output.appendChild(line);
    trimOutput();
    scrollToBottom();
}

function printHTML(html) {
    const line = document.createElement('div');
    line.className = 'terminal-line output-line';
    line.innerHTML = html;

    output.appendChild(line);
    trimOutput();
    scrollToBottom();
}

function printInput(text) {
    const line = document.createElement('div');
    line.className = 'terminal-line input-line-text';
    line.textContent = text;

    output.appendChild(line);
    trimOutput();
    scrollToBottom();
}

function trimOutput() {
    if (output.children.length > MAX_LINES) {
        output.removeChild(output.firstChild);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================= COMMANDS ================= */
async function runCommand(inputStr) {

    print(''); // spazio prima

    const raw = inputStr.trim();

    const [cmdRaw, ...args] = raw.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const full = raw.toLowerCase();

    /* ===== FAKE HACKER COMMANDS ===== */

    if (full.startsWith('pip install metasploit')) {
        print('Installing metasploit...');
        await sleep(1200);
        print('Downloading... 42%');
        await sleep(1200);
        print('Downloading... 100%');
        await sleep(800);
        print('Done.');
        print('');
        print('Installing hacking tools on a fake terminal.');
        print('Bold strategy.');
        print('');
        return;
    }

    if (cmd === 'ping') {
        const target = args[0] || '8.8.8.8';
        print(`Pinging ${target}...`);
        await sleep(800);
        print(`Reply from ${target}: time=32ms`);
        await sleep(600);
        print(`Reply from ${target}: time=29ms`);
        await sleep(600);
        print('');
        print('Connection stable.');
        print('At least something is.');
        print('');
        return;
    }

    if (full === 'sudo rm -rf /') {
        print('Deleting system...');
        await sleep(1000);
        print('...');
        await sleep(1000);
        print('...');
        await sleep(1000);
        print('Good try... if only it was real');
        print('');
        return;
    }

    if (full === 'sudo -i') {
        print('Giving sudo Permissions');
        await sleep(1000);
        print('Maybe...');
        for (let i = 0; i < 10; i++) {
            print('...');
            await sleep(500);            
        }
        print('Maybe not to you.');
        print('');
        return;
    }

    /* ===== REAL COMMANDS ===== */

    switch (cmd) {

        case 'help': {
            print('AVAILABLE COMMANDS:\n');

            print('help / panic   → Show this help menu');
            print('ls             → List available files');
            print('pwd            → Show current directory');
            print('cat <file>     → Display file content');
            print('clear          → Clear terminal');

            print('');
            print('Maybe some easter eggs exist, have fun');
            break;
        }

        case 'panic': {
            print('Well... Understandable. Hope this can help.\n');
            print('AVAILABLE COMMANDS:\n');

            print('help / panic   → Show this help menu');
            print('ls             → List available files');
            print('pwd            → Show current directory');
            print('cat <file>     → Display file content');
            print('clear          → Clear terminal');

            print('');
            print('Maybe some easter eggs exist, have fun');
            break;
        }
        

        case 'ls': {
            const dir = fs[cwd[0]].contents;
            Object.keys(dir).forEach(n => print(`- ${n}`));
            break;
        }

        case 'pwd':
            print(cwd.join('/'));
            break;

        case 'cat': {
            const dir = fs[cwd[0]].contents;
            const file = dir[args[0]];

            if (!file) {
                print('File not found', 'error');
                return;
            }

            if (file.html) {
                printHTML(file.content);
            } else {
                file.content.split('\n').forEach(line => {
                    print(line);

                    // spazio dopo titoli
                    if (line === line.toUpperCase() && line.trim() !== '') {
                        print('');
                    }
                });
            }
            break;
        }

        case 'clear':
            output.innerHTML = '';
            break;

        default:
            print('command not found', 'error');
    }

    print(''); // spazio dopo
}

/* ================= INPUT ================= */
input.addEventListener('keydown', async e => {

    if (e.key === 'Enter') {

        const value = input.value.trim();

        if (!value) return;

        if (value.length > MAX_INPUT) {
            print('Input too long', 'error');
            return;
        }

        printInput(`${promptEl.textContent} ${value}`);

        await runCommand(value);

        input.value = '';
    }
});

/* ================= INIT ================= */
setPrompt();
