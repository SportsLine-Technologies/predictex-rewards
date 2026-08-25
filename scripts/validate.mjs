// Validates payouts.json so a typo can never blank the rewards hub for everyone.
import { readFileSync } from 'node:fs';

const CHALLENGES = ['kyc-deposit', 'volume-700'];
const errors = [];

let data;
try {
  data = JSON.parse(readFileSync(new URL('../payouts.json', import.meta.url), 'utf8'));
} catch (e) {
  console.error(`payouts.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (typeof data.version !== 'number') errors.push('`version` must be a number');
if (!data.challenges || typeof data.challenges !== 'object') errors.push('`challenges` must be an object');

for (const [id, entries] of Object.entries(data.challenges ?? {})) {
  if (!CHALLENGES.includes(id)) errors.push(`unknown challenge "${id}" (expected ${CHALLENGES.join(' | ')})`);
  if (!entries || typeof entries !== 'object') {
    errors.push(`challenge "${id}" must be an object keyed by address`);
    continue;
  }
  const seen = new Set();
  for (const [address, record] of Object.entries(entries)) {
    // Any casing is fine (the app lowercases before lookup); only the shape is enforced.
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) errors.push(`"${address}" in "${id}" is not a 0x address (40 hex chars)`);
    const lower = address.toLowerCase();
    if (seen.has(lower)) errors.push(`"${address}" appears twice in "${id}" (same address, different casing)`);
    seen.add(lower);
    if (record && typeof record === 'object') {
      if (record.txHash !== undefined && !/^(0x[0-9a-fA-F]{64}|https:\/\/\S+)$/.test(record.txHash))
        errors.push(`"${address}" in "${id}": txHash must be a 0x… transaction hash or a full https:// explorer link`);
      if (record.paidAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(record.paidAt))
        errors.push(`"${address}" in "${id}": paidAt must be YYYY-MM-DD`);
    } else {
      errors.push(`"${address}" in "${id}" must be an object like { "txHash": "0x…", "paidAt": "YYYY-MM-DD" }`);
    }
  }
}

if (errors.length) {
  console.error('payouts.json has problems:\n - ' + errors.join('\n - '));
  process.exit(1);
}
const count = Object.values(data.challenges).reduce((n, e) => n + Object.keys(e).length, 0);
console.log(`payouts.json OK — ${count} payout(s) recorded`);
