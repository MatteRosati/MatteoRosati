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
                content: `PRESENTAZIONE
Matteo Rosati
Junior CyberSecurity Engineer, appassionato di sviluppo software e sicurezza informatica.
Durante il percorso di laurea in Informatica presso l'Università degli Studi di Parma,
ho maturato competenze in sviluppo software, sicurezza informatica e OSINT.
Attualmente lavoro come Junior CyberSecurity Engineer presso Mead Informatica.`
            },

            'experience.txt': {
                type: 'file',
                content: `ESPERIENZA LAVORATIVA
Mead Informatica SRL | Reggio nell'Emilia, Italia
[07/04/2025 – Attuale] CyberSecurity Engineer

- Vulnerability Assessment
- Web Application Security Testing
- Active Directory Hardening
- Threat Intelligence (OSINT)
- Ethical Phishing Campaigns`
            },

            'education.txt': {
                type: 'file',
                content: `ISTRUZIONE
Università degli Studi di Parma
Laurea in Informatica

Focus:
- Cybersecurity
- Networking
- Cloud & Linux`
            },

            'contact.txt': {
                type: 'file',
                html: true,
                content: `Email: <a href="mailto:rosati.matteo2001@gmail.com">rosati.matteo2001@gmail.com</a>
LinkedIn: <a href="https://www.linkedin.com" target="_blank">linkedin</a>`
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

/* OUTPUT NORMALE (BIANCO) */
function print(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className} output-line`;
    line.textContent = text;

    output.appendChild(line);
    trimOutput();
    scrollToBottom();
}

/* OUTPUT HTML (solo controllato da te) */
function printHTML(html) {
    const line = document.createElement('div');
    line.className = 'terminal-line output-line';
    line.innerHTML = html;

    output.appendChild(line);
    trimOutput();
    scrollToBottom();
}

/* INPUT UTENTE */
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

    const raw = inputStr.trim();

    // 🔥 CASE INSENSITIVE
    const [cmdRaw, ...args] = raw.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const full = raw.toLowerCase();

    /* ===== FAKE HACKER COMMANDS ===== */

    if (full.startsWith('install metasploit')) {
        print('Installing metasploit...');
        await sleep(1200);
        print('Downloading... 42%');
        await sleep(1200);
        print('Downloading... 100%');
        await sleep(800);
        print('Done.');
        print('');
        print('Wow.');
        print('Installing hacking tools on a fake terminal.');
        print('Elite move.');
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
        print('Unlike your hacking career.');
        return;
    }

    if (cmd === 'hack') {
        print(`Hacking ${args[0] || 'target'}...`);
        await sleep(1500);
        print('Bypassing firewall...');
        await sleep(1000);
        print('Access granted.');
        print('');
        print('Everything is fake.');
        print('Including this success.');
        return;
    }

    if (full === 'sudo rm -rf /') {
        print('Deleting system...');
        await sleep(1000);
        print('...');
        await sleep(1000);
        print('...');
        await sleep(1000);
        print('Relax.');
        print('Nothing here was real.');
        return;
    }

    if (full === 'sudo -i') {
        print("nice try.");
        return;
    }

    /* ===== REAL COMMANDS ===== */

    switch (cmd) {

        case 'help':
        case 'panic':
            print('Available commands:');
            print('help ls pwd cat clear');
            print('');
            print('Or try something shady...');
            break;

        case 'ls': {
            const dir = fs[cwd[0]].contents;
            Object.keys(dir).forEach(n => print(n));
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
                print(file.content);
            }
            break;
        }

        case 'clear':
            output.innerHTML = '';
            break;

        default:
            print('command not found', 'error');
    }
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

        // 🔥 INPUT UTENTE IN BIANCO
        printInput(`${promptEl.textContent} ${value}`);

        await runCommand(value);

        input.value = '';
    }
});

/* ================= INIT ================= */
setPrompt();