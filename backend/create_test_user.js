import bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/ubuntu/cameroon-travail-app/backend/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const [result] = await sequelize.query(`
      INSERT INTO users (
        firstName, lastName, fullName, email, password, 
        role, status, emailVerified, createdAt, updatedAt
      ) VALUES (
        'Test', 'User', 'Test User', 'test@cameroontravail.cm',
        '${hashedPassword}', 'candidate', 'active', 1, NOW(), NOW()
      )
    `);

    console.log('✅ Utilisateur de test créé avec succès !');
    console.log('📧 Email: test@cameroontravail.cm');
    console.log('🔑 Mot de passe: Password123!');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createTestUser();
