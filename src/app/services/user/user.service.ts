import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user/user.model';
import { ApiResponse } from '../../models/api/api.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    // lista todos los usuario registrados
    listUser(): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/user/listUser`);
    }

    // crea un nuevo usuario
    createUser(data: Partial<User>): Observable<ApiResponse<User>> {
        return this.http.post<ApiResponse<User>>(`${this.apiUrl}/user/createUser`, data);
    }

    // edita un usuario ya creado
    editUser(id: number, data: Partial<User>): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.apiUrl}/user/editUser/${id}`, data);
    }

    // elimina un usuario
    deleteUser(id: number): Observable<ApiResponse<{ message: string }>> {
        return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/user/deleteUser/${id}`);
    }
}
