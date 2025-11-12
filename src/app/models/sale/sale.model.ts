import { Customer } from "../customer/customer.model";
import { Product } from "../products/product.model";

export interface SaleItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price?: number;
  discount?: number;
  line_total?: number;
  product?: Product;
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer_id?: number | null;
  user_id: number;
  status: 'paid' | 'pending' | 'void';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  issued_at: string;
  printed_at?: string | null;
  items?: SaleItem[];
  customer?: Customer | null;
}
