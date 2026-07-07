'use strict';

const MAX_LINES = 200;
const MAX_INPUT = 200;

const output = document.getElementById('output');
const input = document.getElementById('input');
const promptEl = document.getElementById('prompt');

const USER = 'matteo';
const HOST = 'home';

let cwd = ['~'];

const MAX_HISTORY = 100;
const sessionStartedAt = Date.now();

let commandHistory = [];
let historyIndex = 0;
let historyDraft = '';
let commandRunning = false;

const AVAILABLE_COMMANDS = [
    'help',
    'panic',
    'ls',
    'pwd',
    'cat',
    'clear',
    'history',
    'whoami',
    'hostname',
    'date',
    'uptime',
    'uname',
    'echo',
    'neofetch',
    'man',
    'cd',
    'exit',
    'pip',
    'ping',
    'nmap',
    'whois',
    'nslookup',
    'ssh',
    'sudo'
];


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
- EDR-XDR Console Management [SentinelOne, TrendMicro, Sophos, Trellix ePO, Cynet, FortiClient EMS]
- Vulnerability Assessment [Qualys, Rapid7, Nessus]
- Web Application Security Testing [Qualys, Rapid7]
- Active Directory Hardening
- Cloud Security Posture Evaluation
- Threat Intelligence (OSINT)
- Ethical phishing campaigns
- Antispam Management
- CyberGuru
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

function currentDirectoryEntries() {
    const dir = fs[cwd[0]];
    return dir && dir.contents ? Object.keys(dir.contents) : [];
}

function resetHistoryNavigation() {
    historyIndex = commandHistory.length;
    historyDraft = '';
}

function addToHistory(command) {
    if (!command) return;

    commandHistory.push(command);

    if (commandHistory.length > MAX_HISTORY) {
        commandHistory.shift();
    }

    resetHistoryNavigation();
}

function navigateHistory(direction) {
    if (!commandHistory.length) return;

    if (direction < 0) {
        if (historyIndex === commandHistory.length) {
            historyDraft = input.value;
        }

        historyIndex = Math.max(0, historyIndex - 1);
        input.value = commandHistory[historyIndex];
    } else {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex += 1;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = historyDraft;
        }
    }

    requestAnimationFrame(() => {
        input.setSelectionRange(input.value.length, input.value.length);
    });
}

function longestCommonPrefix(values) {
    if (!values.length) return '';

    let prefix = values[0];

    for (let i = 1; i < values.length; i++) {
        while (prefix && !values[i].startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
        }

        if (!prefix) break;
    }

    return prefix;
}

function completionContext(value) {
    const leadingWhitespace = (value.match(/^\s*/) || [''])[0];
    const body = value.slice(leadingWhitespace.length);
    const endsWithSpace = /\s$/.test(body);
    const tokens = body.trim() ? body.trim().split(/\s+/) : [];

    if (!tokens.length) {
        return {
            candidates: AVAILABLE_COMMANDS,
            prefix: '',
            tokenStart: value.length
        };
    }

    if (tokens.length === 1 && !endsWithSpace) {
        const prefix = tokens[0];

        return {
            candidates: AVAILABLE_COMMANDS.filter(command => command.startsWith(prefix.toLowerCase())),
            prefix,
            tokenStart: leadingWhitespace.length
        };
    }

    const command = tokens[0].toLowerCase();
    const prefix = endsWithSpace ? '' : tokens[tokens.length - 1];
    const tokenStart = endsWithSpace ? value.length : value.length - prefix.length;

    if (command === 'cat') {
        return {
            candidates: currentDirectoryEntries().filter(name => name.startsWith(prefix)),
            prefix,
            tokenStart
        };
    }

    if (command === 'man') {
        return {
            candidates: AVAILABLE_COMMANDS.filter(name => name.startsWith(prefix.toLowerCase())),
            prefix,
            tokenStart
        };
    }

    if (command === 'cd') {
        const dirs = ['~', '.', '..'];

        return {
            candidates: dirs.filter(name => name.startsWith(prefix)),
            prefix,
            tokenStart
        };
    }

    return {
        candidates: [],
        prefix,
        tokenStart
    };
}

