import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { ProductsComponent } from './components/products/products.component';
import { ClientsComponent } from './components/clients/clients.component';
import { UserComponent } from './components/user/user.component';
import { SalesComponent } from './components/sales/sales.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, pathMatch: 'full' },
    { path: 'home', component: DashboardComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'product', component: ProductsComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'sales', component: SalesComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'users', component: UserComponent, canActivate: [AuthGuard], pathMatch: 'full' },
];
