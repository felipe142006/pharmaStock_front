import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { HeaderService } from "../../shared/header/header.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private header: HeaderService,
    ) { }

    listUser(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/user/listUser`, this.header.getHttpOptions());
    }

    createUser(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/user/createUser`, data, this.header.getHttpOptions());
    }

    editUser(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/user/editUser/` + id, data, this.header.getHttpOptions());
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/user/deleteUser/` + id, this.header.getHttpOptions());
    }
}