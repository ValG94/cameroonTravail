import models from '../../models/index.js';

const { User, Experience, Education, Skill, Language } = models;

class ProfileService {
  // Calculer le pourcentage de complétion du profil
  static calculateProfileCompletion(user, experiences, educations, skills, languages) {
    let completion = 0;
    const weights = {
      basicInfo: 30,      // Infos de base (nom, email, téléphone, ville, date de naissance, bio)
      experience: 25,     // Au moins une expérience
      education: 20,      // Au moins une formation
      skills: 15,         // Au moins 3 compétences
      languages: 10,      // Au moins 2 langues
    };

    // Infos de base (30%)
    let basicInfoScore = 0;
    if (user.full_name) basicInfoScore += 5;
    if (user.email) basicInfoScore += 5;
    if (user.phone_number) basicInfoScore += 5;
    if (user.city) basicInfoScore += 5;
    if (user.birth_date) basicInfoScore += 5;
    if (user.bio && user.bio.length > 20) basicInfoScore += 5;
    completion += basicInfoScore;

    // Expérience (25%)
    if (experiences && experiences.length > 0) {
      completion += weights.experience;
    }

    // Formation (20%)
    if (educations && educations.length > 0) {
      completion += weights.education;
    }

    // Compétences (15%)
    if (skills && skills.length >= 3) {
      completion += weights.skills;
    } else if (skills && skills.length > 0) {
      completion += (skills.length / 3) * weights.skills;
    }

    // Langues (10%)
    if (languages && languages.length >= 2) {
      completion += weights.languages;
    } else if (languages && languages.length > 0) {
      completion += (languages.length / 2) * weights.languages;
    }

    return Math.min(Math.round(completion), 100);
  }

  // Récupérer le profil complet d'un utilisateur
  static async getFullProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const experiences = await Experience.findAll({
      where: { user_id: userId },
      order: [['order', 'ASC'], ['start_date', 'DESC']],
    });

    const educations = await Education.findAll({
      where: { user_id: userId },
      order: [['order', 'ASC'], ['start_year', 'DESC']],
    });

    const skills = await Skill.findAll({
      where: { user_id: userId },
      order: [['category', 'ASC'], ['order', 'ASC']],
    });

    const languages = await Language.findAll({
      where: { user_id: userId },
      order: [['order', 'ASC']],
    });

    // Calculer et mettre à jour le pourcentage de complétion
    const profileCompletion = this.calculateProfileCompletion(
      user,
      experiences,
      educations,
      skills,
      languages
    );

    if (user.profile_completion !== profileCompletion) {
      await user.update({ profile_completion: profileCompletion });
    }

    return {
      user: user.toJSON(),
      experiences: experiences.map(e => e.toJSON()),
      educations: educations.map(e => e.toJSON()),
      skills: skills.map(s => s.toJSON()),
      languages: languages.map(l => l.toJSON()),
      profileCompletion,
    };
  }

  // Mettre à jour les informations personnelles
  static async updatePersonalInfo(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const allowedFields = [
      'full_name',
      'phone_number',
      'job_title',
      'city',
      'country',
      'birth_date',
      'bio',
      'profile_picture',
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    await user.update(updateData);
    return user;
  }

  // CRUD pour les expériences
  static async createExperience(userId, data) {
    return await Experience.create({
      user_id: userId,
      ...data,
    });
  }

  static async updateExperience(userId, experienceId, data) {
    const experience = await Experience.findOne({
      where: { id: experienceId, user_id: userId },
    });
    if (!experience) {
      throw new Error('Expérience non trouvée');
    }
    await experience.update(data);
    return experience;
  }

  static async deleteExperience(userId, experienceId) {
    const experience = await Experience.findOne({
      where: { id: experienceId, user_id: userId },
    });
    if (!experience) {
      throw new Error('Expérience non trouvée');
    }
    await experience.destroy();
    return { message: 'Expérience supprimée avec succès' };
  }

  // CRUD pour les formations
  static async createEducation(userId, data) {
    return await Education.create({
      user_id: userId,
      ...data,
    });
  }

  static async updateEducation(userId, educationId, data) {
    const education = await Education.findOne({
      where: { id: educationId, user_id: userId },
    });
    if (!education) {
      throw new Error('Formation non trouvée');
    }
    await education.update(data);
    return education;
  }

  static async deleteEducation(userId, educationId) {
    const education = await Education.findOne({
      where: { id: educationId, user_id: userId },
    });
    if (!education) {
      throw new Error('Formation non trouvée');
    }
    await education.destroy();
    return { message: 'Formation supprimée avec succès' };
  }

  // CRUD pour les compétences
  static async createSkill(userId, data) {
    return await Skill.create({
      user_id: userId,
      ...data,
    });
  }

  static async updateSkill(userId, skillId, data) {
    const skill = await Skill.findOne({
      where: { id: skillId, user_id: userId },
    });
    if (!skill) {
      throw new Error('Compétence non trouvée');
    }
    await skill.update(data);
    return skill;
  }

  static async deleteSkill(userId, skillId) {
    const skill = await Skill.findOne({
      where: { id: skillId, user_id: userId },
    });
    if (!skill) {
      throw new Error('Compétence non trouvée');
    }
    await skill.destroy();
    return { message: 'Compétence supprimée avec succès' };
  }

  // CRUD pour les langues
  static async createLanguage(userId, data) {
    return await Language.create({
      user_id: userId,
      ...data,
    });
  }

  static async updateLanguage(userId, languageId, data) {
    const language = await Language.findOne({
      where: { id: languageId, user_id: userId },
    });
    if (!language) {
      throw new Error('Langue non trouvée');
    }
    await language.update(data);
    return language;
  }

  static async deleteLanguage(userId, languageId) {
    const language = await Language.findOne({
      where: { id: languageId, user_id: userId },
    });
    if (!language) {
      throw new Error('Langue non trouvée');
    }
    await language.destroy();
    return { message: 'Langue supprimée avec succès' };
  }
}

export default ProfileService;
