import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const ARTICLES = [
  {
    slug: "reussir-entretien-embauche-cameroun",
    titre: "Comment réussir son entretien d'embauche au Cameroun",
    description: "Découvrez nos conseils pratiques pour faire bonne impression lors de votre entretien d'embauche et décrocher le poste de vos rêves.",
    contenu: `## Préparer son entretien d'embauche

L'entretien d'embauche est une étape cruciale dans votre recherche d'emploi. Au Cameroun, comme partout ailleurs, la préparation est la clé du succès. Voici nos conseils pour mettre toutes les chances de votre côté.

### 1. Renseignez-vous sur l'entreprise

Avant de vous présenter à un entretien, prenez le temps de vous informer sur l'entreprise : son secteur d'activité, ses produits ou services, sa culture d'entreprise, ses valeurs et ses récentes actualités. Cette connaissance vous permettra de répondre aux questions avec pertinence et de montrer votre intérêt réel pour le poste.

### 2. Préparez vos réponses aux questions classiques

Certaines questions reviennent fréquemment lors des entretiens :
- **Parlez-moi de vous** : Préparez un pitch de 2 à 3 minutes résumant votre parcours, vos compétences et vos ambitions.
- **Quelles sont vos forces et faiblesses ?** : Soyez honnête tout en restant positif. Transformez vos faiblesses en axes d'amélioration.
- **Pourquoi voulez-vous travailler chez nous ?** : Montrez que vous avez fait vos recherches et que le poste correspond à vos aspirations.
- **Où vous voyez-vous dans 5 ans ?** : Exprimez des ambitions réalistes et alignées avec les perspectives de l'entreprise.

### 3. Soignez votre présentation

Au Cameroun, la tenue vestimentaire est très importante. Optez pour une tenue professionnelle et sobre, adaptée au secteur d'activité. Arrivez 10 à 15 minutes avant l'heure prévue pour montrer votre ponctualité.

### 4. Maîtrisez votre langage corporel

Votre communication non verbale est aussi importante que vos paroles. Maintenez un contact visuel avec votre interlocuteur, adoptez une posture droite et ouverte, souriez naturellement et évitez les gestes nerveux.

### 5. Posez des questions pertinentes

À la fin de l'entretien, le recruteur vous demandera si vous avez des questions. Préparez 2 à 3 questions pertinentes sur le poste, l'équipe ou les perspectives d'évolution. Cela montre votre intérêt et votre préparation.

### 6. Faites un suivi après l'entretien

Envoyez un email de remerciement dans les 24 heures suivant l'entretien. Réitérez votre intérêt pour le poste et mentionnez un point fort de la discussion.

## Les erreurs à éviter

- Arriver en retard sans prévenir
- Critiquer ses anciens employeurs
- Ne pas connaître les bases de l'entreprise
- Parler uniquement de salaire dès le début
- Avoir le téléphone qui sonne pendant l'entretien

En suivant ces conseils, vous maximiserez vos chances de réussite lors de vos entretiens d'embauche au Cameroun.`,
    categorie: "Entretien",
    auteur: "Marie Nguema",
    tempsLecture: "5 min",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-entretien-6CeVb2GcWVUbmTRDXkFj6M.webp",
    featured: true,
    datePublication: new Date("2026-01-15"),
  },
  {
    slug: "rediger-cv-marche-camerounais",
    titre: "Rédiger un CV qui se démarque sur le marché camerounais",
    description: "Les clés pour créer un CV attractif et professionnel adapté au contexte local et aux attentes des recruteurs.",
    contenu: `## Créer un CV percutant pour le marché camerounais

Le CV est votre carte de visite professionnelle. Au Cameroun, les recruteurs reçoivent des dizaines de candidatures pour chaque poste. Voici comment faire la différence.

### La structure idéale d'un CV camerounais

Un bon CV doit être clair, concis et bien structuré. Il doit tenir sur une à deux pages maximum et contenir les sections suivantes :

**1. En-tête**
- Prénom et Nom (en gras, taille 14-16)
- Titre professionnel ou poste recherché
- Coordonnées complètes (téléphone, email, ville)
- Lien LinkedIn ou portfolio si pertinent

**2. Profil professionnel**
Rédigez un paragraphe de 3 à 5 lignes résumant votre expérience, vos compétences clés et votre valeur ajoutée. C'est la première chose que lit le recruteur.

**3. Expériences professionnelles**
Listez vos expériences par ordre chronologique inverse (la plus récente en premier). Pour chaque poste, indiquez :
- Intitulé du poste
- Nom de l'entreprise et secteur
- Période (mois/année - mois/année)
- 3 à 5 réalisations concrètes avec des chiffres si possible

**4. Formation**
Indiquez vos diplômes par ordre chronologique inverse, avec l'établissement, la spécialité et l'année d'obtention.

**5. Compétences**
Distinguez les compétences techniques (logiciels, langages, outils) des compétences transversales (communication, leadership, gestion de projet).

**6. Langues**
Précisez votre niveau pour chaque langue : débutant, intermédiaire, avancé, courant, bilingue.

### Les spécificités du marché camerounais

Au Cameroun, il est courant d'inclure une photo professionnelle dans le CV. Choisissez une photo récente, en tenue professionnelle, avec un fond neutre.

La mention de votre âge, nationalité et situation matrimoniale est souvent attendue, bien que non obligatoire.

### Les erreurs fréquentes à éviter

- Les fautes d'orthographe (faites relire votre CV)
- Un format trop chargé ou difficile à lire
- Des informations non vérifiables ou exagérées
- Un CV générique non adapté au poste visé
- Des trous inexpliqués dans le parcours

### Adaptez votre CV à chaque offre

Ne soumettez jamais le même CV pour tous les postes. Personnalisez-le en mettant en avant les compétences et expériences les plus pertinentes pour le poste visé.`,
    categorie: "CV",
    auteur: "Paul Biya Junior",
    tempsLecture: "7 min",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-cv-jtHqb8L2PnGEUGbd3iACKb.webp",
    featured: false,
    datePublication: new Date("2026-01-12"),
  },
  {
    slug: "secteurs-recrutent-cameroun-2026",
    titre: "Les secteurs qui recrutent le plus au Cameroun en 2026",
    description: "Analyse des tendances du marché de l'emploi et des opportunités dans les différents secteurs d'activité.",
    contenu: `## Le marché de l'emploi au Cameroun en 2026

Le marché de l'emploi camerounais est en pleine évolution. Certains secteurs connaissent une croissance significative et offrent de nombreuses opportunités aux candidats qualifiés.

### 1. Les technologies de l'information et de la communication (TIC)

Le secteur numérique est en plein essor au Cameroun. La transformation digitale des entreprises et des administrations publiques crée une forte demande pour les profils suivants :
- Développeurs web et mobile
- Data scientists et analystes de données
- Experts en cybersécurité
- Chefs de projet digital
- Spécialistes en marketing digital

Yaoundé et Douala concentrent la majorité des offres, mais le télétravail ouvre de nouvelles possibilités.

### 2. Le secteur bancaire et financier

Les banques et institutions financières recrutent activement, notamment pour :
- Les conseillers clientèle
- Les analystes financiers
- Les spécialistes en conformité et risques
- Les experts en microfinance

### 3. L'agro-industrie

Le Cameroun, avec ses nombreuses ressources agricoles, voit son secteur agro-industriel se développer. Les profils recherchés incluent :
- Ingénieurs agronomes
- Techniciens en transformation alimentaire
- Responsables qualité
- Commerciaux export

### 4. Les télécommunications

MTN, Orange et les opérateurs émergents continuent de recruter des techniciens réseau, des ingénieurs télécoms et des commerciaux.

### 5. Le BTP et les infrastructures

Les grands chantiers d'infrastructure (routes, logements, équipements publics) génèrent une forte demande pour les ingénieurs civils, les conducteurs de travaux et les techniciens.

### 6. La santé et l'éducation

La demande en personnel de santé qualifié (médecins, infirmiers, pharmaciens) et en enseignants reste forte, notamment dans les zones rurales.

### Conseils pour saisir ces opportunités

- Formez-vous aux outils numériques, quelle que soit votre spécialité
- Développez votre réseau professionnel sur LinkedIn et lors d'événements sectoriels
- Restez informé des appels d'offres publics et des recrutements dans les grandes entreprises
- Envisagez des certifications reconnues internationalement pour renforcer votre profil`,
    categorie: "Marché",
    auteur: "Dr. Amina Fouda",
    tempsLecture: "10 min",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-marche-JiqjTQKZP4pNPYcjVBtyGy.webp",
    featured: false,
    datePublication: new Date("2026-01-06"),
  },
  {
    slug: "negocier-salaire-cameroun",
    titre: "Négocier son salaire : guide pratique pour le Cameroun",
    description: "Comment aborder la question de la rémunération et négocier efficacement votre salaire selon votre profil.",
    contenu: `## L'art de la négociation salariale au Cameroun

La négociation salariale est souvent perçue comme un exercice délicat, surtout dans le contexte camerounais où la culture professionnelle peut rendre ce sujet tabou. Pourtant, bien négocier son salaire est une compétence essentielle.

### Quand aborder la question du salaire ?

La règle d'or : laissez le recruteur aborder le sujet en premier. Si vous êtes contraint de répondre, donnez une fourchette plutôt qu'un chiffre précis. Évitez d'aborder le salaire lors du premier entretien.

### Comment se préparer ?

**Faites votre recherche de marché**
Avant de négocier, renseignez-vous sur les salaires pratiqués dans votre secteur et pour votre niveau d'expérience. Consultez les enquêtes salariales, les offres d'emploi similaires et les témoignages de professionnels de votre réseau.

**Évaluez votre valeur**
Listez vos compétences, certifications, expériences et réalisations concrètes. Calculez la valeur que vous apportez à l'entreprise en termes de chiffre d'affaires généré, de coûts économisés ou de problèmes résolus.

**Définissez votre fourchette**
Fixez-vous un salaire cible (idéal), un salaire minimum acceptable et un salaire de départ (légèrement supérieur à votre cible pour laisser de la marge de négociation).

### Les techniques de négociation

**Justifiez votre demande**
Ne demandez pas simplement plus d'argent. Expliquez pourquoi vous méritez ce salaire en vous appuyant sur des faits concrets : vos réalisations passées, vos compétences rares, le coût du marché.

**Négociez l'ensemble du package**
Le salaire n'est qu'une composante de la rémunération. Pensez également à négocier : les primes, les avantages en nature (véhicule, logement, téléphone), la prise en charge des frais de transport, la formation professionnelle, les congés supplémentaires.

**Restez professionnel et positif**
Abordez la négociation comme une discussion constructive, pas comme un affrontement. Montrez que vous êtes flexible et que vous cherchez un accord mutuellement bénéfique.

### Les erreurs à éviter

- Accepter la première offre sans négocier
- Mentir sur votre salaire actuel
- Donner un chiffre trop élevé ou trop bas sans justification
- Négocier de manière agressive ou menaçante
- Oublier de confirmer l'accord par écrit

### Après la négociation

Une fois l'accord trouvé, demandez à recevoir l'offre par écrit avant de donner votre réponse définitive. Prenez le temps de relire attentivement le contrat de travail.`,
    categorie: "Négociation",
    auteur: "Jean-Claude Essame",
    tempsLecture: "6 min",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-negociation-W9T24Ygki8mHLLpbhRxjAw.webp",
    featured: false,
    datePublication: new Date("2026-01-05"),
  },
  {
    slug: "reconversion-professionnelle-cameroun",
    titre: "Reconversion professionnelle : par où commencer ?",
    description: "Conseils pour réussir sa reconversion professionnelle et identifier les opportunités dans votre nouveau secteur.",
    contenu: `## Réussir sa reconversion professionnelle au Cameroun

La reconversion professionnelle est une démarche de plus en plus courante au Cameroun. Que ce soit par choix ou par nécessité, changer de métier est un projet qui demande une préparation rigoureuse.

### Pourquoi se reconvertir ?

Les raisons de se reconvertir sont multiples :
- Insatisfaction dans le poste actuel
- Secteur en déclin ou peu porteur
- Désir de donner plus de sens à son travail
- Opportunités dans un nouveau secteur
- Problèmes de santé incompatibles avec le métier actuel

### Étape 1 : Le bilan de compétences

Avant de vous lancer, faites le point sur vos compétences, vos valeurs, vos intérêts et vos contraintes personnelles. Posez-vous les questions suivantes :
- Qu'est-ce que j'aime faire ?
- Quelles sont mes compétences transférables ?
- Quelles sont mes contraintes (géographiques, financières, familiales) ?
- Quel niveau de risque suis-je prêt à accepter ?

### Étape 2 : Explorer les possibilités

Renseignez-vous sur les métiers qui vous attirent : les formations requises, les débouchés, les salaires pratiqués, les conditions de travail. Rencontrez des professionnels du secteur visé pour avoir un retour d'expérience concret.

### Étape 3 : Valider votre projet

Avant de vous engager pleinement, testez votre nouveau projet professionnel. Vous pouvez :
- Faire des stages ou des missions courtes dans le secteur visé
- Suivre des formations en ligne pour acquérir les bases
- Développer un projet personnel ou associatif dans le domaine

### Étape 4 : Se former

Identifiez les compétences manquantes et les formations disponibles au Cameroun ou en ligne. Plusieurs options s'offrent à vous :
- Formations professionnelles courtes
- Licences professionnelles ou masters
- Certifications reconnues internationalement
- Auto-formation via des plateformes en ligne (Coursera, edX, YouTube)

### Étape 5 : Construire son réseau dans le nouveau secteur

Le réseau est essentiel lors d'une reconversion. Rejoignez des associations professionnelles, participez à des événements sectoriels, connectez-vous avec des professionnels sur LinkedIn.

### Les secteurs porteurs pour une reconversion

- Le numérique et les TIC
- L'entrepreneuriat et la création d'entreprise
- L'agro-industrie et l'agriculture moderne
- La santé et le bien-être
- L'éducation et la formation

### Gérer la transition financière

Prévoyez une épargne de sécurité couvrant 6 à 12 mois de dépenses avant de vous lancer. Envisagez une transition progressive en développant votre nouvelle activité en parallèle de votre emploi actuel.`,
    categorie: "Reconversion",
    auteur: "Sophie Mballa",
    tempsLecture: "8 min",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-reconversion-9bxGZgCJVkkgQzzeQDTRce.webp",
    featured: false,
    datePublication: new Date("2026-01-02"),
  },
  {
    slug: "freelance-cameroun-activite-independante",
    titre: "Freelance au Cameroun : créer son activité indépendante",
    description: "Guide complet pour lancer son activité freelance : statut, démarches, tarification et recherche de clients.",
    contenu: `## Se lancer en freelance au Cameroun

Le freelancing est en plein développement au Cameroun, porté par la transformation numérique et la recherche de flexibilité. Voici un guide complet pour lancer votre activité indépendante.

### Qu'est-ce que le freelancing ?

Un freelance est un travailleur indépendant qui propose ses services à plusieurs clients sans être lié par un contrat de travail à durée indéterminée. Il peut exercer dans de nombreux domaines : développement web, design graphique, rédaction, conseil, formation, photographie, etc.

### Les avantages du freelancing

- Liberté de choisir ses clients et ses missions
- Flexibilité des horaires et du lieu de travail
- Potentiel de revenus plus élevé qu'en emploi salarié
- Développement de compétences variées
- Diversification des sources de revenus

### Les défis à anticiper

- Irrégularité des revenus, surtout au début
- Gestion administrative et fiscale
- Prospection et fidélisation des clients
- Isolement professionnel
- Absence de protection sociale automatique

### Les démarches administratives au Cameroun

**1. Choisir un statut juridique**
En tant que freelance au Cameroun, vous pouvez exercer en tant que :
- Personne physique (le plus simple pour démarrer)
- Entreprise individuelle
- SARL unipersonnelle

**2. S'enregistrer auprès des autorités**
- Obtenir un registre de commerce et du crédit mobilier (RCCM)
- S'enregistrer auprès du Centre des Impôts
- Obtenir un Numéro d'Identification Unique (NIU)

**3. Ouvrir un compte bancaire professionnel**
Séparez vos finances personnelles et professionnelles dès le début.

### Fixer ses tarifs

La tarification est un exercice délicat. Voici les étapes pour définir vos prix :

1. **Calculez votre coût de revient** : charges fixes, équipements, temps non facturable
2. **Renseignez-vous sur les tarifs du marché** : consultez des plateformes comme Upwork, Fiverr ou des groupes professionnels locaux
3. **Définissez votre valeur ajoutée** : expertise, rapidité, qualité
4. **Choisissez votre mode de facturation** : taux horaire, forfait projet, abonnement mensuel

### Trouver ses premiers clients

- **Votre réseau personnel et professionnel** : commencez par vos contacts
- **Les plateformes freelance** : Upwork, Fiverr, Malt, ComeUp
- **Les réseaux sociaux** : LinkedIn, Facebook (groupes professionnels camerounais)
- **La prospection directe** : contactez des entreprises locales
- **Les événements networking** : salons, conférences, meetups

### Gérer sa relation client

- Formalisez toujours vos missions avec un contrat ou un devis signé
- Définissez clairement le périmètre, les délais et les conditions de paiement
- Demandez un acompte (30 à 50%) avant de commencer
- Communiquez régulièrement sur l'avancement du projet

### Développer son activité sur le long terme

- Demandez des témoignages et recommandations à vos clients satisfaits
- Constituez un portfolio en ligne de vos meilleures réalisations
- Formez-vous continuellement pour rester compétitif
- Envisagez de vous spécialiser dans une niche pour vous différencier`,
    categorie: "Freelance",
    auteur: "Thomas Nkomo",
    tempsLecture: "12 min",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-marche-JiqjTQKZP4pNPYcjVBtyGy.webp",
    featured: false,
    datePublication: new Date("2026-02-26"),
  },
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  const { articlesConseils } = await import("../drizzle/schema.ts");
  const { sql } = await import("drizzle-orm");

  console.log("Seeding articles_conseils...");

  // Vider la table d'abord
  await db.execute(sql`DELETE FROM articles_conseils`);

  for (const article of ARTICLES) {
    await db.insert(articlesConseils).values(article);
    console.log(`✓ Inserted: ${article.slug}`);
  }

  console.log(`\n✅ ${ARTICLES.length} articles seeded successfully!`);
  await connection.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
