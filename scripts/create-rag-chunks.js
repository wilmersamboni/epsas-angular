const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '../semantic-docs.json');
const OUTPUT = path.join(__dirname, '../rag-chunks.json');

const docs = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

const chunks = [];

docs.forEach(doc => {

  const text = `
Módulo: ${doc.title}

Descripción:
${doc.description}

Ruta:
${doc.route || 'No definida'}

Funciones:
${doc.features.join(', ')}

Archivos relacionados:
${doc.files.join(', ')}
`;

  chunks.push({
    id: doc.id,
    type: doc.type,
    text: text.trim()
  });

});

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(chunks, null, 2),
  'utf8'
);

console.log('✅ rag-chunks.json generado');
console.log(`📚 Total chunks: ${chunks.length}`);