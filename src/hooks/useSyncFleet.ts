import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { getSyncDeviceDetail, getSyncFleet } from '../services/sync.api';

export function useSyncFleet() {
  return useQuery({
    queryKey: queryKeys.sync.fleet,
    queryFn: getSyncFleet,
    refetchInterval: 15_000,
  });
}

export function useSyncDeviceDetail(deviceId: string | null) {
  return useQuery({
    queryKey: queryKeys.sync.deviceDetail(deviceId ?? ''),
    queryFn: () => getSyncDeviceDetail(deviceId!),
    enabled: Boolean(deviceId),
    refetchInterval: 10_000,
  });
}
