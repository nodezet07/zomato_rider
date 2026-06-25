import { apiUploadForm } from '@/lib/apiUpload';
import { apiFetch } from '@/lib/apiFetch';
import { logFormDataParts, toUploadFile } from '@/lib/multipart';
import type { ApiEnvelope, RiderEarnings, RiderOrder, RiderProfile, RiderUser, VehicleType } from '@/types/rider';

const RIDER_FEE = 40;

export { RIDER_FEE };

export async function registerRider(input: {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  drivingLicenseUri?: string;
  aadhaarCardUri?: string;
  profileImageUri?: string;
  bankAccountDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
}) {
  if (input.drivingLicenseUri && input.aadhaarCardUri) {
    const formData = new FormData();
    formData.append('fullName', input.fullName);
    formData.append('email', input.email);
    formData.append('password', input.password);
    if (input.mobile) formData.append('mobile', input.mobile);
    if (input.vehicleType) formData.append('vehicleType', input.vehicleType);
    if (input.vehicleNumber) formData.append('vehicleNumber', input.vehicleNumber);
    if (input.bankAccountDetails) {
      formData.append('bankAccountDetails', JSON.stringify(input.bankAccountDetails));
    }

    if (input.profileImageUri) {
      formData.append('profileImage', toUploadFile(input.profileImageUri, 'profile.jpg') as unknown as Blob);
    }
    formData.append(
      'drivingLicense',
      toUploadFile(input.drivingLicenseUri, 'driving-license.jpg') as unknown as Blob,
    );
    formData.append(
      'aadhaarCard',
      toUploadFile(input.aadhaarCardUri, 'aadhaar-card.jpg') as unknown as Blob,
    );

    logFormDataParts(formData, 'riders/register');
    if (__DEV__) console.log('[registerRider] submitting multipart KYC registration');

    return apiUploadForm<ApiEnvelope<{ user: RiderUser; rider: RiderProfile }>>(
      '/riders/register',
      formData,
    );
  }

  return apiFetch<ApiEnvelope<{ user: RiderUser; rider: RiderProfile }>>('/riders/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function loginRider(input: { email: string; password: string }) {
  return apiFetch<
    ApiEnvelope<{
      user: RiderUser;
      rider: RiderProfile;
      accessToken: string;
      refreshToken: string;
    }>
  >('/riders/login', { method: 'POST', body: JSON.stringify(input) });
}

export async function fetchRiderMe() {
  const body = await apiFetch<ApiEnvelope<{ rider: RiderProfile; user: RiderUser }>>('/riders/me');
  return body.data!;
}

export async function fetchRiderProfile() {
  const data = await fetchRiderMe();
  return data.rider;
}

export async function updateRiderProfile(input: {
  fullName?: string;
  mobile?: string;
  vehicleType?: VehicleType;
  vehicleNumber?: string;
  drivingLicense?: string;
  aadhaarCard?: string;
  profileImage?: string;
  bankAccountDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
}) {
  const body = await apiFetch<ApiEnvelope<{ rider: RiderProfile; user: RiderUser }>>('/riders/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return body.data!;
}

export async function updateRiderOnlineStatus(onlineStatus: boolean) {
  const body = await apiFetch<ApiEnvelope<{ rider: RiderProfile }>>('/riders/status', {
    method: 'PATCH',
    body: JSON.stringify({ onlineStatus }),
  });
  return body.data!.rider;
}

export async function updateRiderLocation(input: {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}) {
  return apiFetch('/riders/location', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function fetchAvailableOrders() {
  const body = await apiFetch<ApiEnvelope<{ orders: RiderOrder[] }>>('/riders/available-orders');
  return body.data?.orders ?? [];
}

export async function acceptOrder(orderId: string) {
  const body = await apiFetch<ApiEnvelope<{ order: RiderOrder }>>(`/riders/accept-order/${orderId}`, {
    method: 'PATCH',
  });
  const order = body.data?.order;
  if (!order) {
    return { _id: orderId } as RiderOrder;
  }
  return order;
}

export async function rejectOrder(orderId: string, reason?: string) {
  const body = await apiFetch<ApiEnvelope<{ order: RiderOrder }>>(`/riders/reject-order/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
  return body.data!.order;
}

export async function pickupOrder(orderId: string) {
  const body = await apiFetch<ApiEnvelope<{ order: RiderOrder }>>(`/riders/pickup-order/${orderId}`, {
    method: 'PATCH',
  });
  return body.data!.order;
}

export async function startDelivery(orderId: string) {
  const body = await apiFetch<ApiEnvelope<{ order: RiderOrder }>>(`/riders/start-delivery/${orderId}`, {
    method: 'PATCH',
  });
  return body.data!.order;
}

export async function completeDelivery(orderId: string) {
  const body = await apiFetch<ApiEnvelope<{ order: RiderOrder }>>(
    `/riders/complete-delivery/${orderId}`,
    { method: 'PATCH' },
  );
  return body.data!.order;
}

export async function fetchRiderEarnings() {
  const body = await apiFetch<ApiEnvelope<{ earnings: RiderEarnings }>>('/riders/earnings');
  return body.data!.earnings;
}

export async function fetchEarningsSummary() {
  const body = await apiFetch<
    ApiEnvelope<{
      pendingPayout: { deliveryCount: number; grossEarnings: number };
      totalPaidOut: { deliveryCount: number; grossEarnings: number };
      totalEarnings: number;
      todayEarnings: number;
      earningPerDelivery: number;
    }>
  >('/riders/earnings/summary');
  return body.data!;
}

export async function fetchPayoutHistory(page = 1, limit = 20) {
  const body = await apiFetch<
    ApiEnvelope<{
      payouts: {
        _id: string;
        netPayable: number;
        amount?: number;
        status: string;
        periodStart?: string;
        periodEnd?: string;
        paidAt?: string;
      }[];
      pagination?: { total: number };
    }>
  >(`/riders/payouts?page=${page}&limit=${limit}`);
  return body.data ?? { payouts: [] };
}

export async function fetchWithdrawalRequests(page = 1, limit = 20) {
  const body = await apiFetch<
    ApiEnvelope<{
      requests: {
        _id: string;
        requestNumber: string;
        amount: number;
        status: string;
        createdAt: string;
      }[];
      availableBalance: number;
      pagination?: { total: number };
    }>
  >(`/riders/withdrawals?page=${page}&limit=${limit}`);
  return body.data ?? { requests: [], availableBalance: 0 };
}

export async function requestWithdrawal(amount: number) {
  const body = await apiFetch<
    ApiEnvelope<{ request: { _id: string; requestNumber: string; amount: number; status: string } }>
  >('/riders/withdrawals', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return body.data!.request;
}

export async function fetchDeliveryHistory(page = 1, limit = 20) {
  const body = await apiFetch<ApiEnvelope<{ orders: RiderOrder[]; pagination?: { total: number } }>>(
    `/riders/history?page=${page}&limit=${limit}`,
  );
  return body.data ?? { orders: [] };
}

export async function fetchOrderById(orderId: string) {
  const body = await apiFetch<ApiEnvelope<{ order: RiderOrder }>>(`/orders/${orderId}`);
  return body.data!.order;
}

export async function fetchOrderRoute(orderId: string) {
  const body = await apiFetch<ApiEnvelope<{ path: { latitude: number; longitude: number }[] }>>(
    `/orders/track/${orderId}/route`,
  );
  return body.data?.path ?? [];
}
