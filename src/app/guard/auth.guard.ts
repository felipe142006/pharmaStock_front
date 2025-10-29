import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot,CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate{
    constructor(private router: Router){}

    /**
     * guardian para proteger rutas, en caso de no tener token (no estar autenticado), redirige al login
     * @param route 
     * @param state 
     * @returns 
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
        if(localStorage.getItem('token')){
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}