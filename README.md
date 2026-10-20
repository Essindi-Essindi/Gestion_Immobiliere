# Gestion Immobilière

Plateforme web de gestion locative. Trois profils : le **bailleur** (propriétaire) gère ses logements, ses chambres, ses locataires, ses contrats et ses loyers ; le **locataire** consulte son logement, son contrat, ses paiements et signale des problèmes ; l'**administrateur** supervise les comptes, les abonnements et la plateforme.

- **Backend** : Spring Boot (Java 17+), Spring Security + JWT, MySQL. API sur `http://localhost:8080/api`.
- **Frontend** : Angular 18, dossier `Frontend/`. Application sur `http://localhost:4200`.

---

## 1. Prérequis

| Outil | Version | Remarque |
|---|---|---|
| Java (JDK) | 17 ou plus | Vérifier avec `java -version` (Java 8 ne compile pas le projet) |
| MySQL | 8.x | Doit tourner sur `localhost:3306` |
| Node.js + npm | 18, 20 ou 22 | Pour le frontend |

Par défaut, le backend se connecte à MySQL avec l'utilisateur `root` et le mot de passe `root`. Si votre MySQL a d'autres identifiants, créez un fichier `.env` à la racine (voir le point 6).

## 2. Lancer le backend (une première fois, pour créer les tables)

Depuis la racine du projet (le dossier qui contient `pom.xml`) :

```bash
./mvnw spring-boot:run
```

(Sous Windows PowerShell : `.\mvnw.cmd spring-boot:run`.)

Au premier démarrage, Hibernate crée automatiquement la base `gestion_immobiliere` et toutes ses tables. Attendre le message `Started GestionImmobiliereApplication`, puis **arrêter le serveur** (`Ctrl + C`).

> Aucune configuration e-mail n'est nécessaire (voir le point 5).

## 3. Remplir la base avec le jeu de données

