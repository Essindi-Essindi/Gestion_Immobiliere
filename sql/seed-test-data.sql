-- Jeu de donnees de test : 3 lignes par table (+ chambres et un colocataire) sauf parametre_plateforme, singleton
-- Test seed data: 3 rows per table (+ rooms and a flatmate) except parametre_plateforme, a singleton
--
-- Pre-requis : lance le backend au moins une fois (JWT_SECRET defini) pour que Hibernate
-- cree les tables (ddl-auto=update), puis arrete-le et execute ce script.
-- Mot de passe pour TOUS les comptes ci-dessous : password123 (a changer via "Mon compte" : la regle actuelle exige 10+ caracteres forts)
-- Comptes locataires : locataire1..4@immo.com ; locataire1 et locataire4 partagent le logement 1 (CH-1 et CH-2)
--
-- USE gestion_immobiliere; -- decommente/adapte si besoin

-- ===================== ADMIN =====================
INSERT INTO admin (last_name, first_name, email, password, access_level, created_at, updated_at)
VALUES ('Admin', 'Super', 'admin1@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', 'SUPER_ADMIN', NOW(), NOW());
SET @admin1_id = LAST_INSERT_ID();

INSERT INTO admin (last_name, first_name, email, password, access_level, created_at, updated_at)
VALUES ('Dubois', 'Claire', 'admin2@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', 'SUPER_ADMIN', NOW(), NOW());
SET @admin2_id = LAST_INSERT_ID();

INSERT INTO admin (last_name, first_name, email, password, access_level, created_at, updated_at)
VALUES ('Traore', 'Ibrahim', 'admin3@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', 'SUPER_ADMIN', NOW(), NOW());
SET @admin3_id = LAST_INSERT_ID();

-- ===================== BAILLEUR =====================
INSERT INTO bailleur (last_name, first_name, email, password, phone, address, active, admin_id, created_at, updated_at)
VALUES ('Kamga', 'Paul', 'bailleur1@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000011', '12 rue des Lilas, Paris', 1, @admin1_id, NOW(), NOW());
SET @bailleur1_id = LAST_INSERT_ID();

INSERT INTO bailleur (last_name, first_name, email, password, phone, address, active, admin_id, created_at, updated_at)
VALUES ('Nguyen', 'Sophie', 'bailleur2@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000012', '8 avenue Foch, Lyon', 1, @admin1_id, NOW(), NOW());
SET @bailleur2_id = LAST_INSERT_ID();

-- bailleur suspendu, pour tester la page admin suspendre/reactiver / suspended bailleur, to test admin suspend/reactivate
INSERT INTO bailleur (last_name, first_name, email, password, phone, address, active, suspended_at, suspension_reason, admin_id, created_at, updated_at)
VALUES ('Bernard', 'Marc', 'bailleur3@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000013', '3 place Bellecour, Lyon', 0, NOW(), 'Abonnement impaye', @admin1_id, NOW(), NOW());
SET @bailleur3_id = LAST_INSERT_ID();

-- ===================== LOGEMENT =====================
INSERT INTO logement (address, postal_code, city, country, type, area, rent, charges, status, bailleur_id, created_at, updated_at)
VALUES ('5 avenue Victor Hugo, Lyon', '69003', 'Lyon', 'France', 'T2', 45.0, 650.0, 50.0, 'LOUE', @bailleur1_id, NOW(), NOW());
SET @logement1_id = LAST_INSERT_ID();

INSERT INTO logement (address, postal_code, city, country, type, area, rent, charges, status, bailleur_id, created_at, updated_at)
VALUES ('20 rue de la Republique, Lyon', '69002', 'Lyon', 'France', 'T3', 68.0, 890.0, 70.0, 'LOUE', @bailleur1_id, NOW(), NOW());
SET @logement2_id = LAST_INSERT_ID();

INSERT INTO logement (address, postal_code, city, country, type, area, rent, charges, status, bailleur_id, created_at, updated_at)
VALUES ('2 quai des Brumes, Marseille', '13002', 'Marseille', 'France', 'STUDIO', 28.0, 480.0, 30.0, 'LOUE', @bailleur2_id, NOW(), NOW());
SET @logement3_id = LAST_INSERT_ID();

