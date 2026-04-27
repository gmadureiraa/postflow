/**
 * Converte todos os PNGs em `public/` para AVIF + WebP em paralelo.
 * Mantém o PNG original como fallback — `next/image` negocia o melhor
 * formato com base no header `Accept` do browser.
 *
 * Uso: `bun scripts/optimize-images.ts`
 *
 * Heurísticas:
 *   - AVIF quality 60 (sweet spot pra fotos / screenshots; visualmente
 *     idêntico ao PNG mas 70-90% menor).
 *   - WebP quality 82 (fallback pra browsers sem AVIF — Safari < 16).
 *   - Roda em paralelo com Promise.all em lotes de 8 (CPU-bound, sharp
 *     já paraleliza internamente, então 8 evita thrash).
 *   - Idempotente: se já existe AVIF/WebP mais novo que o PNG, pula.
 */
import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");
const AVIF_QUALITY = 60;
const WEBP_QUALITY = 82;
const BATCH_SIZE = 8;

async function listPngs(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await listPngs(path);
        out.push(...nested);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".png") {
        out.push(path);
      }
    })
  );
  return out;
}

async function fileExistsAndNewer(target: string, source: string): Promise<boolean> {
  try {
    const [t, s] = await Promise.all([stat(target), stat(source)]);
    return t.mtimeMs >= s.mtimeMs;
  } catch {
    return false;
  }
}

type Result = {
  png: string;
  avifBytes: number | null;
  webpBytes: number | null;
  pngBytes: number;
  skipped: boolean;
};

async function optimize(png: string): Promise<Result> {
  const avifPath = png.replace(/\.png$/i, ".avif");
  const webpPath = png.replace(/\.png$/i, ".webp");
  const pngStat = await stat(png);

  const [hasAvif, hasWebp] = await Promise.all([
    fileExistsAndNewer(avifPath, png),
    fileExistsAndNewer(webpPath, png),
  ]);

  if (hasAvif && hasWebp) {
    const [a, w] = await Promise.all([stat(avifPath), stat(webpPath)]);
    return {
      png,
      avifBytes: a.size,
      webpBytes: w.size,
      pngBytes: pngStat.size,
      skipped: true,
    };
  }

  try {
    const input = sharp(png, { failOn: "none" });
    const [avifInfo, webpInfo] = await Promise.all([
      input
        .clone()
        .avif({ quality: AVIF_QUALITY, effort: 4 })
        .toFile(avifPath),
      input.clone().webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(webpPath),
    ]);

    return {
      png,
      avifBytes: avifInfo.size,
      webpBytes: webpInfo.size,
      pngBytes: pngStat.size,
      skipped: false,
    };
  } catch (err) {
    console.warn(`  ! pulando ${png}: ${(err as Error).message}`);
    return {
      png,
      avifBytes: null,
      webpBytes: null,
      pngBytes: pngStat.size,
      skipped: true,
    };
  }
}

async function main() {
  const pngs = await listPngs(PUBLIC_DIR);
  console.log(`> Encontrados ${pngs.length} PNGs em public/`);

  const results: Result[] = [];
  for (let i = 0; i < pngs.length; i += BATCH_SIZE) {
    const batch = pngs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(optimize));
    results.push(...batchResults);
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, pngs.length)}/${pngs.length}\r`);
  }
  console.log();

  let totalPng = 0;
  let totalAvif = 0;
  let totalWebp = 0;
  let skipped = 0;
  for (const r of results) {
    totalPng += r.pngBytes;
    totalAvif += r.avifBytes ?? 0;
    totalWebp += r.webpBytes ?? 0;
    if (r.skipped) skipped += 1;
  }

  const fmt = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;
  const pct = (a: number, b: number) =>
    b > 0 ? `${(((b - a) / b) * 100).toFixed(1)}%` : "0%";

  console.log(`\n> Resumo:`);
  console.log(`  PNGs originais : ${fmt(totalPng)}`);
  console.log(`  AVIF total     : ${fmt(totalAvif)}  (economia ${pct(totalAvif, totalPng)})`);
  console.log(`  WebP total     : ${fmt(totalWebp)}  (economia ${pct(totalWebp, totalPng)})`);
  console.log(`  Skipped (já up-to-date): ${skipped}`);
  console.log(`\n  next/image escolhe AVIF → WebP → PNG via Accept header.`);

  // Top 10 maiores ganhos pra log
  const sorted = [...results]
    .filter((r) => r.avifBytes !== null)
    .sort((a, b) => (b.pngBytes - (b.avifBytes ?? 0)) - (a.pngBytes - (a.avifBytes ?? 0)));
  console.log(`\n  Top 10 ganhos AVIF:`);
  for (const r of sorted.slice(0, 10)) {
    const saving = r.pngBytes - (r.avifBytes ?? 0);
    console.log(
      `    ${basename(r.png).padEnd(36)}  ${fmt(r.pngBytes).padStart(8)} → ${fmt(r.avifBytes ?? 0).padStart(8)}  (-${fmt(saving)})`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
