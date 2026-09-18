import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page">
      <div class="header">
        <div class="header-inner">
          <span class="logo-text">Gestion Immobilière</span>
        </div>
      </div>
      <div class="body">
        <div class="card">
          <div class="error-code">403</div>
          <h1 class="title">Accès non autorisé</h1>
          <p class="message">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <div class="actions">
            <a routerLink="/auth/login" class="btn-primary">Retour à la connexion</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .header {
      background: #000000;
      height: 64px;
      display: flex;
      align-items: center;
    }
    .header-inner {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 0 24px;
    }
    .logo-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 420px;
      padding: 48px 40px;
      text-align: center;
    }
    .error-code {
      font-size: 72px;
      font-weight: 800;
      color: #000000;
      line-height: 1;
      margin-bottom: 16px;
    }
    .title {
      margin: 0 0 12px;
      font-size: 22px;
      font-weight: 700;
      color: #000000;
    }
    .message {
      margin: 0 0 32px;
      font-size: 14px;
      color: #666666;
      line-height: 1.6;
    }
    .actions {
      display: flex;
      justify-content: center;
    }
    .btn-primary {
      display: inline-block;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      background: #000000;
      border: none;
      border-radius: 0;
      cursor: pointer;
      text-decoration: none;
      font-family: inherit;
      transition: background 0.15s;
    }
    .btn-primary:hover {
      background: #222222;
    }
  `]
})
export class UnauthorizedComponent {}
