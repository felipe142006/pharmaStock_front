import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeaderService } from '../../shared/header/header.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private header: HeaderService) {}

  /**
   * ejecuta endpoint de login
   * @param credentials
   * @returns
   * @method post
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  /**
   * ejecuta endpoint de cerrar sesion
   * @returns
   * @method post
   */
  logout(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/logout`,
      {},
      this.header.getHttpOptions()
    );
  }
}
