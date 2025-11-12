import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale } from '../../models/sale/sale.model';
import { ApiResponse } from '../../models/api/api.model';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    // obtiene todas las ventas registradas
    listSale(): Observable<ApiResponse<Sale[]>> {
        return this.http.get<ApiResponse<Sale[]>>(`${this.apiUrl}/sales/getSales`);
    }

    // obtiene la informacion de una venta especifica por id
    getSaleById(id: number): Observable<ApiResponse<Sale>> {
        return this.http.get<ApiResponse<Sale>>(`${this.apiUrl}/sales/getSales/${id}`);
    }

    // crea una nueva venta
    createSale(data: Partial<Sale>): Observable<ApiResponse<Sale>> {
        return this.http.post<ApiResponse<Sale>>(`${this.apiUrl}/sales/createSales`, data);
    }

    // edita una venta existente
    editSale(data: Partial<Sale>, id: number): Observable<ApiResponse<Sale>> {
        return this.http.put<ApiResponse<Sale>>(`${this.apiUrl}/sales/updateSales/${id}`, data);
    }

    // imprime una venta
    printSale(id: number): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/sales/getSales/${id}/print`);
    }
}
