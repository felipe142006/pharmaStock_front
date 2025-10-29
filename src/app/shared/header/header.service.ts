import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class HeaderService {
    getHttpOptions() {
        const accessToken = localStorage.getItem('token')?.replace(/['"]+/g, '');

        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            }),
        };
    }

    constructor() { }
}