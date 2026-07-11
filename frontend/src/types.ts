export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  price: string;
  stock: number;
  category_id: number | null;
  category_name: string | null;
  image_url: string | null;
  low_stock_threshold: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export type PaymentMethod = "cash" | "card" | "other";

export interface CheckoutResponse {
  success: boolean;
  orderId?: number;
  message: string;
  error?: string;
  changeAmount?: number;
}

export interface OrderListItem {
  id: number;
  order_date: string;
  total_amount: string;
  item_count: number;
  payment_method: string;
  discount_amount: string;
  change_amount: string;
}

export interface OrderDetailItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderDetail {
  id: number;
  order_date: string;
  total_amount: string;
  discount_amount: string;
  payment_method: string;
  amount_tendered: string;
  change_amount: string;
  status: string;
  items: OrderDetailItem[];
}

export interface ProductFormData {
  name: string;
  barcode: string;
  price: number;
  stock: number;
  categoryId: number | null;
  lowStockThreshold: number;
}
