import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const CvProfile = sequelize.define(
    'CvProfile',
    {
      job_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      years_of_experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      education_level: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      preferred_locations: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      cv_file_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'cv_profiles',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: false,
    }
  );

  CvProfile.associate = (models) => {
    CvProfile.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return CvProfile;
};
