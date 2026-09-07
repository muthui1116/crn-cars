export type ShippingInfo = {
  name: string;
  phone: string; // must be M-Pesa registered number, e.g. 2547XXXXXXXX
  address: string;
  city: string;
};

export type CheckoutStep = "shipping" | "review" | "paying" | "done";

export type PlaceOrderResult =
  | { success: true; orderId: number }
  | { success: false; error: string };

export type PaymentResult =
  | { success: true; checkoutRequestId: string }
  | { success: false; error: string };