Le fichier [`sql/seed-test-data.sql`](sql/seed-test-data.sql) contient toutes les données de démonstration. Il faut l'exécuter **après** l'étape 2 (les tables doivent exister) et **une seule fois** (le rejouer créerait des doublons d'e-mails et échouerait).

- **MySQL Workbench** : ouvrir le fichier, sélectionner la base `gestion_immobiliere`, exécuter tout le script (icône éclair).
- **Ligne de commande** :

```bash
mysql -u root -p gestion_immobiliere < sql/seed-test-data.sql
```

Pour repartir de zéro : `DROP DATABASE gestion_immobiliere;`, puis refaire les étapes 2 et 3.

## 4. Lancer l'application

Backend (terminal 1, racine du projet) :

```bash
./mvnw spring-boot:run
```

Frontend (terminal 2) :

```bash
cd Frontend
npm install
npm start
```

Ouvrir ensuite **http://localhost:4200**.

## 5. E-mails : pourquoi vous n'en recevrez pas

Le serveur d'envoi d'e-mails (SMTP) n'est pas configuré dans cette livraison, car il utilise un compte personnel. Sans configuration, l'application **n'envoie aucun e-mail** : elle écrit seulement un avertissement dans la console (`SMTP non configuré ... e-mail non envoyé`) et continue de fonctionner normalement.

Ce que cela change pour vous :

| Fonction | Normalement | Dans cette démo |
|---|---|---|
| Création d'un locataire | E-mail avec le lien de connexion, l'identifiant et le mot de passe temporaire | Le bailleur saisit (ou génère) un *mot de passe temporaire* dans le formulaire. Sans e-mail, il le communique lui-même au locataire, qui se connecte puis doit choisir un nouveau mot de passe. Tant que le locataire ne l'a pas changé, le bailleur peut le remplacer (fenêtre « Modifier ») ; ensuite, plus jamais. |
| « Mot de passe oublié » | Lien de réinitialisation par e-mail | Le lien n'arrivera pas. Pour le voir, lancer le backend avec le profil `dev` : `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`. Le lien est alors affiché dans la console (ligne `[DEV] lien envoyé à ...`) et peut être copié dans le navigateur. |
| Rappel de loyer, alerte de changement de mot de passe | Envoyés par e-mail | Non envoyés. Les notifications dans l'application fonctionnent quand même. |

Aucun e-mail réel n'est donc nécessaire pour tester l'application : tous les comptes ci-dessous existent déjà dans le jeu de données.

## 6. Identifiants de test

**Mot de passe de TOUS les comptes : `password123`**

| Profil | E-mail | Page de connexion | Particularité |
|---|---|---|---|
| Administrateur | `admin1@immo.com` (aussi `admin2@`, `admin3@`) | `/auth/super-admin/login` | Super admin |
| Bailleur | `bailleur1@immo.com` | `/auth/bailleur/login` | Paul Kamga : 3 logements (le plus complet), abonnement Standard |
| Bailleur | `bailleur2@immo.com` | `/auth/bailleur/login` | Sophie Nguyen : 1 studio, abonnement Basique |
| Bailleur | `bailleur3@immo.com` | `/auth/bailleur/login` | **Suspendu** : la connexion est refusée (cas de test) |
| Bailleur | `bailleur4@immo.com` | `/auth/bailleur/login` | Eric Mbarga : **aucun logement**, aucun abonnement (écrans vides) |
| Locataire | `locataire1@immo.com` | `/auth/locataire/login` | Marie Ngo : logement 1, chambre CH-1, loyer payé |
| Locataire | `locataire2@immo.com` | `/auth/locataire/login` | Lucas Petit : logement 2, loyer **en retard** |
| Locataire | `locataire3@immo.com` | `/auth/locataire/login` | Aïssa Diallo : doit **changer son mot de passe** à la première connexion (10 caractères minimum, majuscule, minuscule, chiffre, caractère spécial) |
| Locataire | `locataire4@immo.com` | `/auth/locataire/login` | Sarah Fotso : colocataire de Marie (logement 1, CH-2) |
| Locataire | `locataire5@immo.com` | `/auth/locataire/login` | Jean Mballa : **pas encore de logement** (bailleur 1) |
| Locataire | `locataire6@immo.com` | `/auth/locataire/login` | Nadine Tchoumi : **pas encore de logement** (bailleur 2) |

Si votre MySQL n'utilise pas `root` / `root`, copiez `.env.example` en `.env` à la racine et renseignez `DB_USER`, `DB_PASSWORD` et **`JWT_SECRET` (32 caractères minimum, obligatoire dans ce cas)**. Le fichier `.env` n'est jamais versionné.

## 7. Ce que contient le jeu de données (et ses « trous » volontaires)

Le jeu de données laisse volontairement des cas incomplets pour pouvoir tester les actions du bailleur sans rien casser :

- **2 locataires non affectés** (`locataire5`, `locataire6`) : sans logement, sans chambre, sans contrat. Le bailleur 1 peut affecter Jean Mballa à une chambre libre puis créer son contrat.
- **1 logement vacant** (14 rue Nationale, Lille) avec 2 chambres libres et un salon : aucun locataire, aucun contrat.
- **1 chambre libre** dans un logement loué (logement 2, `CH-2`).
- **1 bailleur sans logement** (`bailleur4`) et **1 bailleur suspendu** (`bailleur3`).
- **Loyers** : un payé, un en retard, un à venir, et des contrats sans loyer généré.
- **Signalements** (problèmes) : un nouveau, un en cours, un terminé.
- Les contraintes sont respectées : un numéro de chambre unique par logement, une seule quittance par contrat et par mois, un e-mail unique par compte.

### Parcours de démonstration conseillé

1. Se connecter en **bailleur1** : tableau de bord, logements et occupation des chambres, loyers en retard.
2. Affecter **Jean Mballa** (non affecté) à la chambre `CH-1` du logement vacant, puis créer son contrat.
3. Créer un nouveau locataire avec un **mot de passe temporaire**, puis se connecter avec lui (changement de mot de passe obligatoire).
4. Se connecter en **locataire1** : logement, contrat, paiements, quittances, signaler un problème.
5. Revenir en **bailleur1** : traiter le signalement (en cours puis terminé).
6. Se connecter en **admin1** : liste des bailleurs, suspension / réactivation, abonnements, journal d'activité.

## 8. Structure du projet

```
src/main/java/.../gestion_immobiliere
  config/       sécurité (JWT, filtres, limitation de débit), données de départ
  controller/   points d'entrée de l'API (requêtes HTTP)
  service/      logique métier (contrats, loyers, e-mails, PDF...)
  repository/   accès à la base (Spring Data JPA)
  model/        entités (tables)
  dto/          objets échangés avec le frontend (+ validation)
  exception/    gestion centralisée des erreurs
Frontend/       application Angular (voir Frontend/README.md)
sql/            jeu de données de test
```

## 9. Dépannage

| Symptôme | Cause probable |
|---|---|
| Erreurs de compilation Maven étranges (`class, interface, or enum expected`) | Mauvaise version de Java : utiliser le JDK 17 ou plus (`JAVA_HOME`) |
| `Access denied for user 'root'` | Identifiants MySQL différents : créer le `.env` (point 6) |
| Le script SQL échoue sur `ALTER TABLE` ou `INSERT` | Le backend n'a pas encore créé les tables : refaire l'étape 2 |
| Erreur `Duplicate entry` | Le script a déjà été exécuté : supprimer la base et recommencer |
| Page blanche / erreur réseau côté Angular | Le backend n'est pas lancé sur le port 8080 |

## 10. Version déployée (Render + Aiven + Brevo)

Architecture : l'**API** est un service Docker Render, le **frontend** est un site statique Render déployé séparément, la **base MySQL** est chez Aiven et les **e-mails** passent par l'API HTTP de Brevo (le plan gratuit de Render bloque le SMTP).

> Render n'exécute pas `docker-compose`. Il construit directement le [`Dockerfile`](Dockerfile). Le fichier [`docker-compose.yml`](docker-compose.yml) sert uniquement à tester la même image en local avec une base MySQL (`docker compose up --build`).

### 10.1 Aiven (base de données)
1. Créer un service **MySQL** (plan gratuit). Noter l'hôte, le port, l'utilisateur (`avnadmin`), le mot de passe et la base (`defaultdb`).
2. Vérifier que l'accès réseau est ouvert (Allowed IP addresses).
3. L'URL à utiliser côté API : `jdbc:mysql://HOTE:PORT/defaultdb?sslMode=REQUIRED&serverTimezone=UTC`.

### 10.2 Brevo (e-mails)
1. Créer une **clé API** (SMTP & API > API Keys).
2. Ajouter et valider un **expéditeur** (Senders) : c'est l'adresse à mettre dans `MAIL_FROM`.

### 10.3 Render : l'API (service Docker)
1. Pousser le dépôt sur GitHub, puis Render > **New > Web Service** > choisir le dépôt.
2. Langage **Docker**, type d'instance **Free**, chemin du Dockerfile `./Dockerfile` (valeur par défaut).
3. Renseigner les variables d'environnement :

| Variable | Valeur |
|---|---|
| `DB_URL` | l'URL JDBC Aiven ci-dessus |
| `DB_USER`, `DB_PASSWORD` | identifiants Aiven |
| `JWT_SECRET` | une chaîne aléatoire de 32 caractères minimum (ex. `openssl rand -base64 48`) |
| `CORS_ORIGIN` | l'URL du frontend, sans `/` final (à renseigner après l'étape 10.4) |
| `BREVO_API_KEY` | la clé API Brevo |
| `MAIL_FROM` | l'expéditeur validé dans Brevo |

