import fs from 'fs';
import path from 'path';
import process from 'process';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'url';
import config from '../config/config.js'; // ✅ On importe directement le JS, pas de JSON ni de fs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};

let sequelize;

// ✅ Initialisation Sequelize propre selon la config importée
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// ✅ Chargement dynamique des modèles
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.endsWith('.test.js')
  );

for (const file of modelFiles) {
  // ✅ Conversion du chemin Windows en URL compatible ESM
  const modelPath = pathToFileURL(path.join(__dirname, file)).href;
  const { default: modelDefiner } = await import(modelPath);
  const model = modelDefiner(sequelize, DataTypes);
  db[model.name] = model;
}

// ✅ Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
