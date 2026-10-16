import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthAsideComponent } from '@shared/components/auth-aside/auth-aside.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, AuthAsideComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent {}
