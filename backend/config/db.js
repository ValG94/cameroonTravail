import { Sequelize } from 'sequelize';

// Création de l'instance Sequelize
let sequelize;

if (process.env.DB_DIALECT === 'sqlite') {
  // Configuration SQLite pour Manus
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
  });
} else {
  // Configuration PostgreSQL pour production
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
    }
  );
}

// Test de connexion
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error);
  }
})();

// Export par défaut
export default sequelize;
