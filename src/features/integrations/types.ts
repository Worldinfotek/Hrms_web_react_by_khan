export type ClientStatus = 'Active' | 'Revoked';
export type DeliveryStatus = 'Pending' | 'Delivered' | 'Failed';

export interface ApiClient {
  id: string;
  name: string;
  scopes: string;
  maskedKey: string;
  status: ClientStatus;
}

export interface Webhook {
  id: string;
  event: string;
  url: string;
  delivery: DeliveryStatus;
}

export interface FailedCall {
  id: string;
  system: string;
  when: string;
  message: string;
}

export interface ReadinessNote {
  name: string;
  status: string;
}
