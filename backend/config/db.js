import { Sequelize } from 'sequelize';

let sequelize;

if (process.env.DATABASE_URL) {
  // Supabase PostgreSQL — connexion directe via URL avec SSL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à Supabase réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error.message);
  }
})();

export default sequelize;
