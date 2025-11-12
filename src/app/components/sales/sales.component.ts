import {
  Component,
  TemplateRef,
  ViewChild,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ModalService } from '../../shared/modal/modal.service';
import { SwalService } from '../../services/swal/swal.service';
import {
  Sale,
  SaleCreatePayload,
  SaleDetail,
} from '../../models/sale/sale.model';
import { SaleService } from '../../services/sale/sale.service';
import { ProductService } from '../../services/product/product.service';
import { CustomerService } from '../../services/customer/customer.service';
import { Product } from '../../models/products/product.model';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
})
export class SalesComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalService);
  private _swal = inject(SwalService);
  private _serviceSale = inject(SaleService);
  private _productSvc = inject(ProductService);
  private _customerSvc = inject(CustomerService);

  @ViewChild('saleModal') saleModalTpl!: TemplateRef<any>;
  @ViewChild('saleDetailModal') saleDetailModal!: TemplateRef<any>;

  loading = signal<boolean>(true);
  sales = signal<Sale[]>([]);

  step = signal<1 | 2>(1);
  modalOpen = signal<boolean>(false);
  formLoading = signal<boolean>(false);

  products = signal<Product[]>([]);
  todayStr = new Date().toISOString().slice(0, 10);

  saleDetail = signal<SaleDetail | null>(null);
  detailLoading = signal(false);
  readonly TAX_PERCENT = 19;

  selectedCustomerId = signal<number | null>(null);

  step1Form!: FormGroup;
  step2Form!: FormGroup;

  ngOnInit(): void {
    this.loadSales();
  }

  //  lista todas las ventas generadas
  private loadSales(): void {
    this.loading.set(true);
    this._serviceSale.listSale().subscribe({
      next: (r) => {
        this.sales.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this._swal.showError('No fue posible cargar las ventas');
        this.loading.set(false);
      },
    });
  }

  // abre el modal para crear una venta y precarga formularios/productos
  openCreate(): void {
    this.step.set(1);
    this.selectedCustomerId.set(null);
    this.buildStep1Form();
    this.buildStep2Form();
    // precarga productos
    this._productSvc.listProduct().subscribe({
      next: (res: any) => this.products.set((res?.data ?? []) as Product[]),
      error: () => this._swal.showError('No fue posible cargar productos'),
    });
    this.modal.open(this.saleModalTpl, 'xl', true);
    this.modalOpen.set(true);
  }

  // cierra cualquier modal abierto
  closeModal(): void {
    this.modal.close();
    this.modalOpen.set(false);
  }

  // construye el formulario del paso 1
  private buildStep1Form(): void {
    this.step1Form = this.fb.group({
      mode: ['registered', Validators.required],
      search_document: [''],
      new_customer: this.fb.group({
        document: ['', []],
        name: ['', []],
        email: ['', []],
        phone: ['', []],
        address: [''],
      }),
    });
  }

  // cambia las validaciones segun el modo: registrado/nuevo/ninguno
  onModeChange(): void {
    const mode = this.step1Form.value.mode;
    const nc = this.step1Form.get('new_customer') as FormGroup;
    if (mode === 'registered') {
      this.step1Form
        .get('search_document')
        ?.setValidators([Validators.required]);
      nc.reset();
      this.clearValidators(nc);
    } else if (mode === 'new') {
      this.step1Form.get('search_document')?.clearValidators();
      this.applyNewCustomerValidators(nc);
    } else {
      this.step1Form.get('search_document')?.clearValidators();
      nc.reset();
      this.clearValidators(nc);
    }
    this.step1Form.get('search_document')?.updateValueAndValidity();
    Object.keys(nc.controls).forEach((k) =>
      nc.get(k)?.updateValueAndValidity()
    );
  }

  // aplica validaciones requeridas para crear nuevo cliente
  private applyNewCustomerValidators(nc: FormGroup) {
    nc.get('document')?.setValidators([Validators.required]);
    nc.get('name')?.setValidators([
      Validators.required,
      Validators.maxLength(255),
    ]);
    nc.get('email')?.setValidators([Validators.email]);
    nc.get('phone')?.setValidators([Validators.required]);
  }

  // limpia validaciones del grupo de nuevo cliente
  private clearValidators(nc: FormGroup) {
    Object.keys(nc.controls).forEach((k) => nc.get(k)?.clearValidators());
  }

  // busca el cliente por el documento y selecciona su id si existe
  searchCustomer(): void {
    const doc = this.step1Form.value.search_document?.trim();
    if (!doc) {
      this._swal.showWarning('Ingresa un documento para buscar.');
      return;
    }
    this._swal.showLoading();
    this._customerSvc.listCustomer().subscribe({
      next: (res: any) => {
        const found = (res?.data ?? []).find((c: any) => c.document === doc);
        if (!found) {
          this._swal.showInfo('No se encontró un cliente con ese documento.');
          this.selectedCustomerId.set(null);
        } else {
          this.selectedCustomerId.set(found.id);
          this._swal.showSuccess('Cliente encontrado y seleccionado.');
        }
      },
      error: () => this._swal.showError('No fue posible buscar el cliente'),
    });
  }

  // abre modal de detalle de una venta
  openView(saleId: number) {
    this.detailLoading.set(true);
    this.saleDetail.set(null);

    this._serviceSale.getSaleById(saleId).subscribe({
      next: (res: any) => {
        const d = (res?.data ?? res) as SaleDetail;
        this.saleDetail.set(d);
        this.detailLoading.set(false);
        this.modal.open(this.saleDetailModal, 'xl', true);
      },
      error: () => {
        this.detailLoading.set(false);
        this._swal.showError('No fue posible cargar el detalle de la venta');
      },
    });
  }

  // crea un cliente, solo si es nuevo y pasa al paso 2
  createCustomerThenContinue(): void {
    const nc = this.step1Form.get('new_customer') as FormGroup;
    if (nc.invalid) {
      this._swal.showWarning('Completa los datos del cliente.');
      nc.markAllAsTouched();
      return;
    }
    const payload = nc.value;
    this._swal.showLoading();
    this._customerSvc.createCustomer(payload).subscribe({
      next: (r: any) => {
        this.selectedCustomerId.set(r?.data?.id ?? null);
        this._swal.showSuccess('Cliente creado y seleccionado.');
        this.goToStep2();
      },
      error: (err) =>
        this._swal.showError(
          err?.error?.message || 'No se pudo crear el cliente'
        ),
    });
  }

  // valida que haya un cliente si el modo es "registered" y avanza al paso 2
  goToStep2(): void {
    const mode = this.step1Form.value.mode;
    if (mode === 'registered' && !this.selectedCustomerId()) {
      this._swal.showWarning('Selecciona un cliente válido o cambia el modo.');
      return;
    }
    this.step.set(2);
  }

  // construye el formulario del paso 2 (detalle de venta) y agrega 1 fila
  private buildStep2Form(): void {
    this.step2Form = this.fb.group({
      items: this.fb.array([]),
      discount: [0, [Validators.min(0)]],
      tax_percent: [this.TAX_PERCENT, [Validators.required]],
      issued_at: [new Date().toISOString()],
    });
    this.addItem();
  }

  // acceso tipado al FormArray de items
  get itemsFA(): FormArray<FormGroup> {
    return this.step2Form.get('items') as FormArray<FormGroup>;
  }

  // busca un producto por id
  private getProductById(id: number) {
    return this.products().find((p) => Number(p.id) === Number(id));
  }

  // devuelve el stock del producto por id
  private getProductStock(id: number): number {
    const p = this.getProductById(id);
    return Number(p?.stock ?? 0);
  }

  // retorna ids de los productos seleccionados, evitando duplicados
  private getSelectedProductIds(exceptIndex: number | null = null): number[] {
    const ids: number[] = [];
    this.itemsFA.controls.forEach((ctrl, idx) => {
      if (exceptIndex !== null && idx === exceptIndex) return;
      const v = ctrl.get('product_id')?.value;
      if (v != null && v !== '') ids.push(Number(v));
    });
    return ids;
  }

  // indica si un producto debe deshabilitarse en el select (si ya esta en uso)
  isProductDisabled(productId: number, rowIndex: number): boolean {
    return this.getSelectedProductIds(rowIndex).includes(Number(productId));
  }

  // añade una fila al detalle
  addItem(): void {
    const fg = this.fb.group({
      product_id: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount: [0, [Validators.min(0)]],
      unit_price: [{ value: 0, disabled: true }],
      line_total: [{ value: 0, disabled: true }],
      max_stock: [{ value: 0, disabled: true }],
      expired: [{ value: false, disabled: true }],
    });
    this.itemsFA.push(fg);
  }

  // elimina una fila del detalle
  removeItem(i: number): void {
    if (this.itemsFA.length === 1) return;
    this.itemsFA.removeAt(i);
  }

  // al seleccionar un producto: carga precio/stock, valida duplicado y expirado
  onSelectProduct(i: number): void {
    const row = this.itemsFA.at(i) as FormGroup;
    const pidCtrl = row.get('product_id')!;
    const qtyCtrl = row.get('quantity')!;
    const pid = Number(pidCtrl.value);

    // evita seleccionar un producto repetido en otra fila
    if (this.isProductDisabled(pid, i)) {
      this._swal.showWarning(
        'Este producto ya fue seleccionado en otra línea.'
      );
      pidCtrl.setValue(null);
      row.patchValue(
        { unit_price: 0, max_stock: 0, expired: false, line_total: 0 },
        { emitEvent: false }
      );
      return;
    }

    const p = this.getProductById(pid);
    if (!p) return;

    const expired = p.expires_at
      ? new Date(p.expires_at) < new Date(this.todayStr)
      : false;

    row.patchValue(
      {
        unit_price: Number(p.price) || 0,
        max_stock: Number(p.stock) || 0,
        expired,
      },
      { emitEvent: false }
    );

    if (expired) {
      this._swal.showWarning(
        `El producto "${p.name}" está vencido y no puede venderse.`
      );
      pidCtrl.setErrors({ expired: true });
    } else {
      pidCtrl.setErrors(null);
    }

    // ajusta cantidad al stock si excede
    const stock = Number(p.stock) || 0;
    let qty = Number(qtyCtrl.value || 1);
    if (qty > stock) {
      qty = stock > 0 ? stock : 1;
      qtyCtrl.setValue(qty);
      this._swal.showWarning(
        'Cantidad supera el stock disponible. Ajustada al máximo.'
      );
    }
    if (qty <= 0) qtyCtrl.setValue(stock > 0 ? 1 : 0);

    this.recalcLine(i);
  }

  // mientras se escribe la cantidad, limita a [0..stock]
  onQuantityInput(i: number): void {
    const row = this.itemsFA.at(i) as FormGroup;
    const pid = Number(row.get('product_id')!.value);
    const qtyCtrl = row.get('quantity')!;
    let qty = Number(qtyCtrl.value || 0);

    if (!pid) {
      if (qty < 0) qtyCtrl.setValue(0);
      this.recalcLine(i);
      return;
    }

    const stock = this.getProductStock(pid);
    if (qty < 0) qty = 0;
    if (qty > stock) qty = stock;

    if (qty !== Number(qtyCtrl.value)) {
      qtyCtrl.setValue(qty, { emitEvent: false });
    }
    this.recalcLine(i);
  }

  // al salir del input cantidad: se corrige si excede stock y alerta una vez
  onQuantityBlur(i: number): void {
    const row = this.itemsFA.at(i) as FormGroup;
    const pid = Number(row.get('product_id')!.value);
    const qtyCtrl = row.get('quantity')!;
    let qty = Number(qtyCtrl.value || 0);

    if (!pid) return;

    const stock = this.getProductStock(pid);

    if (qty > stock) {
      qtyCtrl.setValue(stock);
      this._swal.showWarning(
        'Cantidad supera el stock disponible. Ajustada al máximo.'
      );
    } else if (qty <= 0) {
      qtyCtrl.setValue(stock > 0 ? 1 : 0);
    }
    this.recalcLine(i);
  }

  // dispara el recalculo del total de linea
  onQtyOrDiscountChange(i: number): void {
    this.recalcLine(i);
  }

  // recalcula el total de la linea y marca errores de stock/expirado
  private recalcLine(i: number): void {
    const row = this.itemsFA.at(i) as FormGroup;
    const qty = Number(row.get('quantity')?.value || 0);
    const price = Number(row.get('unit_price')?.value || 0);
    const disc = Number(row.get('discount')?.value || 0);
    const max = Number(row.get('max_stock')?.value || 0);
    const expired = !!row.get('expired')?.value;

    // marca como expirado
    if (expired) row.get('product_id')?.setErrors({ expired: true });

    // valida el stock
    if (qty > max) {
      row.get('quantity')?.setErrors({ exceed: true });
    } else {
      const errors = row.get('quantity')?.errors || {};
      delete (errors as any)['exceed'];
      Object.keys(errors).length === 0
        ? row.get('quantity')?.setErrors(null)
        : row.get('quantity')?.setErrors(errors);
    }

    // calcula el total de la linea
    const line = Math.max(0, price * qty - disc);
    row.patchValue({ line_total: line }, { emitEvent: false });
  }

  // suma los totales de cada linea (subtotal del detalle)
  get subtotal(): number {
    return this.itemsFA.controls.reduce((acc: number, fg: FormGroup) => {
      return acc + Number(fg.get('line_total')?.value || 0);
    }, 0);
  }

  // descuento de cabecera
  get headerDiscount(): number {
    return Number(this.step2Form.get('discount')?.value || 0);
  }

  // calcula el IVA sobre
  get tax(): number {
    const base = Math.max(0, this.subtotal - this.headerDiscount);
    return +(base * (this.TAX_PERCENT / 100)).toFixed(2);
  }

  // total final
  get total(): number {
    return Math.max(0, this.subtotal - this.headerDiscount) + this.tax;
  }

  // valida las lineas y crea la venta
  saveSale(): void {
    if (this.itemsFA.length === 0) {
      this._swal.showWarning('Agrega al menos un producto.');
      return;
    }
    for (let i = 0; i < this.itemsFA.length; i++) {
      const row = this.itemsFA.at(i) as FormGroup;
      if (row.invalid) {
        this._swal.showWarning(
          'Corrige las líneas inválidas (vencido/stock/campos).'
        );
        row.markAllAsTouched();
        return;
      }
    }

    const payload: SaleCreatePayload = {
      customer_id: this.selectedCustomerId(),
      items: this.itemsFA.controls.map((fg: FormGroup) => ({
        product_id: Number(fg.get('product_id')?.value),
        quantity: Number(fg.get('quantity')?.value),
        discount: Number(fg.get('discount')?.value || 0),
      })),
      tax_percent: this.TAX_PERCENT,
      discount: this.headerDiscount,
      issued_at: new Date().toISOString(),
    };

    this.formLoading.set(true);
    this._swal.showLoading();
    this._serviceSale.createSale(payload).subscribe({
      next: () => {
        this._swal.showSuccessPromise('Venta creada correctamente').then(() => {
          this.formLoading.set(false);
          this.closeModal();
          this.loadSales();
        });
      },
      error: (err) => {
        this.formLoading.set(false);
        const msg = err?.error?.message || 'No fue posible crear la venta';
        this._swal.showError(msg);
      },
    });
  }

  // descarga el PDF
  downloadPDF(sale: any): void {
    this._serviceSale.printSale(sale.id).subscribe({
      next: (pdfBlob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sale.invoice_number}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this._swal.showError('No fue posible generar el PDF');
      },
    });
  }

  // trackBy para @For de ventas
  trackById = (_: number, item: Sale) => item.id;

  // trackBy de filas de detalle
  trackByIndex = (i: number) => i;
}
