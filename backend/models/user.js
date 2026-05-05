import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      if (models.Experience) {
        User.hasMany(models.Experience, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      }
      if (models.Education) {
        User.hasMany(models.Education, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      }
      if (models.Skill) {
        User.hasMany(models.Skill, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      }
      if (models.Language) {
        User.hasMany(models.Language, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      }
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('candidate', 'recruiter', 'admin'),
        allowNull: false,
        defaultValue: 'candidate',
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'active',
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      email_verification_token: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      profile_picture: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      job_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // Localisation générique (ex: "Douala, Cameroun")
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: 'Cameroun',
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      preferred_language: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 'fr',
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Africa/Douala',
      },
      profile_completion_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
      // URL publique Supabase Storage de la photo de profil
      // (remplace l'ancien chemin local /uploads/photos/...)
      cv_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: false,
    }
  );

  return User;
};
