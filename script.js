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

Attività principali:
- Vulnerability Assessment con Qualys e Rapid7
- Web Application Security Testing con Qualys e Rapid7
- Hardening Active Directory e Cloud Security Posture Evaluation
- Deployment, migrazione e gestione antivirus: SentinelOne, Sophos, TrendMicro, Trellix EPO
- Threat Intelligence (OSINT) tramite Shodan, Zoomeye e Rapid7 Threat Command
- Realizzazione e gestione campagne di phishing etico personalizzate
- Scripting e sviluppo software interno
- In formazione: assessment dei backup`
            },

            'education.txt': {
                type: 'file',
                content: `ISTRUZIONE E FORMAZIONE
Università degli Studi di Parma | Parma, Italia
[19/09/2022 – 24/11/2025] Laurea in Informatica (EQF Livello 6)
Siti di riferimento: https://www.unipr.it/

Corsi principali e interessi:
- Basi di dati: MySQL 8.0, PostgreSQL
- Programmazione: C++, principi OOP (incapsulamento, ereditarietà, polimorfismo, SOLID)
- Algoritmi e strutture dati: C e C++
- Ingegneria del software: Git, GitHub, HTML, CSS, JavaScript, PHP, Bootstrap, MySQL, Docker, UML, gestione progetti
- Sistemi IT e cloud: Linux, Docker, Kubernetes, AWS
- Reti di calcolatori: protocolli, cifratura, networking, apparati di rete, CyberSecurity introduttiva`
            },

            'contact.txt': {
                type: 'file',
                html: true,
                content: `Email: <a href="mailto:rosati.matteo2001@gmail.com">rosati.matteo2001@gmail.com</a>
LinkedIn: <a href="https://www.linkedin.com/in/matteo-rosati-a60268326/" target="_blank">linkedin.com/in/matteo-rosati-a60268326</a>`
            }

        }
    }
};

/* ================= UTILS ================= */
function setPrompt() {
    promptEl.textContent = `${USER}@${HOST}:${cwd.join('/')}$`;
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function print(text, className='') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    output.appendChild(line);

    if (output.children.length > MAX_LINES) {
        output.removeChild(output.firstChild);
    }

    scrollToBottom();
}

function printHTML(html) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = html;
    output.appendChild(line);

    if (output.children.length > MAX_LINES) {
        output.removeChild(output.firstChild);
    }

    scrollToBottom();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================= COMMANDS ================= */
async function runCommand(inputStr) {
    const [cmd, ...args] = inputStr.split(/\s+/);
    const full = inputStr.toLowerCase();

    /* ===== FAKE HACKER COMMANDS ===== */
    if (full.startsWith('install metasploit')) {
        print('Installing metasploit...');
        await sleep(1500);
        print('Downloading... 50%');
        await sleep(1500);
        print('Downloading... 100%');
        await sleep(1000);
        print('Installation complete.');
        print('');
        print('Well... installing tools on a fake CLI.');
        print('Bold move, hAcKeR.');
        return;
    }

    if (cmd === 'ping') {
        const target = args[0] || '8.8.8.8';
        const time1 = Math.floor(Math.random() * 20) + 30;
        const time2 = Math.floor(Math.random() * 20) + 30;

        print(`Pinging ${target} with 32 bytes of data...`);
        await sleep(1000);
        print(`Reply from ${target}: bytes=32 time=${time1}ms TTL=128`);
        await sleep(800);
        print(`Reply from ${target}: bytes=32 time=${time2}ms TTL=128`);
        await sleep(800);
        print('');
        print('Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)');
        print('');
        print('Stable connection.');
        print('To whatever you just typed.');
        print('Convincing.');
        return;
    }

    if (cmd === 'hack') {
        print(`Attempting breach on ${args[0] || 'target'}...`);
        await sleep(2000);
        print('Bypassing firewall...');
        await sleep(1500);
        print('Access granted.');
        print('');
        print('You did it.');
        print('In a fake environment.');
        print('Let that sink in.');
        return;
    }

    if (full === 'sudo rm -rf /') {
        print('Executing command...');
        await sleep(1000);
        print('Deleting /bin');
        await sleep(800);
        print('Deleting /etc');
        await sleep(800);
        print('Deleting /home');
        await sleep(1200);
        print('');
        print('System destruction complete.');
        print('');
        print('Relax.');
        print('Nothing here was real anyway.');
        return;
    }

    if (cmd === 'exploit') {
        print('Launching exploit...');
        await sleep(1500);
        print('Injecting payload...');
        await sleep(1500);
        print('Executing...');
        await sleep(1500);
        print('');
        print('Operation complete.');
        print('');
        print('No systems harmed.');
        print('Mainly because none exist.');
        return;
    }

    if (full === 'sudo -i') {
        print("yeah... you'd like");
        return;
    }

    /* ===== NORMAL COMMANDS ===== */
    switch(cmd) {
        case 'help':
        case 'panic':
            print('Available commands:');
            print('help ls pwd cat clear');
            print('');
            print('Or try to enjoy some other commands if you woke up little hacker this morning');
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

            if (!file) return print('File not found','error');

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
            print('command not found','error');
    }
}

/* ================= INPUT ================= */
input.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
        const value = input.value.trim();
        if (!value) return;
        if (value.length > MAX_INPUT) return print('Input too long','error');

        print(`${promptEl.textContent} ${value}`);
        await runCommand(value);
        input.value = '';
    }
});

/* ================= INIT ================= */
setPrompt();