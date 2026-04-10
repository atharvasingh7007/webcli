const { execSync } = require('child_process');
const fs = require('fs');

const commands = [
  'node bin/webcli.js search "react memory leaks" --read-top 3 --limit 3',
  'node bin/webcli.js finance quote AAPL MSFT --asset-type equity',
  'node bin/webcli.js finance quote BTC ETH --asset-type crypto',
  'node bin/webcli.js hf model sentence-transformers/all-MiniLM-L6-v2',
  'node bin/webcli.js hf dataset squad',
  'node bin/webcli.js docker image nginx python',
  'node bin/webcli.js docker tags nginx --limit 5',
  'node bin/webcli.js doctor',
  'node bin/webcli.js read https://example.com'
];

let md = '# Command Outputs\n\n';

for (const cmd of commands) {
  try {
    const out = execSync(cmd).toString();
    md += `## ${cmd}\n\`\`\`json\n${out}\n\`\`\`\n\n`;
  } catch (err) {
    md += `## ${cmd} (FAILED)\n\`\`\`\n${err.stdout ? err.stdout.toString() : err.message}\n\`\`\`\n\n`;
  }
}

fs.mkdirSync('scratch', { recursive: true });
fs.writeFileSync('scratch/outputs.md', md);
console.log('Done mapping.');