-- ===================== PIECE (chambres, salon...) =====================
-- capacite 0 = piece commune ; unique (logement_id, numero)
-- capacity 0 = shared room ; unique (logement_id, numero)
-- logement 1 : colocation, 2 chambres + pieces communes
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement1_id, 'CH-1', 'CHAMBRE', 1);
SET @piece1_id = LAST_INSERT_ID();
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement1_id, 'CH-2', 'CHAMBRE', 1);
SET @piece2_id = LAST_INSERT_ID();
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement1_id, 'SAL-1', 'SALON', 0);
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement1_id, 'CUI-1', 'CUISINE', 0);

-- logement 2 : 2 chambres, une seule occupee
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement2_id, 'CH-1', 'CHAMBRE', 1);
SET @piece3_id = LAST_INSERT_ID();
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement2_id, 'CH-2', 'CHAMBRE', 1);
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement2_id, 'SAL-1', 'SALON', 0);

-- logement 3 : studio
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement3_id, 'CH-1', 'CHAMBRE', 1);
SET @piece5_id = LAST_INSERT_ID();
INSERT INTO piece (logement_id, numero, type, capacite) VALUES (@logement3_id, 'CUI-1', 'CUISINE', 0);

-- ===================== LOCATAIRE =====================
INSERT INTO locataire (last_name, first_name, email, password, phone, birth_date, must_change_password, active, bailleur_id, logement_id, piece_id, admin_id, created_at, updated_at)
VALUES ('Ngo', 'Marie', 'locataire1@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000021', '1998-05-14', 0, 1, @bailleur1_id, @logement1_id, @piece1_id, @admin1_id, NOW(), NOW());
SET @locataire1_id = LAST_INSERT_ID();

INSERT INTO locataire (last_name, first_name, email, password, phone, birth_date, must_change_password, active, bailleur_id, logement_id, piece_id, admin_id, created_at, updated_at)
VALUES ('Petit', 'Lucas', 'locataire2@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000022', '1995-11-02', 0, 1, @bailleur1_id, @logement2_id, @piece3_id, @admin1_id, NOW(), NOW());
SET @locataire2_id = LAST_INSERT_ID();

-- must_change_password = 1, pour tester le flux de changement de mot de passe force / to test the forced password-change flow
INSERT INTO locataire (last_name, first_name, email, password, phone, birth_date, must_change_password, active, bailleur_id, logement_id, piece_id, admin_id, created_at, updated_at)
VALUES ('Diallo', 'Aissa', 'locataire3@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000023', '2000-02-20', 1, 1, @bailleur2_id, @logement3_id, @piece5_id, @admin1_id, NOW(), NOW());
SET @locataire3_id = LAST_INSERT_ID();

-- colocataire de Marie dans le logement 1, chambre CH-2 / Marie's flatmate in home 1, room CH-2
INSERT INTO locataire (last_name, first_name, email, password, phone, birth_date, must_change_password, active, bailleur_id, logement_id, piece_id, admin_id, created_at, updated_at)
VALUES ('Fotso', 'Sarah', 'locataire4@immo.com', '$2b$10$D1jikoDzri31eI/qtVBbjO3lUpjGtALA8ywlsrXnUBlaCeK0tT85m', '0600000024', '1999-09-09', 0, 1, @bailleur1_id, @logement1_id, @piece2_id, @admin1_id, NOW(), NOW());
SET @locataire4_id = LAST_INSERT_ID();

-- ===================== CONTRAT =====================
INSERT INTO contrat (start_date, end_date, monthly_rent, deposit, resiliation_demandee, logement_id, bailleur_id, locataire_id, created_at, updated_at)
VALUES (DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 650.0, 650.0, 0, @logement1_id, @bailleur1_id, @locataire1_id, NOW(), NOW());
SET @contrat1_id = LAST_INSERT_ID();

