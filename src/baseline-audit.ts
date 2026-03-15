import { renderBaselineAuditReport, runBaselineAudit } from "./audit/baseline-audit.ts";
import { writeTextFile } from "./lib/file-system.ts";
import { formatReportDate, parseRunDate } from "./lib/time.ts";

function parseArgs(argv: string[]): { date?: string } {
  const options: { date?: string } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--date" && next) {
      options.date = next;
      index += 1;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const runDate = parseRunDate(options.date);
  const reportDate = formatReportDate(runDate);
  const reportPath = `Research/baseline-audit-${reportDate}.md`;
  const result = await runBaselineAudit();
  const markdown = renderBaselineAuditReport(result);

  await writeTextFile(reportPath, markdown);

  console.log(`Signal Scout baseline audit written to ${reportPath}`);
  console.log(`Adopt-now checks: ${result.summary.adoptNowChecks}`);
  console.log(`OK: ${result.summary.ok}, partial: ${result.summary.partial}, missing: ${result.summary.missing}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Signal Scout baseline audit failed: ${message}`);
  process.exitCode = 1;
});
