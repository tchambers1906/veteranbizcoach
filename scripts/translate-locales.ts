/**
 * Programmatic translation of [NEEDS_TRANSLATION] values
 * using Claude via the Emergent LLM proxy (OpenAI-compatible).
 *
 * Usage: ANTHROPIC_API_KEY=sk-emergent-... npx tsx scripts/translate-locales.ts
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Cannot translate.');
  process.exit(1);
}

const PROXY_URL = 'https://integrations.emergentagent.com/llm/chat/completions';
const MODEL = 'claude-sonnet-4-20250514';
const LOCALES_DIR = resolve(process.cwd(), 'locales');

const PROMPTS: Record<string, string> = {
  es: `Translate the following website copy from English to Spanish (Latin American). Context: This is for a business coaching and strategy website. The brand is professional, direct, and practical. Preserve any URLs, variable placeholders like {name}, and technical terms like PWA, Meta Traffic, OTA. Do not add punctuation that was not in the original. Return only the translated text, nothing else.

English source: `,
  id: `Translate the following website copy from English to Bahasa Indonesia. Context: This is for a business coaching and strategy website targeting Indonesian villa owners and entrepreneurs. The brand is professional, direct, and practical. Preserve any URLs, variable placeholders like {name}, and technical terms like PWA, Meta Traffic, OTA, Airbnb, Booking.com. Use formal Bahasa Indonesia appropriate for business contexts. Do not add punctuation that was not in the original. Return only the translated text, nothing else.

English source: `,
};

// ---- Helpers ----

function flattenJson(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenJson(value as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

function setNestedValue(obj: Record<string, unknown>, dotPath: string, value: string): void {
  const keys = dotPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof current[keys[i]] !== 'object' || current[keys[i]] === null) {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

async function translateText(text: string, locale: string): Promise<string> {
  const prompt = PROMPTS[locale];
  if (!prompt) throw new Error(`No prompt for locale ${locale}`);

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt + text }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  return reply || text;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---- Main ----

async function main() {
  // Load EN source
  const enPath = resolve(LOCALES_DIR, 'en', 'common.json');
  const enData = JSON.parse(await readFile(enPath, 'utf-8'));
  const enFlat = flattenJson(enData);

  for (const locale of ['es', 'id']) {
    console.log(`\n===== Processing locale: ${locale.toUpperCase()} =====`);

    const targetPath = resolve(LOCALES_DIR, locale, 'common.json');
    const targetData = JSON.parse(await readFile(targetPath, 'utf-8'));
    const targetFlat = flattenJson(targetData);

    // Find keys needing translation
    const keysToTranslate: string[] = [];
    for (const [key, value] of Object.entries(targetFlat)) {
      if (value.includes('[NEEDS_TRANSLATION]')) {
        keysToTranslate.push(key);
      }
    }

    console.log(`Found ${keysToTranslate.length} keys needing translation`);

    if (keysToTranslate.length === 0) {
      console.log('Nothing to translate, skipping.');
      continue;
    }

    let translated = 0;
    let failed = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < keysToTranslate.length; i += BATCH_SIZE) {
      const batch = keysToTranslate.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(keysToTranslate.length / BATCH_SIZE);

      console.log(`  Batch ${batchNum}/${totalBatches} (keys ${i + 1}-${Math.min(i + BATCH_SIZE, keysToTranslate.length)})`);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(async (key) => {
          const enValue = enFlat[key];
          if (!enValue) {
            console.warn(`    Warning: No EN source for key: ${key}`);
            return { key, value: null };
          }
          try {
            const translatedValue = await translateText(enValue, locale);
            return { key, value: translatedValue };
          } catch (err) {
            console.error(`    X Failed: ${key} - ${err instanceof Error ? err.message : 'Unknown error'}`);
            return { key, value: null };
          }
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.value) {
          setNestedValue(targetData, result.value.key, result.value.value);
          translated++;
        } else {
          failed++;
        }
      }

      // Delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < keysToTranslate.length) {
        await sleep(1500);
      }
    }

    // Write back
    await writeFile(targetPath, JSON.stringify(targetData, null, 2) + '\n', 'utf-8');

    console.log(`\n  Done: ${translated} keys translated`);
    if (failed > 0) console.log(`  ${failed} keys failed (still [NEEDS_TRANSLATION])`);

    // Verify
    const verifyData = JSON.parse(await readFile(targetPath, 'utf-8'));
    const verifyFlat = flattenJson(verifyData);
    const remaining = Object.values(verifyFlat).filter((v) => v.includes('[NEEDS_TRANSLATION]')).length;
    console.log(`  Remaining [NEEDS_TRANSLATION]: ${remaining}`);
  }

  console.log('\n===== Translation complete =====');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
