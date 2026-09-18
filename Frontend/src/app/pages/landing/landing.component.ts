import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule],
  template: `
    <!-- Navigation Bar -->
    <nav class="nav-bar">
      <div class="nav-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Gestion Immobilière</span>
      </div>

      <div class="nav-links">
        <a href="#features" class="nav-link">Fonctionnalités</a>
        <a href="#how-it-works" class="nav-link">Comment ça marche</a>
        <a routerLink="/auth/bailleur/login" class="nav-btn-outline">Espace Bailleur</a>
        <a routerLink="/auth/locataire/login" class="nav-btn-filled">Espace Locataire</a>
        <a routerLink="/auth/super-admin/login" class="nav-btn-white">Admin</a>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <h1 class="hero-title">Gérez vos biens immobiliers simplement</h1>
      <p class="hero-subtitle">
        La plateforme complète pour bailleurs, locataires et administrateurs.
        Suivez vos loyers, contrats, interventions et bien plus.
      </p>
      <div class="hero-buttons">
        <a routerLink="/auth/bailleur/register" class="btn-primary">Commencer gratuitement</a>
        <a routerLink="/auth/bailleur/login" class="btn-outline">Se connecter</a>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <h2 class="section-title">Fonctionnalités</h2>
      <p class="section-subtitle">Une solution complète adaptée à chaque profil d'utilisateur</p>

      <div class="features-grid">
        <!-- Bailleurs -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#fff" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <rect x="1" y="6" width="22" height="16" rx="0" ry="0"/>
              <line x1="1" y1="14" x2="23" y2="14"/>
              <line x1="8" y1="6" x2="8" y2="22"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </div>
          <h3>Pour les Bailleurs</h3>
          <p>
            Gérez vos propriétés, locataires et contrats de bail en un seul endroit.
            Suivez les paiements de loyers, gérez les quittances et visualisez
            les statistiques de vos revenus locatifs.
          </p>
        </div>

        <!-- Locataires -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#fff" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3>Pour les Locataires</h3>
          <p>
            Consultez l'historique de vos paiements, téléchargez vos quittances
            et signalez des problèmes techniques directement depuis votre espace.
            Restez informé de l'état de vos interventions.
          </p>
        </div>

        <!-- Administrateurs -->
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#fff" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3>Pour les Administrateurs</h3>
          <p>
            Administrez l'ensemble de la plateforme. Gérez les abonnements,
            supervisez les utilisateurs, configurez les permissions et
            contrôlez le bon fonctionnement du système.
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="steps-section">
      <h2 class="section-title">Comment ça marche</h2>
      <p class="section-subtitle">Commencez en quelques étapes simples</p>

      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>Créez votre compte</h3>
          <p>Inscrivez-vous en tant que bailleur, locataire ou admin. Le processus est rapide et sécurisé.</p>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <h3>Configurez vos biens</h3>
          <p>Ajoutez vos propriétés, attribuez les locataires et paramétrez les contrats de bail.</p>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <h3>Gérez en toute simplicité</h3>
          <p>Suivez les paiements, gérez les interventions et administrez tout depuis un tableau de bord intuitif.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Gestion Immobilière</span>
        </div>

        <div class="footer-links">
          <a routerLink="/auth/bailleur/login" class="footer-link">Espace Bailleur</a>
          <a routerLink="/auth/locataire/login" class="footer-link">Espace Locataire</a>
          <a routerLink="/auth/super-admin/login" class="footer-link">Admin</a>
        </div>

        <div class="footer-copy">© 2026 Gestion Immobilière. Tous droits réservés.</div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 0 !important;
    }

    html {
      scroll-behavior: smooth;
    }

    /* ===== NAVBAR ===== */
    .nav-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background-color: #000;
      color: #fff;
      padding: 0 40px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #fff;
      cursor: pointer;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .nav-link {
      color: #ccc;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: #fff;
    }

    .nav-btn-outline {
      background-color: transparent;
      color: #fff;
      border: 1px solid #555;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .nav-btn-outline:hover {
      background-color: #222;
    }

    .nav-btn-filled {
      background-color: #333;
      color: #fff;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .nav-btn-filled:hover {
      background-color: #444;
    }

    .nav-btn-white {
      background-color: #fff;
      color: #000;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .nav-btn-white:hover {
      opacity: 0.85;
    }

    /* ===== HERO ===== */
    .hero-section {
      padding: 160px 40px 100px;
      background-color: #fff;
      color: #000;
      text-align: center;
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .hero-title {
      font-size: 56px;
      font-weight: 800;
      line-height: 1.1;
      max-width: 800px;
      margin: 0 0 24px;
      letter-spacing: -2px;
    }

    .hero-subtitle {
      font-size: 20px;
      color: #555;
      max-width: 640px;
      margin: 0 0 48px;
      line-height: 1.6;
    }

    .hero-buttons {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .btn-primary {
      background-color: #000;
      color: #fff;
      border: none;
      padding: 16px 36px;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .btn-outline {
      background-color: #fff;
      color: #000;
      border: 2px solid #000;
      padding: 16px 36px;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }

    .btn-outline:hover {
      background-color: #000;
      color: #fff;
    }

    /* ===== FEATURES ===== */
    .features-section {
      padding: 100px 40px;
      background-color: #f5f5f5;
    }

    .section-title {
      text-align: center;
      font-size: 40px;
      font-weight: 800;
      margin: 0 0 16px;
      letter-spacing: -1.5px;
    }

    .section-subtitle {
      text-align: center;
      font-size: 18px;
      color: #666;
      margin: 0 0 64px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      background-color: #fff;
      padding: 48px 36px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e5e5;
    }

    .feature-icon {
      width: 56px;
      height: 56px;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 28px;
    }

    .feature-card h3 {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px;
      letter-spacing: -0.5px;
    }

    .feature-card p {
      font-size: 15px;
      color: #555;
      line-height: 1.7;
      margin: 0;
    }

    /* ===== STEPS ===== */
    .steps-section {
      padding: 100px 40px;
      background-color: #fff;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 48px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .step-card {
      text-align: center;
    }

    .step-number {
      width: 64px;
      height: 64px;
      background-color: #000;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      margin: 0 auto 28px;
    }

    .step-card h3 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 12px;
      letter-spacing: -0.5px;
    }

    .step-card p {
      font-size: 15px;
      color: #666;
      line-height: 1.6;
      margin: 0;
      max-width: 280px;
      margin-left: auto;
      margin-right: auto;
    }

    /* ===== FOOTER ===== */
    .footer {
      background-color: #000;
      color: #fff;
      padding: 48px 40px;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      flex-wrap: wrap;
      gap: 24px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .footer-links {
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .footer-link {
      color: #999;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .footer-link:hover {
      color: #fff;
    }

    .footer-copy {
      color: #555;
      font-size: 13px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 900px) {
      .nav-links a:nth-child(1),
      .nav-links a:nth-child(2) {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .nav-bar {
        padding: 0 20px;
      }

      .features-section,
      .steps-section {
        padding-left: 20px;
        padding-right: 20px;
      }

      .hero-section {
        padding: 120px 20px 60px;
      }

      .hero-title {
        font-size: 36px;
        letter-spacing: -1px;
      }

      .hero-subtitle {
        font-size: 16px;
      }

      .hero-buttons {
        flex-direction: column;
        width: 100%;
      }

      .btn-primary,
      .btn-outline {
        width: 100%;
        text-align: center;
      }

      .features-grid,
      .steps-grid {
        grid-template-columns: 1fr;
      }

      .footer-inner {
        flex-direction: column;
        text-align: center;
      }

      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class LandingComponent {}
