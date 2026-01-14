import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Relations avec les autres modèles
      if (models.Experience) {
        User.hasMany(models.Experience, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
        });
      }
      if (models.Education) {
        User.hasMany(models.Education, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
        });
      }
      if (models.Skill) {
        User.hasMany(models.Skill, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
        });
      }
      if (models.Language) {
        User.hasMany(models.Language, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
        });
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('candidate', 'recruiter', 'admin'),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending_verification',
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
      profile_completion: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
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