function autocompleteInput() {
    const value = input.value;
    const context = completionContext(value);
    const candidates = context.candidates;

    if (!candidates.length) return;

    const before = value.slice(0, context.tokenStart);
    const after = value.slice(context.tokenStart + context.prefix.length);

    if (candidates.length === 1) {
        const completed = candidates[0];
        const isFirstToken = context.tokenStart === (value.match(/^\s*/) || [''])[0].length;
        const suffix = isFirstToken && !after ? ' ' : '';

        input.value = before + completed + suffix + after;

        requestAnimationFrame(() => {
            const caret = (before + completed + suffix).length;
            input.setSelectionRange(caret, caret);
        });

        return;
    }

    const commonPrefix = longestCommonPrefix(candidates);

    if (commonPrefix.length > context.prefix.length) {
        input.value = before + commonPrefix + after;

        requestAnimationFrame(() => {
            const caret = (before + commonPrefix).length;
            input.setSelectionRange(caret, caret);
        });

        return;
    }

    printInput(`${promptEl.textContent} ${value}`);
    print(candidates.join('    '));
}

function formatSessionUptime() {
    const totalSeconds = Math.max(1, Math.floor((Date.now() - sessionStartedAt) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}, ${minutes} min`;
    }

    if (minutes > 0) {
        return `${minutes} min`;
    }

    return `${totalSeconds} sec`;
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

    // Classic sudo behaviour for everything not already handled above.
    if (cmd === 'sudo') {
        print(`${USER} is not in the sudoers file. This incident will be reported.`, 'error');
        await sleep(600);
        print('Incident report status: immediately forgotten.');
        print('');
        return;
    }

    switch (cmd) {

        case 'help': {
            print('AVAILABLE COMMANDS:\n');
            print('help / panic   → Show this help menu');
            print('ls             → List available files');
            print('pwd            → Show current directory');
            print('cat <file>     → Display file content');
            print('history        → Show previously used commands');
            print('whoami         → Show the current user');
            print('hostname       → Show the host name');
            print('date           → Show current date and time');
            print('uptime         → Show terminal session uptime');
            print('uname -a       → Show fake-but-believable system info');
            print('echo <text>    → Print text');
            print('neofetch       → Absolutely essential system information');
            print('man <command>  → Show a tiny manual page');
            print('clear          → Clear terminal');
            print('');
            print('Keyboard: TAB autocomplete · ↑/↓ history · Ctrl+L clear · Ctrl+C cancel line · Ctrl+U clear line');
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
            print('history        → Show previously used commands');
            print('whoami         → Show the current user');
            print('hostname       → Show the host name');
            print('date           → Show current date and time');
            print('uptime         → Show terminal session uptime');
            print('uname -a       → Show fake-but-believable system info');
            print('echo <text>    → Print text');
            print('neofetch       → Absolutely essential system information');
            print('man <command>  → Show a tiny manual page');
            print('clear          → Clear terminal');
            print('');
            print('Keyboard: TAB autocomplete · ↑/↓ history · Ctrl+L clear · Ctrl+C cancel line · Ctrl+U clear line');
            print('');
            print('Maybe some easter eggs exist, have fun little hacker');
            break;
        }

        case 'history': {
            if (args[0] === '-c') {
                commandHistory = [];
                resetHistoryNavigation();
                print('History cleared. Plausible deniability restored.');
                break;
            }

            commandHistory.forEach((entry, index) => {
                print(`${String(index + 1).padStart(4, ' ')}  ${entry}`);
            });
            break;
        }

        case 'whoami':
            print(USER);
            break;

        case 'hostname':
            print(HOST);
            break;

        case 'date':
            print(new Date().toString());
            break;

        case 'uptime': {
            const load1 = (Math.random() * 0.20 + 0.01).toFixed(2);
            const load5 = (Math.random() * 0.20 + 0.01).toFixed(2);
            const load15 = (Math.random() * 0.20 + 0.01).toFixed(2);

            print(` ${new Date().toLocaleTimeString()} up ${formatSessionUptime()}, 1 user, load average: ${load1}, ${load5}, ${load15}`);
            print('System healthy. Coffee dependency not monitored.');
            break;
        }

        case 'uname':
            if (args.includes('-a')) {
                print(`Linux ${HOST} 6.8.0-terminal #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`);
            } else {
                print('Linux');
            }
            break;

        case 'echo':
            print(args.join(' '));
            break;

        case 'neofetch': {
            print('        .--.');
            print('       |o_o |');
            print('       |:_/ |');
            print('      //   \\ \\');
            print('     (|     | )');
            print('    /\'_   _/`\\');
            print('    \\___)=(___/');
            print('');
            print(`${USER}@${HOST}`);
            print('------------');
            print('OS: Portfolio Linux');
            print('Host: Browser tab');
            print('Kernel: 6.8.0-definitely-real');
            print('Shell: javascript');
            print(`Uptime: ${formatSessionUptime()}`);
            print('Packages: enough');
            print('CPU: your device is doing all the work');
            print('Security: optimism-based');
            break;
        }

        case 'man': {
            const topic = (args[0] || '').toLowerCase();

            const pages = {
                help: 'help - display the commands you probably should have read first',
                ls: 'ls - list files in the current directory',
                pwd: 'pwd - print the current working directory',
                cat: 'cat <file> - print a file to the terminal',
                history: 'history [-c] - show command history; -c clears the evidence',
                clear: 'clear - clear terminal output',
                ping: 'ping <host> - send four extremely convincing fake packets',
                nmap: 'nmap <target> - simulate a port scan without alarming the SOC',
                ssh: 'ssh user@host - simulate a remote login attempt',
                neofetch: 'neofetch - consume screen space in the traditional Linux way',
                sudo: 'sudo - request privileges and receive emotional damage'
            };

            if (!topic) {
                print('What manual page do you want?', 'error');
            } else if (pages[topic]) {
                print(pages[topic]);
            } else {
                print(`No manual entry for ${topic}. Even this fake OS has limits.`, 'error');
            }

            break;
        }

        case 'cd': {
            const target = args[0];

            if (!target || target === '~' || target === '.') {
                cwd = ['~'];
                setPrompt();
                break;
            }

            if (target === '..') {
                print('You are already at the top of this tiny universe.');
                break;
            }

            print(`bash: cd: ${target}: No such file or directory`, 'error');
            break;
        }

        case 'exit':
            print('logout');
            await sleep(350);
            print('Nice try. This terminal lives in the page.');
            break;

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

    if (e.key === 'Tab') {
        e.preventDefault();
        autocompleteInput();
        return;
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateHistory(-1);
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHistory(1);
        return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        output.innerHTML = '';
        return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        input.value = '';
        return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();

        if (input.value) {
            printInput(`${promptEl.textContent} ${input.value}^C`);
        } else {
            printInput(`${promptEl.textContent} ^C`);
        }

        input.value = '';
        resetHistoryNavigation();
        return;
    }

    if (e.key === 'Enter') {
        e.preventDefault();

        if (commandRunning) return;

        const value = input.value.trim();

        if (!value) return;

        if (value.length > MAX_INPUT) {
            print('Input too long', 'error');
            return;
        }

        addToHistory(value);
        printInput(`${promptEl.textContent} ${value}`);

        input.value = '';
        commandRunning = true;
        input.readOnly = true;

        try {
            await runCommand(value);
        } finally {
            commandRunning = false;
            input.readOnly = false;
            resetHistoryNavigation();
            input.focus();
        }
    }
});

/* ================= INIT ================= */
setPrompt();
input.focus();
