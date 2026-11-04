import { useEffect, useState, type ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Card, Divider, Grid, Heading, Meta, Text, ThemeToggle, type Theme } from '../src';
import round1 from '../eval/results/round-1/summary.json';
import round2 from '../eval/results/round-2/summary.json';
import compareRounds from '../eval/results/compare-rounds.md?raw';
import agents1 from '../eval/guidance/round-1/AGENTS.md?raw';
import agents2 from '../eval/guidance/round-2/AGENTS.md?raw';
import { DemoScene } from './DemoScene';

/**
 * The proof page. Every number below is read from the committed eval files at build time:
 * eval/results/round-N/summary.json (which also holds the held-out T5 lines),
 * eval/results/compare-rounds.md and eval/guidance/round-N/AGENTS.md. None is typed here.
 */

const REPO_README = 'https://github.com/JennHull-builds/nil-ds/blob/main/eval/README.md';

type Cell = { n: number; mean: number; min: number; max: number; scores: number[] };
type Summary = {
  models: string[];
  arms: Record<'A' | 'B', Cell & { label: string }>;
  perTask: Record<string, Record<'A' | 'B', Cell>>;
  inventedTokens: Record<'A' | 'B', { name: string; runs: number }[]>;
  heldOut: {
    T5: {
      A: Cell;
      B: Cell;
      perRule: Record<'A' | 'B', Record<string, { pass: number; fail: number; na: number }>>;
    };
  };
};

const ROUNDS: { id: 1 | 2; data: Summary }[] = [
  { id: 1, data: round1 as unknown as Summary },
  { id: 2, data: round2 as unknown as Summary },
];
const [R1, R2] = [ROUNDS[0].data, ROUNDS[1].data];

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const word = (n: number) => NUMBER_WORDS[n] ?? String(n);
const Word = (n: number) => word(n).charAt(0).toUpperCase() + word(n).slice(1);
const score = (n: number) => n.toFixed(3);
const change = (from: number, to: number) => {
  const d = to - from;
  return `${d < 0 ? '-' : '+'}${Math.abs(d).toFixed(3)}`;
};

/** Reads one row of a generated table in compare-rounds.md, by the text at the start of the row. */
function tableRow(label: string): string[] {
  const line = compareRounds.split('\n').find((l) => l.startsWith(`| ${label}`));
  if (!line) throw new Error(`compare-rounds.md has no table row starting "${label}"`);
  return line.split('|').slice(1, -1).map((c) => c.trim());
}
const lookupRow = tableRow('Runs with a Grep whose path contains tokens.css');
// Columns: measure, A round 1, A round 2, B round 1, B round 2.
const [, grepA1, grepA2, grepB1, grepB2] = lookupRow;

const armKeys = Object.keys(R1.arms) as ('A' | 'B')[];
const taskKeys = Object.keys(R1.perTask);
const heldOutKeys = Object.keys(R1.heldOut);
const ruleCount = Object.keys(R1.heldOut.T5.perRule.A).length;
const runsPerCell = R1.perTask[taskKeys[0]].A.n;
const runsPerArm = R1.arms.A.n;
const t5RunsPerArm = R1.heldOut.T5.A.n;
const model = R1.models.join(', ');
const firstTask = taskKeys[0];
const lastTask = taskKeys[taskKeys.length - 1];

/** Lines round 2 added to AGENTS.md, found by comparing the two committed files. */
const roundOneLines = new Set(agents1.split('\n'));
const addedLines = agents2.split('\n').filter((l) => l.trim() !== '' && !roundOneLines.has(l));

// Finding 3 rests on this line. If a later round rewrites it, the build should say so.
if (!addedLines.some((l) => l.startsWith('**Destructive actions:**'))) {
  throw new Error('Round 2 AGENTS.md no longer adds a Destructive actions line; rewrite finding 3.');
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="nil-proof-section" aria-labelledby={`${id}-h`}>
      <Heading level={2} id={`${id}-h`}>
        {title}
      </Heading>
      <div className="nil-proof-body">{children}</div>
    </section>
  );
}

