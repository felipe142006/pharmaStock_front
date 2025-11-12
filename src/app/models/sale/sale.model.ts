export interface Sale {
  id: number;
  invoice_number: string;
  customer_id?: number | null;
  status: 'paid' | 'pending' | 'void';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  issued_at: string;
  printed_at?: string | null;
  items_count?: number;
  customer?: { id: number; name: string; document?: string | null } | null;
}

export interface SaleItemInput {
  product_id: number;
  quantity: number;
  discount?: number;
}

export interface SaleCreatePayload {
  customer_id?: number | null;
  items: SaleItemInput[];
  tax_percent: number;
  discount?: number;
  issued_at?: string;
}

export interface SaleDetailItem {
  id: number;
  quantity: number;
  unit_price: number | string;
  discount: number | string;
  line_total: number | string;
  product?: { id: number; sku: string; name: string };
}

export interface SaleDetail {
  id: number;
  invoice_number: string;
  status: 'paid' | 'pending' | 'void' | string;
  issued_at: string;
  printed_at?: string | null;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  customer?: {
    id: number;
    document?: string | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  items: SaleDetailItem[];
  user: any
}
