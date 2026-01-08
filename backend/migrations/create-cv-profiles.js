/**
 * @type {import('sequelize-cli').Migration}
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('cv_profiles', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    job_title: {
      type: Sequelize.STRING
    },
    years_of_experience: {
      type: Sequelize.INTEGER
    },
    education_level: {
      type: Sequelize.STRING
    },
    skills: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    preferred_locations: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    languages: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    cv_file_url: {
      type: Sequelize.TEXT
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('cv_profiles');
}
