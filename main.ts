import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';

setFlagsFromString('--no-incremental-marking');
const { run } = await import('./solve.js');
const inputDir = process.env.MAKEFUN_INPUT_DIR || '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const inputs = JSON.parse(readFileSync(join(inputDir, 'cases.json'), 'utf8'));
const results = [];
for (const sample of inputs) results.push(run(sample.input));
writeFileSync(join(outputDir, 'answers.json'), JSON.stringify(results));
