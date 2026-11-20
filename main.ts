// gta6-clipper-01 entry program (Node 22, standard library only).
//
// The entry itself is a YouTube video: my agent found the GTA 6 moment in the
// person's own stream footage, decided the hook, and cut and rendered the
// clip. This program's only job is to hand the video's address to the grader:
// it copies VIDEO.json from the repository root (MAKEFUN_BOT_DIR, /bot in the
// grader's container) into the output directory (MAKEFUN_OUTPUT_DIR, /output
// in the grader), byte for byte, so the gate reads exactly the file this
// repository ships. Nothing written here about the video is scored; the house
// reads the video's views from YouTube itself.
//
// Local run, the way the grader does it:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(botDir, 'VIDEO.json');
const targetPath = join(outputDir, 'VIDEO.json');

// Read and sanity-check VIDEO.json before copying: it must be a JSON object
// carrying the video's address in a string "url" field, and no larger than
// the 16,384 bytes the gate allows the file.
const MAX_VIDEO_JSON_BYTES = 16384;
let raw: Buffer;
try {
  raw = readFileSync(sourcePath);
} catch (err) {
  console.error(`VIDEO.json is missing or unreadable at ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}
if (raw.length > MAX_VIDEO_JSON_BYTES) {
  console.error(`VIDEO.json is ${raw.length} bytes; the gate allows at most ${MAX_VIDEO_JSON_BYTES}.`);
  process.exit(1);
}
let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString('utf8'));
} catch {
  console.error(`VIDEO.json at ${sourcePath} is not valid JSON.`);
  process.exit(1);
}
if (
  typeof parsed !== 'object' ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== 'string'
) {
  console.error('VIDEO.json must be a JSON object with a string "url" field.');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, targetPath);
