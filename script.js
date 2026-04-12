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

    print('');

    const raw = inputStr.trim();
    const [cmdRaw, ...args] = raw.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const full = raw.toLowerCase();

    /* ===== FAKE HACKER COMMANDS ===== */

    // pip install dinamico
    if (cmd === 'pip' && args[0] === 'install') {
        const pkg = args[1];

        if (!pkg) {
            print('Usage: pip install <package>', 'error');
            return;
        }

        const version = `${Math.floor(Math.random()*5)+1}.${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*10)}`;

        print(`Collecting ${pkg}...`);
        await sleep(2000);

        print(`Downloading ${pkg}-${version}.tar.gz`);
        await sleep(4000);

        print(`Installing collected packages: ${pkg}`);
        await sleep(4000);

        print(`Successfully installed ${pkg}-${version}`);
        print('');

        const jokes = [
            'The software you installed is useful, this website to run it... maybe not',
            'Successfully wasted: 10 sec ',
        ];

        print(`You just installed ${pkg}.`);
        print(jokes[Math.floor(Math.random() * jokes.length)]);
        print('');
        return;
    }

    // ping dinamico
    if (cmd === 'ping') {
        const target = args[0];

        if (!target) {
            print('Usage: ping <host>', 'error');
            return;
        }

        print(`PING ${target}: 56 data bytes`);

        for (let i = 0; i < 4; i++) {
            await sleep(500);
            const time = Math.floor(Math.random() * 50) + 10;
            print(`64 bytes from ${target}: time=${time}ms`);
        }

        print('');
        print(`--- ${target} ping statistics ---`);
        print(`4 packets transmitted, 4 received, 0% packet loss`);

        print('');
        print('Connection looks solid.');
        print('At least something is...');
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
        print('Good try... consider using it on your hacking skills instead.');
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

        // nmap fake
    if (cmd === 'nmap') {
        const target = args[0];

        if (!target) {
            print('Usage: nmap <target>', 'error');
            return;
        }

        print(`Starting Nmap scan against ${target}...`);
        await sleep(5000);

        print('Scanning ports...');
        await sleep(10000);

        const ports = [22, 80, 443, 8080];
        ports.forEach(p => {
            const isOpen = Math.random() > 0.3;
            print(`${p}/tcp ${isOpen ? 'open' : 'closed'} service`);
        });

        print('');
        print('Nmap scan complete.');

        const jokes = [
            'Nmap from a fake terminal is a good idea... as is knowing what you are doing.',
            'Good try, hacker.'
        ];

        print(jokes[Math.floor(Math.random() * jokes.length)]);
        print('');
        return;
    }

    // whois fake
    if (cmd === 'whois') {
        const domain = args[0];

        if (!domain) {
            print('Usage: whois <domain>', 'error');
            return;
        }

        print(`Querying WHOIS database for ${domain}...`);
        await sleep(2000);

        print(`Domain Name: ${domain}`);
        print('Registrar: Registrar Inc.');
        print('Creation Date: 2025-04-12');
        print('Expiry Date: 2030-04-12');
        print(`Name Servers: ns1.${domain}.net, ns2.${domain}.net`);

        print('');
        print('WHOIS lookup complete.');

        const jokes = [
            'If you ended up here, you wasted your time. Well done.',
            'Next step: forget everything you just saw.'
        ];

        print(jokes[Math.floor(Math.random() * jokes.length)]);
        print('');
        return;
    }

    // nslookup fake
    if (cmd === 'nslookup') {
        const domain = args[0];

        if (!domain) {
            print('Usage: nslookup <domain>', 'error');
            return;
        }

        print(`Server: 8.8.8.8`);
        print(`Address: 8.8.8.8#53`);
        print('');
        await sleep(1000);

        const fakeIP = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

        print(`Name: ${domain}`);
        print(`Address: ${fakeIP}`);

        print('');
        print('DNS resolution complete.');

        const jokes = [
            'Well done: NSlookup from a fake CLI. HaCkEr.',
            'Next step: pretend you know what to do with these info.'
        ];

        print(jokes[Math.floor(Math.random() * jokes.length)]);
        print('');
        return;
    }

    // ssh fake
    if (cmd === 'ssh') {
        const target = args[0];

        if (!target) {
            print('Usage: ssh user@host', 'error');
            return;
        }

        print(`Connecting to ${target}...`);
        await sleep(1000);

        print(`Authenticating to ${target}......`);
        await sleep(1200);

        const success = Math.random() > 0.7;

        if (success) {
            print('Access granted.');
            print(`Welcome to ${target}`);
            print('');
            await sleep(500);
            print('you can still use the terminal to move on my website.');
        } else {
            print('Permission denied (publickey,password).');
            print('');
            print(`Impossible to connect to ${target}: wrong password`);
            await sleep(500);
            print('Maybe try to use a real terminal');
        }

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
            print('Maybe some easter eggs exist, have fun little hacker');
            break;
        }

        case 'panic': {
            print('Understandable...\n')
            print('AVAILABLE COMMANDS:\n');
            print('help / panic   → Show this help menu');
            print('ls             → List available files');
            print('pwd            → Show current directory');
            print('cat <file>     → Display file content');
            print('clear          → Clear terminal');
            print('');
            print('Maybe some easter eggs exist, have fun little hacker');
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

    print('');
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