/**
 * @type {import('sequelize-cli').Migration}
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('job_offers', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    recruiter_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    location: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    contract_type: {
      type: Sequelize.STRING
    },
    required_skills: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    salary_range: {
      type: Sequelize.STRING
    },
    published_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('job_offers');
}
