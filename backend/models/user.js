import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // 🔗 Relations
      User.hasOne(models.CvProfile, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.JobOffer, {
        foreignKey: 'recruiter_id',
        onDelete: 'CASCADE',
      });
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
      // 🔽 Champs supplémentaires optionnels (non présents dans ta BDD)
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pending_verification',
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users', // ✅ correspond exactement à ta table
      timestamps: true, // createdAt / updatedAt gérés automatiquement
      underscored: false, // ✅ car tes colonnes sont en camelCase (createdAt, updatedAt)
    }
  );

  return User;
};