INSERT INTO contrat (start_date, end_date, monthly_rent, deposit, resiliation_demandee, logement_id, bailleur_id, locataire_id, created_at, updated_at)
VALUES (DATE_SUB(CURDATE(), INTERVAL 3 MONTH), DATE_ADD(CURDATE(), INTERVAL 9 MONTH), 890.0, 890.0, 0, @logement2_id, @bailleur1_id, @locataire2_id, NOW(), NOW());
SET @contrat2_id = LAST_INSERT_ID();

INSERT INTO contrat (start_date, end_date, monthly_rent, deposit, resiliation_demandee, logement_id, bailleur_id, locataire_id, created_at, updated_at)
VALUES (DATE_SUB(CURDATE(), INTERVAL 1 MONTH), DATE_ADD(CURDATE(), INTERVAL 11 MONTH), 480.0, 480.0, 0, @logement3_id, @bailleur2_id, @locataire3_id, NOW(), NOW());
SET @contrat3_id = LAST_INSERT_ID();

-- 2e contrat sur le logement 1 : autorise car le logement a 2 chambres (colocation)
-- 2nd contract on home 1: allowed because the home has 2 rooms (shared)
INSERT INTO contrat (start_date, end_date, monthly_rent, deposit, resiliation_demandee, logement_id, bailleur_id, locataire_id, created_at, updated_at)
VALUES (DATE_SUB(CURDATE(), INTERVAL 2 MONTH), DATE_ADD(CURDATE(), INTERVAL 10 MONTH), 325.0, 325.0, 0, @logement1_id, @bailleur1_id, @locataire4_id, NOW(), NOW());
SET @contrat4_id = LAST_INSERT_ID();

-- ===================== LOYER (AAAA-MM) =====================
-- paye / paid
INSERT INTO loyer (contrat_id, period, amount, due_date, paid_date, created_at, updated_at)
VALUES (@contrat1_id, DATE_FORMAT(CURDATE(), '%Y-%m'), 650.0, DATE_FORMAT(CURDATE(), '%Y-%m-05'), DATE_FORMAT(CURDATE(), '%Y-%m-03'), NOW(), NOW());

-- en retard : echeance passee, jamais payee / overdue: due date passed, never paid
INSERT INTO loyer (contrat_id, period, amount, due_date, paid_date, created_at, updated_at)
VALUES (@contrat2_id, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 890.0, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-05'), NULL, NOW(), NOW());

-- en attente : echeance a venir / upcoming, not due yet
INSERT INTO loyer (contrat_id, period, amount, due_date, paid_date, created_at, updated_at)
VALUES (@contrat3_id, DATE_FORMAT(CURDATE(), '%Y-%m'), 480.0, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '%Y-%m-%d'), NULL, NOW(), NOW());

-- ===================== QUITTANCE (AAAA-MM, unique par contrat+periode) =====================
INSERT INTO quittance (period, amount, issue_date, contrat_id, created_at, updated_at)
VALUES (DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 650.0, DATE_SUB(CURDATE(), INTERVAL 1 MONTH), @contrat1_id, NOW(), NOW());

