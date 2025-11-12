export interface Customer {
  id: number;
  document?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}
