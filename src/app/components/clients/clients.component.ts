import { CommonModule } from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ModalService } from '../../shared/modal/modal.service';
import { SwalService } from '../../services/swal/swal.service';
import { CustomerService } from '../../services/customer/customer.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private swal = inject(SwalService);
  private customerSvc = inject(CustomerService);

  @ViewChild('clientModal') clientModalTpl!: TemplateRef<any>;

  clients = signal<any[]>([]);
  loading = signal<boolean>(true);
  formLoading = signal<boolean>(false);
  editing = signal<boolean>(false);
  currentId: number | null = null;

  form!: FormGroup;

  ngOnInit(): void {
    this.loadClients();
  }

  // cargar clientes
  private loadClients(): void {
    this.loading.set(true);
    this.customerSvc.listCustomer().subscribe({
      next: (res: any) => {
        this.clients.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.swal.showError('No fue posible cargar los clientes');
        this.loading.set(false);
      },
    });
  }

  // abrir modal crear
  openCreate(): void {
    this.editing.set(false);
    this.currentId = null;
    this.buildForm();
    this.modal.open(this.clientModalTpl, 'lg');
  }

  // abrir modal editar
  openEdit(c: any): void {
    this.editing.set(true);
    this.currentId = c.id;
    this.buildForm(c);
    this.modal.open(this.clientModalTpl, 'lg');
  }

  // cerrar modal
  closeModal(): void {
    this.modal.close();
  }

  // formulario reactivo
  private buildForm(c?: any): void {
    this.form = this.fb.group({
      document: [c?.document ?? '', [Validators.required]],
      name: [c?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      email: [c?.email ?? '', [Validators.email]],
      phone: [c?.phone ?? '', [Validators.required]],
      address: [c?.address ?? ''],
    });
  }

  invalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  // guardar (crear/editar)
  saveClient(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.swal.showWarning('Por favor completa los campos obligatorios.');
      return;
    }

    const payload = this.form.value;
    this.formLoading.set(true);
    if (this.editing()) {
      this.customerSvc.editCustomer(payload, this.currentId!).subscribe({
        next: () => {
          this.swal
            .showSuccessPromise('Cliente actualizado correctamente')
            .then(() => {
              this.modal.close();
              this.loadClients();
            });
          this.formLoading.set(false);
        },
        error: (err) => {
          const msg =
            err?.error?.message || 'No fue posible actualizar el cliente';
          this.swal.showError(msg);
          this.formLoading.set(false);
        },
        complete: () => this.formLoading.set(false),
      });
    } else {
      this.customerSvc.createCustomer(payload).subscribe({
        next: () => {
          this.swal
            .showSuccessPromise('Cliente creado exitosamente')
            .then(() => {
              this.formLoading.set(false);
              this.modal.close();
              this.loadClients();
            });
        },
        error: (err) => {
          this.formLoading.set(false);
          const msg = err?.error?.message || 'No fue posible crear el cliente';
          this.swal.showError(msg);
        },
        complete: () => this.formLoading.set(false),
      });
    }
  }

  // eliminar
  deleteClient(id: number): void {
    this.swal.showDeleteConfirmation().then((r) => {
      if (r.isConfirmed) {
        this.swal.showLoading();
        this.customerSvc.deleteCustomer(id).subscribe({
          next: () => {
            this.swal
              .showSuccessPromise('Cliente eliminado correctamente')
              .then(() => this.loadClients());
          },
          error: (err) => {
            const msg =
              err?.error?.message || 'No fue posible eliminar el cliente';
            this.swal.showError(msg);
          },
        });
      }
    });
  }

  trackById = (_: number, item: any) => item.id;
}
