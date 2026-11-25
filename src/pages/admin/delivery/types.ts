export type Method = {
  code: string;
  name: string;
  provider: string;
  is_active: boolean;
};

export type Area = { id: number; name: string; fee: number; is_active: boolean };
export type Town = { id: number; name: string; is_active: boolean };
export type Sacco = { id: number; name: string; is_active: boolean };
export type Route = {
  id: number;
  town_id: number;
  sacco_id: number;
  fee: number;
  note: string | null;
  is_active: boolean;
};

export type Config = {
  methods: Method[];
  areas: Area[];
  towns: Town[];
  saccos: Sacco[];
  routes: Route[];
};

export type Tab = "courier" | "matatu" | "methods";
export type OnSaved = (message: string) => void;