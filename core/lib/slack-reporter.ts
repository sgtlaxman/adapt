import axios from 'axios';
import { TestResult } from './results-writer';

export async function postSlackSummary(results: TestResult[], project: string, env: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const skip = results.filter((r) => r.status === 'SKIP').length;
  const total = results.length;
  const allPassed = fail === 0;

  const failedLines = results
    .filter((r) => r.status === 'FAIL')
    .map((r) => `• \`${r.testId}\` — ${r.testName}: ${r.errorMessage ?? 'Unknown error'}`)
    .join('\n');

  const payload = {
    text: allPassed
      ? `:white_check_mark: *ADAPT | ${project} | ${env}* — All ${total} tests passed`
      : `:x: *ADAPT | ${project} | ${env}* — ${fail} of ${total} tests failed`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: allPassed
            ? `:white_check_mark: *ADAPT — ${project}* (${env})\n*${pass}/${total} passed*`
            : `:x: *ADAPT — ${project}* (${env})\n*${pass} passed · ${fail} failed · ${skip} skipped*`,
        },
      },
      ...(failedLines
        ? [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Failed Tests:*\n${failedLines}` },
            },
          ]
        : []),
    ],
  };

  await axios.post(webhookUrl, payload);
}
