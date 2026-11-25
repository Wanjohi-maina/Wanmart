export type PaymentMethod = "mpesa" | "cash_on_delivery";
export type DeliveryMethod = "courier" | "matatu";

export type CourierArea = {
  id: number;
  name: string;
  fee: number;
};

export type MatatuRoute = {
  id: number;
  sacco: string;
  fee: number;
  note: string | null;
};

export type MatatuTown = {
  id: number;
  name: string;
  routes: MatatuRoute[];
};

export type DeliveryOptions = {
  methods: { code: DeliveryMethod; name: string }[];
  courier: CourierArea[];
  matatu: MatatuTown[];
};