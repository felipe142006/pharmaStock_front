// src/app/services/product/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryAlert, Product } from '../../models/products/product.model';
import { ApiResponse } from '../../models/api/api.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    // obtiene todos los products creados
    listProduct(): Observable<ApiResponse<Product[]>> {
        return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/getProducts`);
    }

    // crea un nuevo producto
    createProduct(data: Product): Observable<ApiResponse<Product>> {
        return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products/createProducts`, data);
    }

    // edita un producto
    editProduct(data: Product, id: number): Observable<ApiResponse<Product>> {
        return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/updateProducts/${id}`, data);
    }

    // elimina un producto
    deleteProduct(id: number): Observable<ApiResponse<{ message: string }>> {
        return this.http.delete<ApiResponse<{ message: string }>>(
        `${this.apiUrl}/products/deleteProducts/${id}`
        );
    }

    // obtiene las alertas de los productos
    alertsProduct(): Observable<InventoryAlert> {
        return this.http.get<InventoryAlert>(`${this.apiUrl}/products/alertsProducts`);
    }

    // obtiene la info especifica de un producto por id
    getProductById(id: number): Observable<ApiResponse<Product>> {
        return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/getProducts/${id}`);
    }
}
