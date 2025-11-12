import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../services/product/product.service';
import { CustomerService } from '../../services/customer/customer.service';
import { SaleService } from '../../services/sale/sale.service';
import { Product, InventoryAlert } from '../../models/products/product.model';
import { Customer } from '../../models/customer/customer.model';
import { Sale } from '../../models/sale/sale.model';
import { ApiResponse } from '../../models/api/api.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private router = inject(Router);
  private productSvc = inject(ProductService);
  private customerSvc = inject(CustomerService);
  private saleSvc = inject(SaleService);

  loading = signal<boolean>(true);
  apiError = signal<string | null>(null);

  products = signal<Product[]>([]);
  alerts = signal<InventoryAlert | null>(null);
  customers = signal<Customer[]>([]);
  sales = signal<Sale[]>([]);

  todayStr = signal<string>(new Date().toLocaleString());
  displayName = signal<string | null>(this.getDisplayName());

  salesToday = computed<number>(() => {
    const list = this.sales();
    if (!Array.isArray(list) || list.length === 0) return 0;
    const today = new Date();
    return list
      .filter((s) => this.isSameDay(new Date(s.issued_at), today))
      .reduce((acc, s) => acc + Number(s.total ?? 0), 0);
  });

  totalCustomers = computed<number>(() => this.customers().length);
  totalProducts = computed<number>(() => this.products().length);

  activePct = computed<number>(() => {
    const ps = this.products();
    if (!ps.length) return 0;
    const active = ps.filter((p) => p.is_active).length;
    return Math.round((active / ps.length) * 100);
  });

  lowStockList = computed<Product[]>(() => this.alerts()?.low_stock ?? []);
  expiredList = computed<Product[]>(() => this.alerts()?.expired ?? []);
  nearExpireList = computed<Product[]>(() => this.alerts()?.near_expire ?? []);

  recentSales = computed(() =>
    (this.sales() || []).slice(0, 8).map((s) => ({
      id: s.id,
      invoice_number: s.invoice_number,
      customer: s.customer?.name ?? '—',
      date: new Date(s.issued_at).toLocaleString(),
      total: Number(s.total ?? 0),
      status: s.status,
    }))
  );

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.apiError.set(null);

    forkJoin({
      products: this.productSvc.listProduct(),
      alerts: this.productSvc.alertsProduct(),
      customers: this.customerSvc.listCustomer(),
      sales: this.saleSvc.listSale(),
    }).subscribe({
      next: ({
        products,
        alerts,
        customers,
        sales,
      }: {
        products: ApiResponse<Product[]>;
        alerts: InventoryAlert;
        customers: ApiResponse<Customer[]>;
        sales: ApiResponse<Sale[]>;
      }) => {
        this.products.set(products.data);
        this.alerts.set(alerts);
        this.customers.set(customers.data);
        this.sales.set(sales.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.apiError.set(
          err?.error?.message || 'Error cargando el dashboard.'
        );
        this.loading.set(false);
      },
    });
  }

  private getDisplayName(): string | null {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return user?.name || user?.email || null;
    } catch {
      return null;
    }
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  badgeClass(status: 'paid' | 'pending' | 'void'): string {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'void':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // rutas
  goToProducts() {
    this.router.navigate(['/product']);
  }
  goToCustomers() {
    this.router.navigate(['/clients']);
  }
  goToSales() {
    this.router.navigate(['/sales']);
  }

  trackById(_: number, item: { id: number }) {
    return item.id;
  }
  trackBySku(_: number, item: Product) {
    return item.sku ?? item.id;
  }
}
