import Joi from 'joi';

/**
 * Middleware de validation pour l'inscription des utilisateurs
 */
export const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'cm', 'fr'] } })
      .required()
      .messages({
        'string.email': 'L\'adresse email doit être valide',
        'any.required': 'L\'adresse email est obligatoire'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
        'any.required': 'Le mot de passe est obligatoire'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'La confirmation du mot de passe ne correspond pas',
        'any.required': 'La confirmation du mot de passe est obligatoire'
      }),
    
    fullName: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .required()
      .messages({
        'string.min': 'Le nom complet doit contenir au moins 2 caractères',
        'string.max': 'Le nom complet ne peut pas dépasser 100 caractères',
        'string.pattern.base': 'Le nom complet ne peut contenir que des lettres, espaces, apostrophes et tirets',
        'any.required': 'Le nom complet est obligatoire'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^(\+237|237)?[6-9]\d{8}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Le numéro de téléphone doit être un numéro camerounais valide (ex: +237612345678)'
      }),
    
    role: Joi.string()
      .valid('candidate', 'recruiter')
      .required()
      .messages({
        'any.only': 'Le rôle doit être soit "candidate" soit "recruiter"',
        'any.required': 'Le rôle est obligatoire'
      }),
    
    location: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'La localisation doit contenir au moins 2 caractères',
        'string.max': 'La localisation ne peut pas dépasser 100 caractères'
      }),
    
    preferredLanguage: Joi.string()
      .valid('fr', 'en')
      .default('fr')
      .messages({
        'any.only': 'La langue préférée doit être "fr" ou "en"'
      }),
    
    // Champs spécifiques aux recruteurs
    companyName: Joi.when('role', {
      is: 'recruiter',
      then: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'Le nom de l\'entreprise doit contenir au moins 2 caractères',
          'string.max': 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères',
          'any.required': 'Le nom de l\'entreprise est obligatoire pour les recruteurs'
        }),
      otherwise: Joi.optional()
    }),
    
    companySize: Joi.when('role', {
      is: 'recruiter',
      then: Joi.string()
        .valid('1-10', '11-50', '51-200', '201-500', '500+')
        .optional()
        .messages({
          'any.only': 'La taille de l\'entreprise doit être une valeur valide'
        }),
      otherwise: Joi.optional()
    }),
    
    industry: Joi.when('role', {
      is: 'recruiter',
      then: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
          'string.min': 'Le secteur d\'activité doit contenir au moins 2 caractères',
          'string.max': 'Le secteur d\'activité ne peut pas dépasser 100 caractères'
        }),
      otherwise: Joi.optional()
    })
  });

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors
    });
  }

  // Nettoyer et normaliser les données
  req.validatedData = {
    ...value,
    email: value.email.toLowerCase().trim(),
    fullName: value.fullName.trim(),
    phoneNumber: value.phoneNumber ? value.phoneNumber.replace(/\s/g, '') : null,
    location: value.location ? value.location.trim() : null,
    companyName: value.companyName ? value.companyName.trim() : null,
    industry: value.industry ? value.industry.trim() : null
  };

  // Supprimer confirmPassword des données validées
  delete req.validatedData.confirmPassword;

  next();
};

/**
 * Middleware de validation pour la connexion des utilisateurs
 */
export const validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'adresse email doit être valide',
        'any.required': 'L\'adresse email est obligatoire'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Le mot de passe est obligatoire'
      })
  });

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors
    });
  }

  req.validatedData = {
    email: value.email.toLowerCase().trim(),
    password: value.password
  };

  next();
};

/**
 * Middleware de validation pour la réinitialisation de mot de passe
 */
export const validatePasswordReset = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'adresse email doit être valide',
        'any.required': 'L\'adresse email est obligatoire'
      })
  });

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors
    });
  }

  req.validatedData = {
    email: value.email.toLowerCase().trim()
  };

  next();
};

/**
 * Middleware de validation pour la confirmation de réinitialisation de mot de passe
 */
export const validatePasswordResetConfirm = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Le token de réinitialisation est obligatoire'
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
        'any.required': 'Le mot de passe est obligatoire'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'La confirmation du mot de passe ne correspond pas',
        'any.required': 'La confirmation du mot de passe est obligatoire'
      })
  });

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors
    });
  }

  req.validatedData = {
    token: value.token,
    password: value.password
  };

  next();
};

export default {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validatePasswordResetConfirm
};
