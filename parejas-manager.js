import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'parejas.json');

// Cargar parejas desde el archivo JSON
function loadParejas() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}');
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error cargando parejas.json:', e);
    return {};
  }
}

// Guardar parejas en el archivo JSON
function saveParejas(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error guardando parejas.json:', e);
  }
}

// Añadir pareja
function setPareja(user1, user2) {
  const parejas = loadParejas();
  const ahora = new Date().toISOString();

  parejas[user1] = { pareja: user2, fecha: ahora };
  parejas[user2] = { pareja: user1, fecha: ahora };

  saveParejas(parejas);
}

// Obtener pareja y fecha
function getPareja(user) {
  const parejas = loadParejas();
  return parejas[user] || null;
}

export { setPareja, getPareja };
