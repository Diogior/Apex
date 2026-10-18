// Grants (or removes) the Apex admin claim for one account.
//
// Usage:
//   1. Firebase console > Project settings > Service accounts > Generate new private key.
//      Save it OUTSIDE this repo, never commit it.
//   2. GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/set-admin-claim.mjs you@example.com
//      Add --remove to take the claim away.
//   3. Deploy the rules: npx firebase-tools deploy --only firestore:rules
//   4. Sign out of Apex and back in so the new token carries the claim.
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/set-admin-claim.mjs <email> [--remove]");
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const user = await auth.getUserByEmail(email);
const claims = { ...(user.customClaims || {}) };
if (flag === "--remove") delete claims.admin;
else claims.admin = true;
await auth.setCustomUserClaims(user.uid, claims);
console.log(`${flag === "--remove" ? "Removed" : "Granted"} admin for ${email} (uid ${user.uid}).`);
