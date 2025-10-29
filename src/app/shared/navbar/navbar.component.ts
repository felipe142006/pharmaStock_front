import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  activeButton: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    public nav: NavigationService
  ) { }

  /** 
   * cierra sesión
   */
  logout() {
    this.activeButton = true
    this.authService.logout().subscribe(
      (response) => {
        this.activeButton = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      },
      (error) => {
        this.activeButton = true
        console.error(error);
      }
    );
  }
}
