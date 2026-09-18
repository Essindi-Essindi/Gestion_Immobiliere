import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, UserRole } from '@core/auth/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  roles?: UserRole[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Input() navItems: NavItem[] = [];
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  currentUser = this.authService.user;

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  closeMobile(): void {
    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }

  onNavClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      this.closeMobile();
    }
  }

  getRoleLabel(role?: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'PROPRIETAIRE': return 'Propriétaire';
      case 'LOCATAIRE': return 'Locataire';
      default: return '';
    }
  }
}
