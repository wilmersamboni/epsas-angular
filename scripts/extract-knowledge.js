const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/app');
const OUTPUT_FILE = path.join(__dirname, '../knowledge-base.json');

const knowledge = [];

function walk(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      if (
        file.endsWith('.ts') ||
        file.endsWith('.html')
      ) {
        processFile(fullPath);
      }
    }
  }
}

function cleanText(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{\{.*?\}\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractUsefulText(content) {

  const regex =
    /["'`](.*?)["'`]/g;

  const results = [];

  let match;

  while ((match = regex.exec(content)) !== null) {

    const text = match[1]
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .trim();

    const invalid =
      text.length < 4 ||
      text.includes('import ') ||
      text.includes('.component') ||
      text.includes('.service') ||
      text.includes('@angular') ||
      text.includes('rxjs') ||
      text.includes('node_modules') ||
      text.includes('constructor') ||
      text.includes('Observable') ||
      text.includes('signal(') ||
      text.includes('inject(') ||
      text.includes('http') ||
      text.includes('./') ||
      text.includes('../');

    if (!invalid) {
      results.push(text);
    }
  }

  return results;
}

function processFile(filePath) {

  try {

    const raw = fs.readFileSync(filePath, 'utf8');

    const cleaned = cleanText(raw);

    const texts = extractUsefulText(cleaned);

    if (texts.length > 0) {

      knowledge.push({
        file: path.relative(SRC_DIR, filePath),
        content: texts.join(' ')
      });

    }

  } catch (error) {

    console.error(error.message);

  }

}

walk(SRC_DIR);

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(knowledge, null, 2),
  'utf8'
);

console.log('✅ knowledge-base.json generado');
console.log(`📚 Total documentos: ${knowledge.length}`);