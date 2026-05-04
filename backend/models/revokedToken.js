import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class RevokedToken extends Model {}

  RevokedToken.init(
    {
      // Le JTI (JWT ID) du token révoqué — UUID v4 émis lors de la génération
      jti: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      // Date d'expiration du token d'origine (pour permettre le nettoyage)
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'RevokedToken',
      tableName: 'revoked_tokens',
      timestamps: false,
    }
  );

  return RevokedToken;
};
