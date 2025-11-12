import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  /**
   * redirige al home de la pagina
   */
  goToInicio() {
    this.router.navigate(['/home']);
  }

  /**
   * redirige a los productos de la pagina
   */
  goToProduct() {
    this.router.navigate(['/product']);
  }

  /**
   * redirige a los clientes de la pagina
   */
  goToClients() {
    this.router.navigate(['/clients']);
  }

  /**
   * redirige a los clientes de la pagina
   */
  goToSale() {
    this.router.navigate(['/sales']);
  }

  /**
   * redirige a los usuarios de la pagina
   */
  goToUser() {
    this.router.navigate(['/users']);
  }
}