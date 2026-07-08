import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import {
  claimPairingRequest,
  getClaimedPairings,
  getDeviceById,
  getDevices,
  getPairingById,
  getPairingHistory,
  getPendingPairings,
  pairDeviceRequest,
} from '../services/devices.api';
import type {
  ClaimPairingPayload,
  DeviceInventoryQuery,
  PairDevicePayload,
} from '../types/devices';

/** GET /devices?state=&hardwareProfile=&search=&page=&limit= */
export function useDevices(query: DeviceInventoryQuery = {}) {
  return useQuery({
    queryKey: queryKeys.devices.inventory(query),
    queryFn: () => getDevices(query),
  });
}

/** Convenience: all devices (fleet). */
export function useFleetOverview(params: Omit<DeviceInventoryQuery, 'state'> = {}) {
  return useDevices({ state: 'all', limit: 100, ...params });
}

export function useClaimedDevices(
  params: Omit<DeviceInventoryQuery, 'state'> = {},
) {
  return useDevices({ state: 'claimed', limit: 100, ...params });
}

export function usePendingDevices(
  params: Omit<DeviceInventoryQuery, 'state'> = {},
) {
  return useDevices({ state: 'pending', limit: 100, ...params });
}

export function useRegisteredDevices(
  params: Omit<DeviceInventoryQuery, 'state'> = {},
) {
  return useDevices({ state: 'registered', limit: 100, ...params });
}

export function useDevice(id: string | null) {
  return useQuery({
    queryKey: queryKeys.devices.detail(id ?? ''),
    queryFn: () => getDeviceById(id as string),
    enabled: Boolean(id),
  });
}

export function usePendingPairings() {
  return useQuery({
    queryKey: queryKeys.devices.pairingsPending,
    queryFn: getPendingPairings,
  });
}

export function useClaimedPairings() {
  return useQuery({
    queryKey: queryKeys.devices.pairingsClaimed,
    queryFn: getClaimedPairings,
  });
}

export function usePairingHistory() {
  return useQuery({
    queryKey: queryKeys.devices.pairingsHistory,
    queryFn: getPairingHistory,
  });
}

export function usePairing(id: string | null) {
  return useQuery({
    queryKey: queryKeys.devices.pairing(id ?? ''),
    queryFn: () => getPairingById(id as string),
    enabled: Boolean(id),
  });
}

export function usePairDevice() {
  return useMutation({
    mutationFn: (payload: PairDevicePayload) => pairDeviceRequest(payload),
  });
}

export function useClaimPairing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClaimPairingPayload) => claimPairingRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}
