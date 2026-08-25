# predictex-rewards

Ops-maintained record of **paid welcome-bonus rewards**. The PredictEX frontend reads
`payouts.json` straight from this repo (via `raw.githubusercontent.com`) to mark a user's
challenge as **Reward received** in the account modal's "Your Rewards" hub.

No backend, no deploy: edit the file, commit to `main`, and the app picks it up within ~5 minutes.

## Workflow

1. A user completes a challenge and clicks **Claim reward** → a row lands in the claims Google Sheet.
2. Verify and pay the USDC reward on Base (rewards are promised within 24 hours of claiming).
3. Add the address under the right challenge in `payouts.json` and commit.

## Format

```json
{
  "version": 1,
  "updatedAt": "2026-08-25",
  "challenges": {
    "kyc-deposit": {
      "0xabc…lowercase": { "txHash": "0x…", "paidAt": "2026-08-25" }
    },
    "volume-700": {}
  }
}
```

- Challenge ids: `kyc-deposit` ($5 — Level 1 KYC + $50 in account, new users only) and `volume-700` ($25 — $700 volume in 7 days).
- Addresses **must be lowercase** `0x…` (40 hex chars). The frontend lowercases before lookup, and the validator enforces it here.
- `txHash` (optional) is shown to the user as a "View transaction" link on Basescan. `paidAt` (optional) is `YYYY-MM-DD`.
- Keep `updatedAt` current — it's a quick way to see when the file was last touched.

## Validation

Every push runs `node scripts/validate.mjs` (GitHub Action). Run it locally before committing:

```bash
node scripts/validate.mjs
```

The frontend also fails soft — a broken file just shows every reward as pending — but the check keeps
you from silently un-greening everyone.
