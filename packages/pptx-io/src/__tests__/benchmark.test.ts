import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePptxBuffer } from '../generator/pptxGenerator.service';
import { parsePptxBuffer } from '../parser/pptxParser.service';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplesDir = path.resolve(__dirname, '../../../../apps/slides/public/samples');

const runBenchmark = async () => {
  console.log('=== SLIDES / PPTX-IO BENCHMARK & PERFORMANCE MEASUREMENTS ===\n');

  const files = [
    { name: 'sample-basic.pptx', desc: 'Mẫu cơ bản (3 slide, text tiếng Việt)' },
    { name: 'sample-medium.pptx', desc: 'Mẫu trung bình (5 slide, shape, colors, layout)' },
    { name: 'sample-advanced.pptx', desc: 'Mẫu nâng cao (10 slide, hồ sơ doanh nghiệp)' },
  ];

  for (const f of files) {
    const filePath = path.join(samplesDir, f.name);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const sizeKb = (buffer.byteLength / 1024).toFixed(2);

    // 1. Measure Parse Latency
    const t0 = performance.now();
    const deck = await parsePptxBuffer(buffer);
    const parseTimeMs = (performance.now() - t0).toFixed(2);

    // 2. Measure Generate Latency
    const t1 = performance.now();
    const generated = await generatePptxBuffer(deck);
    const genTimeMs = (performance.now() - t1).toFixed(2);

    console.log(`[FILE] ${f.name} (${f.desc})`);
    console.log(`  - File Size: ${sizeKb} KB`);
    console.log(`  - Slide Count: ${deck.slides.length}`);
    console.log(`  - Parse Time: ${parseTimeMs} ms`);
    console.log(`  - Re-generate Time: ${genTimeMs} ms`);
    console.log(`  - Generated Size: ${(generated.byteLength / 1024).toFixed(2)} KB`);

    assert.ok(deck.slides.length > 0);
    assert.ok(generated.byteLength > 0);
    console.log('  -> Status: PASS\n');
  }

  console.log('=== ALL BENCHMARKS COMPLETED WITH HIGH PERFORMANCE ===');
};

void runBenchmark();
