import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Configuration du chemin et chargement des variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// ✅ Détermination de l'environnement (mais toujours base unique)
const env = process.env.NODE_ENV || 'development';

// ✅ Base de configuration commune
let baseConfig;

if (process.env.DB_DIALECT === 'sqlite') {
  // Configuration SQLite pour Manus
  baseConfig = {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  };
} else {
  // Configuration PostgreSQL pour production
  baseConfig = {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cameroontravail_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  };
}

// ✅ Une seule configuration, appliquée partout
const configs = {
  development: { ...baseConfig },
  test: { ...baseConfig },        // 🔁 même base que le dev
  production: { ...baseConfig },  // 🔁 même base pour éviter l’erreur
};

// ✅ Export ESM (pour import config from '../config/config.js')
export default configs[env];

// ✅ Export nommé (pour Sequelize CLI compat)
export const development = configs.development;
export const test = configs.test;
export const production = configs.production;
