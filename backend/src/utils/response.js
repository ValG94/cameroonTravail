/**
 * 🔧 Utilitaires pour les réponses API standardisées
 */

// ✅ Réponse de succès
export const successResponse = (
  res,
  data = null,
  message = 'Opération réussie',
  statusCode = 200,
  meta = null
) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

// ❌ Réponse d'erreur
export const errorResponse = (
  res,
  message = 'Une erreur est survenue',
  statusCode = 400,
  errors = null,
  errorCode = null
) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) response.errors = errors;
  if (errorCode) response.errorCode = errorCode;

  if (process.env.NODE_ENV === 'development' && errors?.stack) {
    response.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};

// 🧾 Réponse de validation
export const validationErrorResponse = (
  res,
  validationErrors,
  message = 'Erreurs de validation'
) => errorResponse(res, message, 422, validationErrors, 'VALIDATION_ERROR');

// 🔐 Erreurs d'authentification
export const authErrorResponse = (res, message = 'Authentification requise') =>
  errorResponse(res, message, 401, null, 'AUTH_ERROR');

// 🚫 Erreurs d’autorisation
export const forbiddenResponse = (res, message = 'Accès interdit') =>
  errorResponse(res, message, 403, null, 'FORBIDDEN');

// 🔎 Ressource non trouvée
export const notFoundResponse = (res, message = 'Ressource non trouvée') =>
  errorResponse(res, message, 404, null, 'NOT_FOUND');

// ⚔️ Conflit (ex. doublon)
export const conflictResponse = (res, message = 'Ressource déjà existante') =>
  errorResponse(res, message, 409, null, 'CONFLICT');

// 💥 Erreur serveur
export const serverErrorResponse = (
  res,
  message = 'Erreur interne du serveur',
  error = null
) => {
  if (error) console.error('Erreur serveur:', error);
  return errorResponse(res, message, 500, null, 'SERVER_ERROR');
};

// 📄 Réponse paginée
export const paginatedResponse = (
  res,
  data,
  pagination,
  message = 'Données récupérées avec succès'
) => {
  const meta = {
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };

  return successResponse(res, data, message, 200, meta);
};

// 🆕 Création
export const createdResponse = (
  res,
  data,
  message = 'Ressource créée avec succès'
) => successResponse(res, data, message, 201);

// 🔁 Mise à jour
export const updatedResponse = (
  res,
  data,
  message = 'Ressource mise à jour avec succès'
) => successResponse(res, data, message, 200);

// 🗑️ Suppression
export const deletedResponse = (
  res,
  message = 'Ressource supprimée avec succès'
) => successResponse(res, null, message, 200);

// 🚫 Aucun contenu
export const noContentResponse = (res) => res.status(204).send();

// 🧩 Middleware global de gestion d’erreurs
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Erreur globale:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return validationErrorResponse(res, errors, 'Erreurs de validation des données');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'champ';
    return conflictResponse(res, `Cette valeur pour ${field} existe déjà`);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(
      res,
      'Référence invalide vers une ressource',
      400,
      null,
      'FOREIGN_KEY_ERROR'
    );
  }

  if (err.name === 'SequelizeConnectionError') {
    return serverErrorResponse(res, 'Erreur de connexion à la base de données');
  }

  if (err.name === 'JsonWebTokenError') {
    return authErrorResponse(res, 'Token invalide');
  }

  if (err.name === 'TokenExpiredError') {
    return authErrorResponse(res, 'Token expiré');
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Format JSON invalide', 400, null, 'INVALID_JSON');
  }

  return serverErrorResponse(res, 'Une erreur inattendue est survenue', err);
};

// 🚧 Middleware 404 (route non trouvée)
export const notFoundHandler = (req, res) =>
  notFoundResponse(res, `Route ${req.method} ${req.path} non trouvée`);
