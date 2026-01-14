import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Education extends Model {
    static associate(models) {
      if (models.User) {
        Education.belongsTo(models.User, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
        });
      }
    }
  }

  Education.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      degree: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      institution: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      start_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      end_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Education',
      tableName: 'educations',
      timestamps: true,
      underscored: false,
    }
  );

  return Education;
};
