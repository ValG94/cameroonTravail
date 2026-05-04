import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';

let baseConfig;

if (process.env.DATABASE_URL) {
  // Supabase PostgreSQL via DATABASE_URL
  baseConfig = {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  };
} else if (process.env.DB_DIALECT === 'sqlite') {
  // SQLite (fallback local)
  baseConfig = {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  };
} else {
  // MySQL (fallback)
  baseConfig = {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cameroon_travail',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  };
}

const configs = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig },
};

export default configs[env];

export const development = configs.development;
export const test = configs.test;
export const production = configs.production;
