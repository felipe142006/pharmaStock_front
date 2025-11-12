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
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../models/products/product.model';
import { SwalService } from '../../services/swal/swal.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private swal = inject(SwalService);
  private productSvc = inject(ProductService);

  @ViewChild('productModal') productModalTpl!: TemplateRef<any>;

  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  formLoading = signal<boolean>(false);
  editingProduct = signal<Product | null>(null);
  form!: FormGroup;
  todayStr = new Date().toISOString().split('T')[0]; // "2025-11-12"

  ngOnInit(): void {
    this.loadProducts();
  }

  // carga todos los productos creados
  private loadProducts(): void {
    this.loading.set(true);
    this.productSvc.listProduct().subscribe({
      next: (res: any) => {
        this.products.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.swal.showError('No fue posible cargar los productos');
        this.loading.set(false);
      },
    });
  }

  // abre el modal para crear
  openCreate(): void {
    this.editingProduct.set(null);
    this.buildForm();
    this.modal.open(this.productModalTpl, 'lg');
  }

  // abre el modal para editar
  openEdit(p: Product): void {
    this.editingProduct.set(p);
    this.buildForm(p);
    this.modal.open(this.productModalTpl, 'lg');
  }

  // cierra el modal
  closeModal(): void {
    this.modal.close();
  }

  // construye el formulario
  private buildForm(p?: Product): void {
    this.form = this.fb.group({
      sku: [p?.sku ?? '', [Validators.required, Validators.maxLength(100)]],
      name: [p?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      description: [p?.description ?? '', []],
      price: [p?.price ?? null, [Validators.required, Validators.min(0)]],
      cost: [p?.cost ?? null, [Validators.required, Validators.min(0)]],
      stock: [p?.stock ?? 0, [Validators.required, Validators.min(0)]],
      min_stock: [p?.min_stock ?? 0, [Validators.required, Validators.min(0)]],
      expires_at: [p?.expires_at ? p.expires_at.toString().substring(0, 10) : null,], // yyyy-mm-dd
      is_active: [p?.is_active ?? true],
    });
  }

  saveProduct(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.swal.showWarning('Por favor completa los campos obligatorios.');
      return;
    }
    const payload = this.form.value;

    this.formLoading.set(true);
    this.swal.showLoading();

    if (this.editingProduct()) {
      const id = this.editingProduct()!.id;
      this.productSvc.editProduct(payload as any, id).subscribe({
        next: () => {
          this.swal
            .showSuccessPromise('Producto actualizado correctamente')
            .then(() => {
              this.modal.close();
              this.loadProducts();
            });
        },
        error: (err) => {
          const msg =
            err?.error?.message || 'No fue posible actualizar el producto';
          this.swal.showError(msg);
        },
        complete: () => this.formLoading.set(false),
      });
    } else {
      this.productSvc.createProduct(payload as any).subscribe({
        next: () => {
          this.swal
            .showSuccessPromise('Producto creado exitosamente')
            .then(() => {
              this.modal.close();
              this.loadProducts();
            });
        },
        error: (err) => {
          const msg = err?.error?.message || 'No fue posible crear el producto';
          this.swal.showError(msg);
        },
        complete: () => this.formLoading.set(false),
      });
    }
  }

  // elimina producto
  deleteProduct(id: number): void {
    this.swal.showDeleteConfirmation().then((r) => {
      if (r.isConfirmed) {
        this.swal.showLoading();
        this.productSvc.deleteProduct(id).subscribe({
          next: () => {
            this.swal
              .showSuccessPromise('Producto eliminado correctamente')
              .then(() => this.loadProducts());
          },
          error: (err) => {
            const msg =
              err?.error?.message || 'No fue posible eliminar el producto';
            this.swal.showError(msg);
          },
        });
      }
    });
  }

  badgeActive(p: Product): string {
    return p.is_active
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-gray-100 text-gray-700';
  }
  
  badgeStock(p: Product): string {
    if (p.stock <= (p.min_stock ?? 0)) return 'bg-rose-100 text-rose-700';
    return 'bg-sky-100 text-sky-700';
  }

  trackById = (_: number, item: Product) => item.id ?? item.sku;
}