function ResultsTable({ caption, rows }: { caption: string; rows: { arm: string; round: number; cell: Cell }[] }) {
  return (
    <div className="nil-proof-table-wrap">
      <table className="nil-proof-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Arm</th>
            <th scope="col">Round</th>
            <th scope="col">Runs</th>
            <th scope="col">Mean</th>
            <th scope="col">Lowest</th>
            <th scope="col">Highest</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ arm, round, cell }) => (
            <tr key={`${arm}-${round}`}>
              <th scope="row">{arm}</th>
              <td>{round}</td>
              <td>{cell.n}</td>
              <td>{score(cell.mean)}</td>
              <td>{score(cell.min)}</td>
              <td>{score(cell.max)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProofPage() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const armLabel = (k: 'A' | 'B') => `Arm ${k}`;
  const mainRows = ROUNDS.flatMap(({ id, data }) =>
    armKeys.map((k) => ({ arm: armLabel(k), round: id, cell: data.arms[k] })),
  ).sort((a, b) => a.arm.localeCompare(b.arm) || a.round - b.round);
  const heldRows = ROUNDS.flatMap(({ id, data }) =>
    armKeys.map((k) => ({ arm: armLabel(k), round: id, cell: data.heldOut.T5[k] })),
  ).sort((a, b) => a.arm.localeCompare(b.arm) || a.round - b.round);

  const aMain = [R1.arms.A.mean, R2.arms.A.mean];
  const bMain = [R1.arms.B.mean, R2.arms.B.mean];
  const aT5 = [R1.heldOut.T5.A.mean, R2.heldOut.T5.A.mean];
  const bT5 = [R1.heldOut.T5.B.mean, R2.heldOut.T5.B.mean];
  const r7B = [R1.heldOut.T5.perRule.B.R7, R2.heldOut.T5.perRule.B.R7];
  const inventedB = (d: Summary) => d.inventedTokens.B.reduce((n, t) => n + t.runs, 0);

  return (
    <div data-theme={theme} className="nil-demo-canvas">
      <div className="nil-demo-nav-bar">
        <div className="nil-container">
          <nav className="nil-demo-nav" aria-label="Proof page">
            <a href="/">Showroom</a>
            <a href={REPO_README} rel="noopener noreferrer">
              Eval README
            </a>
          </nav>
        </div>
      </div>

      <DemoScene id="proof" band>
        <div className="nil-demo-intro-head">
          <div className="nil-proof-head">
            <div>
              <Heading level={1}>
                Does the agent guidance work?
              </Heading>
              <Text muted style={{ marginTop: 'var(--nil-spacing-sm)' }}>
                I designed and built nil-ds. This page shows a small eval of the files I wrote for AI
                agents. An eval is a repeatable test that scores what a model produces. This one is a
                probe, not a benchmark.
              </Text>
            </div>
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
          </div>
          <div className="nil-proof-meta">
            <Meta label="Subject model">{model}</Meta>
            <Meta label="Rounds">{ROUNDS.length}</Meta>
            <Meta label="Judge" tone="success">
              Code, not AI
            </Meta>
          </div>
        </div>
      </DemoScene>

      <DemoScene id="proof-body">
        <Section id="asks" title="What the eval asks">
          <Text>
            Do the four agent files (CLAUDE.md, AGENTS.md, DESIGN.md and registry.json) add anything
            over the docs a design system already ships for people?
          </Text>
        </Section>

        <Divider />

        <Section id="how" title="How it works">
          <ul className="nil-proof-list">
            <li>
              <strong>{Word(armKeys.length)} arms.</strong> Arm A gets the
              kit and its human docs. Arm B gets the same plus the four agent files.
            </li>
            <li>
              <strong>
                {Word(taskKeys.length)} tasks, {firstTask} to {lastTask}, plus a held-out {heldOutKeys[0]}.
              </strong>{' '}
              Each is a small screen to build with the kit, like a form field, a dialog or a menu. A
              held-out task (one kept out of choosing the change) shows whether the change carries
              over or only fits the tasks it was tuned on.
            </li>
            <li>
              <strong>{Word(ruleCount)} rules, all checked by code.</strong> No raw colours or pixel
              values, no invented token names, kit components instead of raw buttons, types that
              compile, no axe violations of semantics or ARIA in a simulated browser, and the behaviour the
              task asked for. No AI judge: every rule is code you can read and rerun.
            </li>
            <li>
              <strong>The checker was broken on purpose first.</strong> Each bad example breaks exactly one
              rule, and the test fails unless that rule, and only that rule, catches it. Switching a rule
              off has to make a test fail. No result was believed before that held.
            </li>
            <li>
              <strong>
                {Word(runsPerCell)} runs a cell, {word(runsPerArm)} per arm over {firstTask} to {lastTask}.
              </strong>{' '}
              The subject is {model}. A run's score is the share of the rules that applied to it that it passed.
            </li>
          </ul>
        </Section>

        <Divider />

        <Section id="results" title="Results">
          <Text muted>
            Each round is one set of runs. Between round 1 and round 2 only arm B's AGENTS.md changed. Arm
            A is identical in both rounds. Scores run from 0 to 1.
          </Text>
          <ResultsTable caption={`${firstTask} to ${lastTask}, ${word(runsPerArm)} runs per arm per round`} rows={mainRows} />
          <ResultsTable
            caption={`${heldOutKeys[0]}, the held-out task, ${word(t5RunsPerArm)} runs per arm per round. Never folded into the means above`}
            rows={heldRows}
          />
          <Text size="sm" muted>
            {heldOutKeys[0]} runs, in order. Arm A: round 1 {R1.heldOut.T5.A.scores.map(score).join(', ')};
            round 2 {R2.heldOut.T5.A.scores.map(score).join(', ')}. Arm B: round 1{' '}
            {R1.heldOut.T5.B.scores.map(score).join(', ')}; round 2{' '}
            {R2.heldOut.T5.B.scores.map(score).join(', ')}.
          </Text>
        </Section>

        <Divider />

        <Section id="findings" title="Three findings, in plain words">
          <Card>
            <Heading level={3}>1. The scores alone cannot separate the change from noise.</Heading>
            <Text>
              Arm A got the same files in both rounds, so how far it moves is how far an unchanged arm
              moves by chance. Its {firstTask} to {lastTask} mean went from {score(aMain[0])} to{' '}
              {score(aMain[1])} ({change(aMain[0], aMain[1])}). On {heldOutKeys[0]} it went from{' '}
              {score(aT5[0])} to {score(aT5[1])} ({change(aT5[0], aT5[1])}). Arm B, the one that changed,
              went from {score(bMain[0])} to {score(bMain[1])} ({change(bMain[0], bMain[1])}), and on{' '}
              {heldOutKeys[0]} from {score(bT5[0])} to {score(bT5[1])} ({change(bT5[0], bT5[1])}). On the
              held-out task the arm I did not touch moved further than the arm I did.
            </Text>
          </Card>
          <Card>
            <Heading level={3}>2. Claude used the token names once AGENTS.md listed them.</Heading>
            <Text>
              Round 2 told arm B to look a token up before using it, and listed the exact spacing, type
              size and border width names. Runs where arm B searched tokens.css went from {grepB1} to{' '}
              {grepB2}. Arm A, unchanged, went from {grepA1} to {grepA2}. Arm B runs that used a token
              name that does not exist went from {inventedB(R1)} to {inventedB(R2)}. Small numbers that point the same way, and three runs a cell cannot prove the cause.
            </Text>
          </Card>
          <Card>
            <Heading level={3}>3. A sentence written for a dialog was copied word for word onto a menu.</Heading>
            <Text>
              Round 2 added a line about destructive actions. It was written for the dialog task. On the
              held-out menu task, Claude applied that same line to a menu item. The checker's rule 7
              asks for kit components instead of raw buttons. Arm B failed it in{' '}
              {r7B[0].fail} of {t5RunsPerArm} runs in round 1 and {r7B[1].fail} of {t5RunsPerArm} in
              round 2. The runs that passed built Delete the way that line says. So arm B's gain on{' '}
              {heldOutKeys[0]} looks like a copied sentence. It does not show an understanding of menus. The scores
              stay as measured. That sentence is the likely cause, since it is the only added line about destructive actions and the
              code matches it, but I have not proven it.
            </Text>
          </Card>
        </Section>

        <Divider />

        <Section id="changed" title="What changed in the guidance">
          <Text>
            Round 2 changed one file, arm B's AGENTS.md, and only added to it. Nothing was removed. These
            are the {word(addedLines.length)} lines it gained, found by comparing the two committed files.
          </Text>
          <pre className="nil-proof-diff" tabIndex={0} aria-label="Lines added to AGENTS.md in round 2">
            <code>{addedLines.join('\n')}</code>
          </pre>
          <Text size="sm" muted>
            The last line is the destructive-actions sentence from finding 3. That line was true of the
            kit the eval ran on, frozen at 094d15b. Button has had a danger variant since v0.2.
          </Text>
        </Section>

        <Divider />

        <Section id="limits" title="What it doesn't cover">
          <ul className="nil-proof-list">
            <li>
              <strong>Contrast.</strong> The axe rule asserts semantics and ARIA only, in a
              simulated browser that computes no styles. Contrast is not part of this eval.
            </li>
            <li>
              <strong>Real browser behaviour.</strong> Everything ran in jsdom (a simulated browser), so
              things like focus staying inside a modal are not checked here.
            </li>
            <li>
              <strong>Sample size.</strong> {Word(runsPerCell)} runs a cell, one model, {word(taskKeys.length + heldOutKeys.length)} tasks, one kit. A
              probe, not a benchmark. I make no claim of statistical significance.
            </li>
            <li>
              <strong>Visual quality, and whether guidance helps a person.</strong> This is a model
              reading a folder, scored by rules.
            </li>
          </ul>
        </Section>

        <Divider />

        <Section id="more" title="The full write-up">
          <Grid columns={2}>
            <Card>
              <Text>
                Every rule, task and fixture, and every run's output, is in the repo.{' '}
                <a href={REPO_README} rel="noopener noreferrer">
                  Read eval/README.md on GitHub
                </a>
                .
              </Text>
            </Card>
            <Card>
              <Text>
                <a href="/">See the showroom</a>
              </Text>
            </Card>
          </Grid>
        </Section>
      </DemoScene>
      <Analytics />
    </div>
  );
}
