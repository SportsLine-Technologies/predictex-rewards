# predictex-rewards

Ops-maintained record of **paid welcome-bonus rewards**. The PredictEX frontend reads
`payouts.json` straight from this repo (via `raw.githubusercontent.com`) to mark a user's
challenge as **Reward received** in the account modal's "Your Rewards" hub.

No backend, no deploy: edit the file, commit to `main`, and the app picks it up within ~5 minutes.

## Operator guide

Step-by-step daily routine with screenshots: [docs/PredictEX-Rewards-Operator-Guide.pdf](docs/PredictEX-Rewards-Operator-Guide.pdf).

## Workflow

1. A user completes a challenge and clicks **Claim reward** → a row lands in the claims Google Sheet.
2. Verify and pay the USDC reward on Base (rewards are promised within 24 hours of claiming).
3. Add the address under the right challenge in `payouts.json` and commit.

## Format

```json
{
  "version": 1,
  "updatedAt": "2026-08-27",
  "challenges": {
    "kyc-deposit": {
      "0xca7d70aF5076FA55705F3285e3414620f157948C": { "txHash": "0xaaaa…", "paidAt": "2026-08-26" },
      "0x2222222222222222222222222222222222222222": { "txHash": "0xbbbb…", "paidAt": "2026-08-27" }
    },
    "volume-700": {
      "0x1111111111111111111111111111111111111111": { "txHash": "0xcccc…", "paidAt": "2026-08-27" }
    }
  }
}
```

- Challenge ids: `kyc-deposit` ($5 — Level 1 KYC + $50 in account, new users only) and `volume-700` ($25 — $700 volume in 7 days).
- Addresses are `0x…` (40 hex chars) in **any casing** — paste them as copied (checksummed is fine). The app lowercases before lookup; the validator only rejects malformed ones or the same address listed twice under one challenge.
- `txHash` (optional) is shown to the user as a "View transaction" link — either the bare `0x…` hash or the full Basescan URL, both work. `paidAt` (optional) is `YYYY-MM-DD`.
- Entries are separated by commas; the last entry in a block has none. The same address can appear under both challenges.
- Keep `updatedAt` current — it's a quick way to see when the file was last touched.

## Validation

Every push runs `node scripts/validate.mjs` (GitHub Action). Run it locally before committing:

```bash
node scripts/validate.mjs
```

The frontend also fails soft — a broken file just shows every reward as pending — but the check keeps
you from silently un-greening everyone.
