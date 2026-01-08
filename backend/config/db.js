import { Sequelize } from 'sequelize';

// Création de l'instance Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // passe à true pour voir les requêtes SQL dans la console
  }
);

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
