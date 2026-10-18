// Reads `tsc --checkJs` output on stdin. Fails on:
//   - syntax errors (TS1xxx): TypeScript skips name checking when these exist, and some
//     of them (like a stray "/>" in JSX text) build fine but render as visible junk
//   - missing files (TS6053), e.g. a glob the shell didn't expand
//   - names that don't exist (a ReferenceError at runtime)
// Type complaints in this untyped JS are ignored.
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const lines = input.split("\n");
  const bad = lines.filter((l) => /error TS1\d{3}:|error TS6053:|Cannot find name|has no exported member/.test(l));
  if (bad.length) {
    console.error(bad.join("\n"));
    console.error(`\n${bad.length} problem(s): syntax errors or unresolved names. These break the app at runtime.`);
    process.exit(1);
  }
  if (!/error TS|^\s*$/.test(input) && input.trim()) console.log(input.trim().split("\n").slice(0, 3).join("\n"));
  console.log("No syntax errors or unresolved names.");
});
