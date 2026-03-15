import { maybeWriteLookupReport, parseLookupArgs, renderLookup, runLookup } from "./lookup-core.ts";

async function main(): Promise<void> {
  const options = parseLookupArgs(process.argv.slice(2));
  const result = await runLookup(options);
  const output = renderLookup(options, result);
  const reportPath = await maybeWriteLookupReport(options, output);

  console.log(output);

  if (reportPath) {
    console.log(`\nLookup report written to ${reportPath}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Signal Scout lookup failed: ${message}`);
  process.exitCode = 1;
});
