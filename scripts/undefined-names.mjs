// Reads `tsc --checkJs` output on stdin and fails only on names that don't exist
// (a ReferenceError at runtime). Type complaints in this untyped JS are ignored.
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const bad = input.split("\n").filter((l) => /Cannot find name|has no exported member/.test(l));
  if (bad.length) {
    console.error(bad.join("\n"));
    console.error(`\n${bad.length} unresolved name(s). These crash at runtime.`);
    process.exit(1);
  }
  console.log("No unresolved names.");
});
