import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.jobs': 'Emplois',
    'nav.profile': 'Profil',
    'nav.cv': 'Mon CV',
    'nav.alerts': 'Alertes',
    'nav.blog': 'Conseils',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.logout': 'Déconnexion',
    
    // Home page
    'home.title': 'Trouvez votre emploi au Cameroun',
    'home.subtitle': 'Plus de 10 000 offres d\'emploi dans tous les secteurs',
    'home.search.placeholder': 'Métier, compétence, entreprise...',
    'home.location.placeholder': 'Ville, région...',
    'home.search.button': 'Rechercher',
    'home.stats.jobs': 'Offres d\'emploi',
    'home.stats.companies': 'Entreprises',
    'home.stats.candidates': 'Candidats',
    'home.latest.jobs': 'Dernières offres',
    'home.advice.title': 'Conseils emploi',
    'home.cta.title': 'Prêt à décrocher votre prochain emploi ?',
    'home.cta.subtitle': 'Rejoignez des milliers de professionnels qui ont trouvé leur emploi grâce à Cameroon Travail',
    'home.cta.create.account': 'Créer mon compte',
    'home.cta.upload.cv': 'Déposer mon CV',
    'home.view.all.jobs': 'Voir toutes les offres',
    'home.all.advice': 'Tous nos conseils',
    'home.discover.latest': 'Découvrez les dernières opportunités d\'emploi',
    'home.experts.accompany': 'Nos experts vous accompagnent dans votre recherche d\'emploi',
    
    // Home Hero
    'home.hero.title': 'Trouvez votre emploi au Cameroun',
    'home.hero.subtitle': 'Plus de 10 000 offres d\'emploi dans tous les secteurs',
    
    // Job Seeker
    'home.jobseeker.title': 'Je cherche un emploi',
    'home.jobseeker.subtitle': 'Trouvez votre prochain emploi parmi des milliers d\'offres',
    'home.jobseeker.search.placeholder': 'Métier, compétence, entreprise...',
    'home.jobseeker.location.placeholder': 'Ville, région...',
    'home.jobseeker.search.button': 'Rechercher',
    'home.jobseeker.create.account': 'Créer mon compte candidat',
    'home.jobseeker.upload.cv': 'Déposer mon CV',
    
    // Recruiter
    'home.recruiter.title': 'Je recrute',
    'home.recruiter.subtitle': 'Trouvez les meilleurs talents pour votre entreprise',
    'home.recruiter.benefit1': 'Accès à notre CVthèque',
    'home.recruiter.benefit2': 'Publication d\'offres illimitée',
    'home.recruiter.benefit3': 'Outils de gestion des candidatures',
    'home.recruiter.benefit4': 'Support dédié',
    'home.recruiter.create.account': 'Créer mon compte recruteur',
    'home.recruiter.discover.pro': 'Découvrir l\'espace pro',
    'home.recruiter.contact.advisor': 'Être rappelé par un conseiller',
    
    // Latest Jobs
    'home.jobs.title': 'Dernières offres',
    'home.jobs.subtitle': 'Découvrez les dernières opportunités d\'emploi',
    'home.jobs.view': 'Voir',
    'home.jobs.viewall': 'Voir toutes les offres',
    
    // Advice
    'home.advice.subtitle': 'Nos experts vous accompagnent dans votre recherche d\'emploi',
    'home.advice.article1.title': 'Comment rédiger un entretien d\'embauche',
    'home.advice.article1.excerpt': 'Les clés pour faire bonne impression et décrocher le poste',
    'home.advice.article2.title': 'Rédiger un CV qui se démarque',
    'home.advice.article2.excerpt': 'Les astuces pour créer un CV professionnel',
    'home.advice.readmore': 'Lire la suite',
    'home.advice.viewall': 'Tous nos conseils',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    
    // Job search
    'jobs.title': 'Offres d\'emploi',
    'jobs.filters': 'Filtres',
    'jobs.contract.cdi': 'CDI',
    'jobs.contract.cdd': 'CDD',
    'jobs.contract.stage': 'Stage',
    'jobs.contract.freelance': 'Freelance',
    'jobs.location': 'Lieu',
    'jobs.salary': 'Salaire',
    'jobs.company': 'Entreprise',
    'jobs.apply': 'Postuler',
    'jobs.details': 'Voir les détails',
    'jobs.found': 'offres trouvées',
    'jobs.reset.filters': 'Réinitialiser les filtres',
    'jobs.all.types': 'Tous les types',
    'jobs.all.salaries': 'Tous les salaires',
    'jobs.company.name': 'Nom de l\'entreprise',
    'jobs.previous': 'Précédent',
    'jobs.next': 'Suivant',
    'jobs.recommended': 'Recommandé',
    
    // Profile
    'profile.title': 'Mon Profil',
    'profile.personal': 'Informations personnelles',
    'profile.experience': 'Expérience',
    'profile.education': 'Formation',
    'profile.skills': 'Compétences',
    'profile.languages': 'Langues',
    
    // CV Upload
    'cv.title': 'Mon CV',
    'cv.upload': 'Télécharger un CV',
    'cv.formats': 'Formats acceptés: PDF, DOC, DOCX',
    'cv.max.size': 'Taille maximum: 5MB',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirm.password': 'Confirmer le mot de passe',
    'auth.firstname': 'Prénom',
    'auth.lastname': 'Nom',
    'auth.phone': 'Téléphone',
    'auth.login': 'Se connecter',
    'auth.register': 'S\'inscrire',
    'auth.forgot.password': 'Mot de passe oublié?',
    'auth.login.link': 'connectez-vous à votre compte',
    'auth.register.link': 'créez votre compte gratuitement',
    'auth.accept.terms': 'J\'accepte les',
    'auth.terms.link': 'conditions d\'utilisation',
    'auth.and': 'et la',
    'auth.privacy.link': 'politique de confidentialité',
    'auth.remember.me': 'Se souvenir de moi',
    'auth.continue.with': 'Ou continuez avec',
    'auth.continue.google': 'Continuer avec Google',
    'auth.optional': '(optionnel)',
    'auth.login.title': 'Se connecter',
    'auth.register.title': 'S\'inscrire',
    'auth.or': 'Ou',
    'auth.accept': 'J\'accepte les',
    'auth.logging.in': 'Connexion...',
    'auth.registering': 'Inscription...',
    'auth.login.error': 'Email ou mot de passe incorrect',
    'auth.register.error': 'Une erreur est survenue lors de l\'inscription',
    'auth.password.mismatch': 'Les mots de passe ne correspondent pas',
    'auth.accept.terms.required': 'Vous devez accepter les conditions d\'utilisation',
    
    // Footer
    'footer.about': 'À propos',
    'footer.contact': 'Contact',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.privacy': 'Politique de confidentialité',
    'footer.help': 'Aide',
    'footer.quick.links': 'Liens rapides',
    'footer.support': 'Support',
    'footer.contact.info': 'Contact',
    'footer.rights': 'Tous droits réservés.',
    'footer.platform.description': 'La plateforme de référence pour l\'emploi au Cameroun. Connectez-vous aux meilleures opportunités professionnelles.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'nav.profile': 'Profile',
    'nav.cv': 'My CV',
    'nav.alerts': 'Alerts',
    'nav.blog': 'Advice',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Home page
    'home.title': 'Find your job in Cameroon',
    'home.subtitle': 'More than 10,000 job offers in all sectors',
    'home.search.placeholder': 'Job, skill, company...',
    'home.location.placeholder': 'City, region...',
    'home.search.button': 'Search',
    'home.stats.jobs': 'Job offers',
    'home.stats.companies': 'Companies',
    'home.stats.candidates': 'Candidates',
    'home.latest.jobs': 'Latest jobs',
    'home.advice.title': 'Job advice',
    'home.cta.title': 'Ready to land your next job?',
    'home.cta.subtitle': 'Join thousands of professionals who found their job through Cameroon Travail',
    'home.cta.create.account': 'Create my account',
    'home.cta.upload.cv': 'Upload my CV',
    'home.view.all.jobs': 'View all jobs',
    'home.all.advice': 'All our advice',
    'home.discover.latest': 'Discover the latest job opportunities',
    'home.experts.accompany': 'Our experts support you in your job search',
    
    // Home Hero
    'home.hero.title': 'Find your job in Cameroon',
    'home.hero.subtitle': 'More than 10,000 job offers in all sectors',
    
    // Job Seeker
    'home.jobseeker.title': 'I\'m looking for a job',
    'home.jobseeker.subtitle': 'Find your next job among thousands of offers',
    'home.jobseeker.search.placeholder': 'Job, skill, company...',
    'home.jobseeker.location.placeholder': 'City, region...',
    'home.jobseeker.search.button': 'Search',
    'home.jobseeker.create.account': 'Create candidate account',
    'home.jobseeker.upload.cv': 'Upload my CV',
    
    // Recruiter
    'home.recruiter.title': 'I\'m recruiting',
    'home.recruiter.subtitle': 'Find the best talents for your company',
    'home.recruiter.benefit1': 'Access to our CV database',
    'home.recruiter.benefit2': 'Unlimited job posting',
    'home.recruiter.benefit3': 'Application management tools',
    'home.recruiter.benefit4': 'Dedicated support',
    'home.recruiter.create.account': 'Create recruiter account',
    'home.recruiter.discover.pro': 'Discover pro space',
    'home.recruiter.contact.advisor': 'Be called back by an advisor',
    
    // Latest Jobs
    'home.jobs.title': 'Latest jobs',
    'home.jobs.subtitle': 'Discover the latest job opportunities',
    'home.jobs.view': 'View',
    'home.jobs.viewall': 'View all jobs',
    
    // Advice
    'home.advice.subtitle': 'Our experts support you in your job search',
    'home.advice.article1.title': 'How to prepare for a job interview',
    'home.advice.article1.excerpt': 'The keys to making a good impression and landing the job',
    'home.advice.article2.title': 'Write a CV that stands out',
    'home.advice.article2.excerpt': 'Tips for creating a professional CV',
    'home.advice.readmore': 'Read more',
    'home.advice.viewall': 'All our advice',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    
    // Job search
    'jobs.title': 'Job offers',
    'jobs.filters': 'Filters',
    'jobs.contract.cdi': 'Permanent',
    'jobs.contract.cdd': 'Fixed-term',
    'jobs.contract.stage': 'Internship',
    'jobs.contract.freelance': 'Freelance',
    'jobs.location': 'Location',
    'jobs.salary': 'Salary',
    'jobs.company': 'Company',
    'jobs.apply': 'Apply',
    'jobs.details': 'View details',
    'jobs.found': 'jobs found',
    'jobs.reset.filters': 'Reset filters',
    'jobs.all.types': 'All types',
    'jobs.all.salaries': 'All salaries',
    'jobs.company.name': 'Company name',
    'jobs.previous': 'Previous',
    'jobs.next': 'Next',
    'jobs.recommended': 'Recommended',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.personal': 'Personal information',
    'profile.experience': 'Experience',
    'profile.education': 'Education',
    'profile.skills': 'Skills',
    'profile.languages': 'Languages',
    
    // CV Upload
    'cv.title': 'My CV',
    'cv.upload': 'Upload a CV',
    'cv.formats': 'Accepted formats: PDF, DOC, DOCX',
    'cv.max.size': 'Maximum size: 5MB',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm.password': 'Confirm password',
    'auth.firstname': 'First name',
    'auth.lastname': 'Last name',
    'auth.phone': 'Phone',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgot.password': 'Forgot password?',
    'auth.login.link': 'sign in to your account',
    'auth.register.link': 'create your free account',
    'auth.accept.terms': 'I accept the',
    'auth.terms.link': 'terms of use',
    'auth.and': 'and the',
    'auth.privacy.link': 'privacy policy',
    'auth.remember.me': 'Remember me',
    'auth.continue.with': 'Or continue with',
    'auth.continue.google': 'Continue with Google',
    'auth.optional': '(optional)',
    'auth.login.title': 'Sign in',
    'auth.register.title': 'Sign up',
    'auth.or': 'Or',
    'auth.accept': 'I accept the',
    'auth.logging.in': 'Signing in...',
    'auth.registering': 'Signing up...',
    'auth.login.error': 'Incorrect email or password',
    'auth.register.error': 'An error occurred during registration',
    'auth.password.mismatch': 'Passwords do not match',
    'auth.accept.terms.required': 'You must accept the terms of use',
    
    // Professional section
    'pro.title': 'Professional Space',
    'pro.subtitle': 'Recruit the best talents in Cameroon',
    'pro.register': 'Create recruiter account',
    'pro.login': 'Professional login',
    'pro.callback': 'Request callback',
    'pro.features.cvbase': 'Premium CV Database',
    'pro.features.targeting': 'Precise Targeting',
    'pro.features.analytics': 'Advanced Analytics',
    'pro.features.support': 'Dedicated Support',
    
    // Footer
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms of use',
    'footer.privacy': 'Privacy policy',
    'footer.help': 'Help',
    'footer.quick.links': 'Quick links',
    'footer.support': 'Support',
    'footer.contact.info': 'Contact',
    'footer.rights': 'All rights reserved.',
    'footer.platform.description': 'The reference platform for employment in Cameroon. Connect to the best professional opportunities.',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};