INSERT INTO quittance (period, amount, issue_date, contrat_id, created_at, updated_at)
VALUES (DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m'), 890.0, DATE_SUB(CURDATE(), INTERVAL 2 MONTH), @contrat2_id, NOW(), NOW());

INSERT INTO quittance (period, amount, issue_date, contrat_id, created_at, updated_at)
VALUES (DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 480.0, DATE_SUB(CURDATE(), INTERVAL 1 MONTH), @contrat3_id, NOW(), NOW());

-- ===================== SIGNALEMENT =====================
INSERT INTO signalement (description, category, title, priority, status, creation_date, locataire_id, logement_id, created_at, updated_at)
VALUES ('Fuite d\'eau sous l\'evier de la cuisine.', 'PLOMBERIE', 'Fuite evier cuisine', 'HAUTE', 'NOUVEAU', CURDATE(), @locataire1_id, @logement1_id, NOW(), NOW());

INSERT INTO signalement (description, category, title, response, priority, status, creation_date, locataire_id, logement_id, created_at, updated_at)
VALUES ('Chauffage qui ne demarre plus depuis hier soir.', 'CHAUFFAGE', 'Panne de chauffage', 'Un technicien passe demain matin.', 'URGENTE', 'EN_COURS', DATE_SUB(CURDATE(), INTERVAL 2 DAY), @locataire2_id, @logement2_id, NOW(), NOW());

INSERT INTO signalement (description, category, title, response, priority, status, creation_date, locataire_id, logement_id, created_at, updated_at)
VALUES ('Ampoule du palier a remplacer.', 'ELECTRICITE', 'Ampoule palier', 'Remplacee le jour meme.', 'BASSE', 'TERMINE', DATE_SUB(CURDATE(), INTERVAL 10 DAY), @locataire3_id, @logement3_id, NOW(), NOW());

-- ===================== NOTIFICATION =====================
INSERT INTO notification (recipient_role, recipient_id, type, title, message, seen, ref_type, ref_id, created_at, updated_at)
VALUES ('BAILLEUR', @bailleur1_id, 'ALERT', 'Loyer en retard', 'Le loyer de Lucas Petit est en retard.', 0, 'LOYER', @contrat2_id, NOW(), NOW());

INSERT INTO notification (recipient_role, recipient_id, type, title, message, seen, ref_type, ref_id, created_at, updated_at)
VALUES ('LOCATAIRE', @locataire1_id, 'SUCCESS', 'Quittance disponible', 'Votre quittance du mois dernier est disponible.', 1, 'QUITTANCE', @contrat1_id, NOW(), NOW());

INSERT INTO notification (recipient_role, recipient_id, type, title, message, seen, ref_type, ref_id, created_at, updated_at)
VALUES ('ADMIN', @admin1_id, 'WARNING', 'Abonnement suspendu', 'Le compte de Marc Bernard a ete suspendu.', 0, 'BAILLEUR', @bailleur3_id, NOW(), NOW());

-- ===================== PLAN_ABONNEMENT (+ features) =====================
INSERT INTO plan_abonnement (name, price, period_months, max_logements, highlighted, suspended, created_at, updated_at)
VALUES ('Basique', 9.99, 1, 5, 0, 0, NOW(), NOW());
SET @plan1_id = LAST_INSERT_ID();
INSERT INTO plan_abonnement_feature (plan_id, position, feature) VALUES (@plan1_id, 0, 'Jusqu a 5 logements');
INSERT INTO plan_abonnement_feature (plan_id, position, feature) VALUES (@plan1_id, 1, 'Support par email');

INSERT INTO plan_abonnement (name, price, period_months, max_logements, highlighted, suspended, created_at, updated_at)
VALUES ('Standard', 24.99, 1, 25, 1, 0, NOW(), NOW());
SET @plan2_id = LAST_INSERT_ID();
INSERT INTO plan_abonnement_feature (plan_id, position, feature) VALUES (@plan2_id, 0, 'Jusqu a 25 logements');
INSERT INTO plan_abonnement_feature (plan_id, position, feature) VALUES (@plan2_id, 1, 'Support prioritaire');

INSERT INTO plan_abonnement (name, price, period_months, max_logements, highlighted, suspended, created_at, updated_at)
VALUES ('Premium', 49.99, 12, NULL, 0, 0, NOW(), NOW());
SET @plan3_id = LAST_INSERT_ID();
INSERT INTO plan_abonnement_feature (plan_id, position, feature) VALUES (@plan3_id, 0, 'Logements illimites');
INSERT INTO plan_abonnement_feature (plan_id, position, feature) VALUES (@plan3_id, 1, 'Support dedie 24/7');

-- ===================== ABONNEMENT =====================
INSERT INTO abonnement (bailleur_id, plan_id, status, start_date, next_billing_date, created_at, updated_at)
VALUES (@bailleur1_id, @plan2_id, 'ACTIF', DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_ADD(CURDATE(), INTERVAL 15 DAY), NOW(), NOW());
SET @abonnement1_id = LAST_INSERT_ID();

INSERT INTO abonnement (bailleur_id, plan_id, status, start_date, next_billing_date, created_at, updated_at)
VALUES (@bailleur2_id, @plan1_id, 'ACTIF', DATE_SUB(CURDATE(), INTERVAL 2 MONTH), DATE_ADD(CURDATE(), INTERVAL 20 DAY), NOW(), NOW());
SET @abonnement2_id = LAST_INSERT_ID();

INSERT INTO abonnement (bailleur_id, plan_id, status, start_date, next_billing_date, ended_on, created_at, updated_at)
VALUES (@bailleur3_id, @plan3_id, 'SUSPENDU', DATE_SUB(CURDATE(), INTERVAL 8 MONTH), DATE_ADD(CURDATE(), INTERVAL 10 DAY), CURDATE(), NOW(), NOW());
SET @abonnement3_id = LAST_INSERT_ID();

-- ===================== FACTURE =====================
INSERT INTO facture (reference, abonnement_id, bailleur_id, plan_name, period, amount, status, issued_on, paid_on, created_at, updated_at)
VALUES ('FACT-0001', @abonnement1_id, @bailleur1_id, 'Standard', DATE_FORMAT(CURDATE(), '%Y-%m'), 24.99, 'PAYEE', CURDATE(), CURDATE(), NOW(), NOW());

INSERT INTO facture (reference, abonnement_id, bailleur_id, plan_name, period, amount, status, issued_on, paid_on, created_at, updated_at)
VALUES ('FACT-0002', @abonnement2_id, @bailleur2_id, 'Basique', DATE_FORMAT(CURDATE(), '%Y-%m'), 9.99, 'EN_ATTENTE', CURDATE(), NULL, NOW(), NOW());

INSERT INTO facture (reference, abonnement_id, bailleur_id, plan_name, period, amount, status, issued_on, paid_on, created_at, updated_at)
VALUES ('FACT-0003', @abonnement3_id, @bailleur3_id, 'Premium', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 49.99, 'ECHEC', DATE_SUB(CURDATE(), INTERVAL 1 MONTH), NULL, NOW(), NOW());

-- ===================== PARAMETRE_PLATEFORME (ligne unique id=1) =====================
INSERT INTO parametre_plateforme (id, platform_name, support_email, currency, timezone, maintenance_mode, email_notifications, open_registration, max_logements_basic, max_logements_premium, max_upload_size_mb, session_duration_minutes, created_at, updated_at)
VALUES (1, 'Gestion Immobilière', 'support@gestion-immo.com', 'XAF', 'Europe/Paris', 0, 1, 1, 5, 25, 10, 60, NOW(), NOW())
ON DUPLICATE KEY UPDATE platform_name = platform_name;

-- ===================== JOURNAL_AUDIT =====================
INSERT INTO journal_audit (actor_role, actor_id, actor_name, type, action, details, target_type, target_id, ip, created_at, updated_at)
VALUES ('ADMIN', @admin1_id, 'Super Admin', 'CREATE', 'BAILLEUR_CREE', 'Creation du bailleur Marc Bernard', 'BAILLEUR', @bailleur3_id, '127.0.0.1', NOW(), NOW());

INSERT INTO journal_audit (actor_role, actor_id, actor_name, type, action, details, target_type, target_id, ip, created_at, updated_at)
VALUES ('ADMIN', @admin1_id, 'Super Admin', 'UPDATE', 'COMPTE_SUSPENDU', 'Suspension du bailleur Marc Bernard', 'BAILLEUR', @bailleur3_id, '127.0.0.1', NOW(), NOW());

INSERT INTO journal_audit (actor_role, actor_id, actor_name, type, action, details, target_type, target_id, ip, created_at, updated_at)
VALUES ('BAILLEUR', @bailleur1_id, 'Paul Kamga', 'LOGIN', 'LOGIN_REUSSI', 'Connexion reussie', NULL, NULL, '127.0.0.1', NOW(), NOW());

-- Non seede volontairement / intentionally not seeded : document_pdf (besoin d'un vrai contenu PDF + sha256),
-- refresh_token / reset_token / tentative_connexion (generes naturellement par l'usage de l'app).
