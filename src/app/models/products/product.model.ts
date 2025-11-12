export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  stock: number;
  min_stock: number;
  cost?: number | null;
  price: number | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryAlert {
  low_stock: Product[];
  expired: Product[];
  near_expire: Product[];
}
