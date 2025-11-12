import {
  Component,
  TemplateRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ModalService } from '../../shared/modal/modal.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user/user.model';
import { SwalService } from '../../services/swal/swal.service';
import { ApiResponse } from '../../models/api/api.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent
  ],
  templateUrl: './user.component.html',
})
export class UserComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private userSvc = inject(UserService);
  private swal = inject(SwalService);

  @ViewChild('userModal') userModalTpl!: TemplateRef<any>;

  users = signal<User[]>([]);
  loading = signal<boolean>(true);
  formLoading = signal<boolean>(false);
  editingUser = signal<User | null>(null);
  form!: FormGroup;

  // id del usuario autenticado
  currentUserId = signal<number | null>(this.getCurrentUserId());

  ngOnInit(): void {
    this.loadUsers();
  }

  // toma desde el localStorage el id del usuario logeado
  private getCurrentUserId(): number | null {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return typeof u?.id === 'number' ? u.id : Number(u?.id) || null;
    } catch {
      return null;
    }
  }

  // carga todos los usuarios
  private loadUsers(): void {
    this.loading.set(true);
    this.userSvc.listUser().subscribe({
      next: (res: ApiResponse<User[]>) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.swal.showError('No fue posible cargar los usuarios');
        this.loading.set(false);
      },
    });
  }

  // abre el modal para crear
  openCreate(): void {
    this.editingUser.set(null);
    this.buildForm();
    this.modal.open(this.userModalTpl, 'md');
  }

  // abre el modal para editar
  openEdit(user: User): void {
    this.editingUser.set(user);
    this.buildForm(user);
    this.modal.open(this.userModalTpl, 'md');
  }

  // cierra el modal
  closeModal(): void {
    this.modal.close();
  }

  // construye el formulario
  private buildForm(user?: User): void {
    this.form = this.fb.group({
      name: [user?.name ?? '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      password: ['', user ? [] : [Validators.required, Validators.minLength(6)],],
    });
  }

  // guarda el usuario
  saveUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.swal.showWarning('Por favor completa todos los campos requeridos.');
      return;
    }

    this.formLoading.set(true);
    const payload = this.form.value;

    if (this.editingUser()) {
      this.userSvc.editUser(this.editingUser()!.id, payload).subscribe({
        next: () => {
          this.swal
            .showSuccessPromise('Usuario actualizado correctamente')
            .then(() => {
              this.modal.close();
              this.loadUsers();
            });
        },
        error: (err) => {
          const msg =
            err?.error?.message || 'No fue posible actualizar el usuario';
          this.swal.showError(msg);
        },
        complete: () => this.formLoading.set(false),
      });
    } else {
      this.userSvc.createUser(payload).subscribe({
        next: () => {
          this.swal
            .showSuccessPromise('Usuario creado exitosamente')
            .then(() => {
              this.modal.close();
              this.loadUsers();
            });
        },
        error: (err) => {
          const msg = err?.error?.message || 'No fue posible crear el usuario';
          this.swal.showError(msg);
        },
        complete: () => this.formLoading.set(false),
      });
    }
  }

  // elimina un usuario
  deleteUser(id: number): void {
    // bloquea si intento eliminar mi mismo usuario
    if (
      this.currentUserId() != null &&
      Number(id) === Number(this.currentUserId())
    ) {
      this.swal.showError(
        'No puedes eliminar tu propio usuario mientras estás logueado.'
      );
      return;
    }

    this.swal.showDeleteConfirmation().then((result) => {
      if (result.isConfirmed) {
        this.swal.showLoading();
        this.userSvc.deleteUser(id).subscribe({
          next: () => {
            this.swal
              .showSuccessPromise('Usuario eliminado correctamente')
              .then(() => {
                this.loadUsers();
              });
          },
          error: (err) => {
            const msg =
              err?.error?.message || 'No fue posible eliminar el usuario.';
            this.swal.showError(msg);
          },
        });
      }
    });
  }

  trackById = (_: number, item: User) => item.id;
}
