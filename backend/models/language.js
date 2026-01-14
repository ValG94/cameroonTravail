import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Language extends Model {
    static associate(models) {
      if (models.User) {
        Language.belongsTo(models.User, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
        });
      }
    }
  }

  Language.init(
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      proficiency: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'intermediate',
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Language',
      tableName: 'languages',
      timestamps: true,
      underscored: false,
    }
  );

  return Language;
};
