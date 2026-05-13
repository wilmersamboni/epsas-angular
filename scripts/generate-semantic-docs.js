const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../src/app');
const OUTPUT = path.join(__dirname, '../semantic-docs.json');

const modules = [];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }

  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function cleanName(name) {
  return name
    .replace('.component.ts', '')
    .replace('.service.ts', '')
    .replace('.ts', '')
    .replace('.html', '')
    .replace(/-/g, ' ');
}

function generateDescription(moduleName) {

  const descriptions = {
    admin: 'Módulo administrativo del sistema EPSAS.',
    auth: 'Módulo de autenticación e inicio de sesión.',
    seguimiento: 'Gestión de aprendices, prácticas, observaciones y seguimiento.',
    formatos: 'Gestión y visualización de formatos.',
    historial: 'Consulta de historial y registros.',
    home: 'Página principal del sistema.',
    migracion: 'Herramientas de migración de datos.',
    settings: 'Configuración general del sistema.',
    chat: 'Asistente virtual y mensajería.',
    navbar: 'Barra superior de navegación.',
    sidebar: 'Menú lateral de navegación.',
    footer: 'Pie de página institucional.'
  };

  return descriptions[moduleName.toLowerCase()]
    || `Módulo ${moduleName} del sistema EPSAS.`;
}

function detectFeatures(files) {

  const features = [];

  files.forEach(file => {

    const lower = file.toLowerCase();

    if (lower.includes('login')) {
      features.push('Inicio de sesión');
    }

    if (lower.includes('admin')) {
      features.push('Administración');
    }

    if (lower.includes('modal')) {
      features.push('Ventanas modales');
    }

    if (lower.includes('table')) {
      features.push('Tablas de información');
    }

    if (lower.includes('seguimiento')) {
      features.push('Seguimiento de aprendices');
    }

    if (lower.includes('observacion')) {
      features.push('Observaciones');
    }

    if (lower.includes('practica')) {
      features.push('Prácticas');
    }

    if (lower.includes('historial')) {
      features.push('Historial');
    }

    if (lower.includes('chat')) {
      features.push('Chat asistente');
    }

    if (lower.includes('config')) {
      features.push('Configuraciones');
    }

    if (lower.includes('service')) {
      features.push('Servicios internos');
    }

  });

  return [...new Set(features)];
}

const featureDirs = path.join(APP_DIR, 'features');

if (fs.existsSync(featureDirs)) {

  const featureFolders = fs.readdirSync(featureDirs);

  featureFolders.forEach(folder => {

    const folderPath = path.join(featureDirs, folder);

    if (fs.statSync(folderPath).isDirectory()) {

      const files = [];

      walk(folderPath, (file) => {
        files.push(path.relative(folderPath, file));
      });

      modules.push({
        id: folder.toLowerCase(),
        title: capitalize(cleanName(folder)),
        type: 'module',
        route: `/${folder.toLowerCase()}`,
        description: generateDescription(folder),
        features: detectFeatures(files),
        files: files
      });

    }

  });

}

const layoutDir = path.join(APP_DIR, 'layout');

if (fs.existsSync(layoutDir)) {

  const layoutFolders = fs.readdirSync(layoutDir);

  layoutFolders.forEach(folder => {

    const folderPath = path.join(layoutDir, folder);

    if (fs.statSync(folderPath).isDirectory()) {

      const files = [];

      walk(folderPath, (file) => {
        files.push(path.relative(folderPath, file));
      });

      modules.push({
        id: folder.toLowerCase(),
        title: capitalize(cleanName(folder)),
        type: 'layout',
        description: generateDescription(folder),
        features: detectFeatures(files),
        files: files
      });

    }

  });

}

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(modules, null, 2),
  'utf8'
);

console.log('✅ semantic-docs.json generado');
console.log(`📚 Total módulos: ${modules.length}`);