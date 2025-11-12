// src/app/services/product/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer } from '../../models/customer/customer.model';
import { ApiResponse } from '../../models/api/api.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    // obtiene todos los clientes registrados
    listCustomer(): Observable<ApiResponse<Customer[]>> {
        return this.http.get<ApiResponse<Customer[]>>(`${this.apiUrl}/customers/getCustomers`);
    }

    // obtiene la info especifica de un cliente por id
    getCustomerById(id: number): Observable<ApiResponse<Customer>> {
        return this.http.get<ApiResponse<Customer>>(`${this.apiUrl}/customers/getCustomers/${id}`);
    }

    // registra un nuevo cliente
    createCustomer(data: Customer): Observable<ApiResponse<Customer>> {
        return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/customers/createCustomers`, data);
    }

    // edita un cliente
    editCustomer(data: Customer, id: number): Observable<ApiResponse<Customer>> {
        return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/customers/updateCustomers/${id}`, data);
    }

    // elimina un cliente
    deleteCustomer(id: number): Observable<ApiResponse<{ message: string }>> {
        return this.http.delete<ApiResponse<{ message: string }>>(
        `${this.apiUrl}/customers/deleteCustomers/${id}`
        );
    }
}
