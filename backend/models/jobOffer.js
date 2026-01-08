import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JobOffer = sequelize.define(
    'JobOffer',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contract_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      required_skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      salary_range: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      published_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'job_offers',
      timestamps: false,
    }
  );

  JobOffer.associate = (models) => {
    JobOffer.belongsTo(models.User, { foreignKey: 'recruiter_id' });
  };

  return JobOffer;
};
