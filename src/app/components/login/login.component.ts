import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { SwalService } from '../../services/swal/swal.service';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private alert = inject(SwalService);

  loading = signal(false);
  activeButton = signal(false);
  apiError = signal<string | null>(null);
  showPassword = signal(false);
  remember = signal(true);
  year = new Date().getFullYear();

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // se precarga el email recordado (si existe)
  constructor() {
    const remembered = localStorage.getItem('remember_email');
    if (remembered) {
      this.loginForm.patchValue({ email: remembered });
      this.remember.set(true);
    }
  }

  invalid = (controlName: string) => {
    const c = this.loginForm.get(controlName);
    return !!c && c.invalid && (c.dirty || c.touched);
  };

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  // envio de login
  onSubmit() {
    this.apiError.set(null);

    if (this.loginForm.invalid || this.loading() || this.activeButton()) return;

    this.loading.set(true);
    this.activeButton.set(true);

    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', JSON.stringify(res.token));
        localStorage.setItem('user', JSON.stringify(res.user));
        if (this.remember()) {
          localStorage.setItem('remember_email', email);
        } else {
          localStorage.removeItem('remember_email');
        }
        this.loading.set(false);
        this.activeButton.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        const msg =
          err?.error?.error ||
          err?.error?.message ||
          'No se pudo iniciar sesión.';
        this.apiError.set(msg);
        this.alert.showError(msg);
        this.loading.set(false);
        this.activeButton.set(false);
      },
    });
  }
}