Le profil `prod` est déjà activé par le Dockerfile. Une fois déployée, noter l'URL de l'API (ex. `https://gestion-immobiliere-api.onrender.com`).

### 10.4 Render : le frontend (site statique)
1. Dans `Frontend/src/environments/environment.prod.ts`, vérifier que `apiUrl` vaut l'URL de l'API suivie de `/api`, puis pousser le changement.
2. Render > **New > Static Site** > choisir le même dépôt, puis :

| Réglage | Valeur |
|---|---|
| Root Directory | `Frontend` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist/gestion-immobiliere/browser` |
| Variable d'environnement | `NODE_VERSION` = `22.12.0` |
| Redirects / Rewrites | source `/*`, destination `/index.html`, action **Rewrite** |

3. Une fois le site en ligne, copier son URL dans la variable `CORS_ORIGIN` de l'API (point 10.3), puis redémarrer l'API. Sans cela, le navigateur bloquera les appels.

### 10.5 Données initiales
Au **premier démarrage sur une base vide**, l'API exécute automatiquement `sql/seed-test-data.sql` (variable `SEED_DATABASE=true`, activée par défaut en production). Les tables sont créées par Hibernate juste avant. Aux démarrages suivants, rien n'est rechargé. Les comptes de test du point 6 existent donc sur le site déployé.

> Les comptes de test ont tous le mot de passe `password123`. Sur un site public, changez-le ou mettez `SEED_DATABASE=false` avant le premier démarrage.

### 10.6 Limites du plan gratuit
- Le service API s'endort après 15 minutes sans trafic : la première requête suivante prend environ une minute.
- Les services Aiven gratuits peuvent être arrêtés après une longue inactivité.
- Brevo gratuit : 300 e-mails par jour.
