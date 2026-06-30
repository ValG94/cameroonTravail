/**
 * Service d'envoi d'emails pour Cameroon Travail
 * Utilise Resend pour l'envoi d'emails
 */

import { Resend } from "resend";
import { ENV } from "./env";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Initialiser Resend avec la clé API depuis les variables d'environnement
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY n'est pas définie dans les variables d'environnement");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

/**
 * Envoie un email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const resendClient = getResend();
    
    const { data, error } = await resendClient.emails.send({
      from: ENV.emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("[email] Erreur lors de l'envoi:", error);
      return false;
    }

    console.log(`[email] Email envoyé avec succès à ${options.to}, ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[email] Exception lors de l'envoi:", error);
    return false;
  }
}

/**
 * Template pour notification de nouvelle candidature (envoyé à l'employeur)
 */
export function templateNouvelleCandidature(data: {
  employeurNom: string;
  candidatNom: string;
  offreTitre: string;
  offreId: number;
  candidatureId: number;
  appUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouvelle candidature reçue</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.employeurNom},</p>
      
      <p>Vous avez reçu une nouvelle candidature pour votre offre d'emploi :</p>
      
      <p><strong>${data.offreTitre}</strong></p>
      
      <p>Candidat : <strong>${data.candidatNom}</strong></p>
      
      <p>Connectez-vous à votre espace employeur pour consulter les détails de cette candidature, télécharger le CV et prendre une décision.</p>
      
      <a href="${data.appUrl}/employeur/candidatures" class="button">
        Voir la candidature
      </a>
    </div>
    <div class="footer">
      <p>Cameroon Travail - Plateforme de recrutement au Cameroun</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template pour notification de changement de statut (envoyé au candidat)
 */
export function templatePasswordReset(data: {
  userName: string;
  resetLink: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${data.userName}</strong>,</p>
          
          <p>Vous avez demandé à réinitialiser votre mot de passe sur <strong>Cameroon Travail</strong>.</p>
          
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          
          <div style="text-align: center;">
            <a href="${data.resetLink}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important :</strong>
            <ul>
              <li>Ce lien est valable pendant <strong>24 heures</strong></li>
              <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
              <li>Ne partagez jamais ce lien avec qui que ce soit</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${data.resetLink}">${data.resetLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par Cameroon Travail</p>
          <p>Plateforme de référence pour l'emploi au Cameroun</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function templateChangementStatut(data: {
  candidatNom: string;
  offreTitre: string;
  entreprise: string;
  nouveauStatut: string;
  commentaire?: string;
  offreId: number;
  appUrl: string;
}): string {
  const statutLabels: Record<string, { titre: string; couleur: string; message: string }> = {
    en_attente: {
      titre: "En attente de traitement",
      couleur: "#6b7280",
      message: "Votre candidature est en cours d'examen par l'employeur.",
    },
    vue: {
      titre: "Candidature consultée",
      couleur: "#3b82f6",
      message: "Bonne nouvelle ! L'employeur a consulté votre candidature.",
    },
    retenue: {
      titre: "Candidature retenue",
      couleur: "#16a34a",
      message: "Félicitations ! Votre candidature a été retenue. L'employeur devrait vous contacter prochainement.",
    },
    entretien: {
      titre: "Convocation à un entretien",
      couleur: "#16a34a",
      message: "Excellente nouvelle ! Vous êtes convoqué(e) à un entretien.",
    },
    rejetee: {
      titre: "Candidature non retenue",
      couleur: "#dc2626",
      message: "Malheureusement, votre candidature n'a pas été retenue pour ce poste.",
    },
  };

  const statut = statutLabels[data.nouveauStatut] || statutLabels.en_attente;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${statut.couleur}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-badge { display: inline-block; background-color: ${statut.couleur}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
    .comment-box { background-color: white; border-left: 4px solid ${statut.couleur}; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mise à jour de votre candidature</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.candidatNom},</p>
      
      <p>Le statut de votre candidature pour le poste de :</p>
      
      <p><strong>${data.offreTitre}</strong><br>
      chez <strong>${data.entreprise}</strong></p>
      
      <p>a été mis à jour :</p>
      
      <div class="status-badge">${statut.titre}</div>
      
      <p>${statut.message}</p>
      
      ${
        data.commentaire
          ? `
      <div class="comment-box">
        <strong>Message de l'employeur :</strong><br>
        ${data.commentaire}
      </div>
      `
          : ""
      }
      
      <a href="${data.appUrl}/candidat/candidatures" class="button">
        Voir mes candidatures
      </a>
    </div>
    <div class="footer">
      <p>Cameroon Travail - Plateforme de recrutement au Cameroun</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function templateNouvelleOffre(data: {
  candidatNom: string;
  alerteNom: string;
  offreTitre: string;
  entreprise: string;
  secteur: string;
  ville: string;
  region: string;
  typeContrat: string;
  typeOffre: string;
  salaire?: string;
  offreId: number;
  appUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .offre-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-right: 6px; }
    .badge-public { background: #dcfce7; color: #16a34a; }
    .badge-prive { background: #fee2e2; color: #dc2626; }
    .meta { color: #6b7280; font-size: 14px; margin: 4px 0; }
    .salaire { color: #16a34a; font-weight: bold; font-size: 16px; margin: 10px 0; }
    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .alerte-info { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; font-size: 14px; color: #166534; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Nouvelle offre correspondant à votre alerte</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.candidatNom},</p>
      
      <div class="alerte-info">
        Alerte : <strong>${data.alerteNom}</strong>
      </div>
      
      <p>Une nouvelle offre d'emploi correspond à vos critères de recherche :</p>
      
      <div class="offre-card">
        <h2 style="margin:0 0 8px 0; font-size:18px;">${data.offreTitre}</h2>
        <p style="margin:0 0 12px 0; color:#374151; font-weight:500;">${data.entreprise}</p>
        
        <span class="badge ${data.typeOffre === 'public' ? 'badge-public' : 'badge-prive'}">
          ${data.typeOffre === 'public' ? 'Emploi Public' : 'Emploi Privé'}
        </span>
        
        <p class="meta">📍 ${data.ville}, ${data.region}</p>
        <p class="meta">💼 ${data.typeContrat} — ${data.secteur}</p>
        ${data.salaire ? `<p class="salaire">💰 ${data.salaire} FCFA / mois</p>` : ""}
        
        <a href="${data.appUrl}/offre/${data.offreId}" class="button">
          Voir l'offre et postuler
        </a>
      </div>
      
      <p style="font-size:13px; color:#6b7280;">
        Vous recevez cet email car vous avez créé une alerte emploi sur Cameroon Travail.<br>
        <a href="${data.appUrl}/candidat/alertes" style="color:#16a34a;">Gérer mes alertes</a>
      </p>
    </div>
    <div class="footer">
      <p>Cameroon Travail - Plateforme de recrutement au Cameroun</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ─── Templates souscription (Mobile Money, Option B) ──────────────────────────

const baseStyle = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
  .container { max-width: 600px; margin: 24px auto; background: white; border-radius: 12px; overflow: hidden; }
  .content { padding: 32px 28px; }
  .info-box { background: #f9fafb; border-left: 4px solid #16a34a; padding: 16px; border-radius: 6px; margin: 18px 0; }
  .info-box.warning { border-left-color: #dc2626; background: #fef2f2; }
  .info-box ul { margin: 6px 0; padding-left: 18px; }
  .info-box li { margin: 4px 0; }
  .button { display: inline-block; background: #16a34a; color: white !important; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
  .footer { text-align: center; padding: 18px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
  .meta { color: #6b7280; font-size: 14px; }
`;

/**
 * Email envoyé au recruteur quand sa demande de souscription est
 * validée par l'admin (la formule devient active immédiatement).
 */
export function templateSouscriptionValidee(data: {
  recruteurNom: string;
  nomEntreprise: string;
  nomFormule: string;
  montant: string;
  devise: string;
  appUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${baseStyle}
    .header { background: linear-gradient(135deg, #063F24 0%, #009B5A 100%); color: white; padding: 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Votre formule est active</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${data.recruteurNom}</strong>,</p>

      <p>Bonne nouvelle ! Votre paiement a été vérifié et votre formule <strong>${data.nomFormule}</strong> est désormais active sur votre compte recruteur <strong>${data.nomEntreprise}</strong>.</p>

      <div class="info-box">
        <strong>Détails de votre souscription</strong>
        <ul>
          <li>Formule : <strong>${data.nomFormule}</strong></li>
          <li>Montant payé : <strong>${data.montant} ${data.devise}</strong></li>
        </ul>
      </div>

      <p>Vous pouvez dès maintenant publier vos offres et accéder à la CVthèque.</p>

      <div style="text-align: center;">
        <a href="${data.appUrl}/employeur/dashboard" class="button">Accéder à mon tableau de bord</a>
      </div>

      <p class="meta">Vous pourrez retrouver l'historique de vos souscriptions dans la section "Mes souscriptions" de votre back-office.</p>
    </div>
    <div class="footer">
      <p><strong>Cameroon Travail</strong> — La plateforme de recrutement au Cameroun</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Email envoyé au recruteur quand sa demande de souscription est
 * refusée par l'admin (paiement non vérifié, montant incorrect, etc.).
 */
export function templateSouscriptionRefusee(data: {
  recruteurNom: string;
  nomFormule: string;
  raison: string;
  appUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${baseStyle}
    .header { background: #dc2626; color: white; padding: 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Demande de souscription refusée</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${data.recruteurNom}</strong>,</p>

      <p>Nous n'avons pas pu valider votre demande de souscription à la formule <strong>${data.nomFormule}</strong>.</p>

      <div class="info-box warning">
        <strong>Raison du refus :</strong>
        <p style="margin: 6px 0 0">${data.raison}</p>
      </div>

      <p>Vous pouvez :</p>
      <ul>
        <li>Vérifier votre référence de transaction et soumettre une nouvelle demande</li>
        <li>Nous contacter à <a href="mailto:contact@cameroon-travail.cm">contact@cameroon-travail.cm</a> pour clarifier la situation</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.appUrl}/employeur/mes-souscriptions" class="button">Voir mes souscriptions</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>Cameroon Travail</strong> — La plateforme de recrutement au Cameroun</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `;
}
