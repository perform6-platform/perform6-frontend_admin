import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, XCircle } from 'lucide-react';
import { DeviceDetailsPanel } from '../components/devices/DeviceDetailsPanel';
import { AddDeviceModal } from '../components/devices/AddDeviceModal';
import {
  Badge,
  Button,
  Dropdown,
  IconButton,
  Input,
  PageShell,
  Pagination,
  Table,
  type TableColumn,
} from '../components/ui';
import { statusOptions, type Device } from '../constants/devices';
import { useToast } from '../context/ToastContext';
import { useClaimPairing, useDevices } from '../hooks/useDevices';
import { mapInventoryItem } from '../lib/deviceMapper';
import { cn } from '../lib/cn';
import { getApiErrorMessage } from '../services/axios';
import type { ClaimPairingPayload, DeviceInventoryState } from '../types/devices';

const PAGE_SIZE = 20;

const fleetFilterOptions = [
  { value: 'all', label: 'All Devices' },
  { value: 'registered', label: 'Registered' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'pending', label: 'Pending pairing' },
] as const;

export default function Devices() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [fleetFilter, setFleetFilter] = useState<DeviceInventoryState>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useDevices({
    state: fleetFilter,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const { mutate: claimPairing, isPending: isClaimingDevice } = useClaimPairing();

  const devices = useMemo<Device[]>(() => {
    const items = data?.items ?? [];
    return items.map(mapInventoryItem);
  }, [data]);

  const filteredDevices = useMemo(() => {
    if (statusFilter === 'all') return devices;
    return devices.filter((device) => device.status === statusFilter);
  }, [devices, statusFilter]);

  const counts = data?.meta.counts;
  const total = data?.meta.total ?? filteredDevices.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const selectedDevice = useMemo(() => {
    if (selectedDeviceId) {
      return filteredDevices.find((device) => device.id === selectedDeviceId) ?? null;
    }
    return filteredDevices[0] ?? null;
  }, [filteredDevices, selectedDeviceId]);

  useEffect(() => {
    if (selectedDeviceId && !filteredDevices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId(null);
    }
  }, [filteredDevices, selectedDeviceId]);

  function handleAddDevice(payload: ClaimPairingPayload) {
    claimPairing(payload, {
      onSuccess: (result) => {
        setAddDeviceOpen(false);
        setFleetFilter('claimed');
        setSelectedDeviceId(result.data.pairingId ?? result.data.id);
        showToast({ title: result.message || 'Device claimed', variant: 'success' });
      },
      onError: (claimError) => {
        showToast({
          title: getApiErrorMessage(claimError, 'Failed to claim device'),
          variant: 'error',
        });
      },
    });
  }

  const columns: TableColumn<Device>[] = [
    {
      key: 'name',
      header: 'Device Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      hideOnMobile: true,
      render: (row) => row.location,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'online' ? 'success' : 'danger'}>
          {row.status === 'online' ? 'Online' : 'Offline'}
        </Badge>
      ),
    },
    {
      key: 'currentDay',
      header: 'Model',
      hideOnMobile: true,
      render: (row) => row.model,
    },
    {
      key: 'brightSignStatus',
      header: 'BrightSign Status',
      hideOnMobile: true,
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-body-sm font-medium',
            row.brightSignStatus === 'connected'
              ? 'text-status-success'
              : 'text-status-danger',
          )}
        >
          {row.brightSignStatus === 'connected' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {row.brightSignStatus === 'connected' ? 'Connected' : 'Disconnected'}
        </span>
      ),
    },
    {
      key: 'lastSync',
      header: 'Last Sync',
      hideOnMobile: true,
      render: (row) => <span className="text-content-secondary">{row.lastSync}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          <IconButton
            label="Refresh device"
            onClick={() => {
              setSelectedDeviceId(row.id);
              refetch();
            }}
          >
            <RefreshCw className={cn('h-4 w-4 text-current', isFetching && 'animate-spin')} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <PageShell title="Devices">
      {counts && (
        <div className="flex flex-wrap gap-2 text-caption text-content-secondary">
          <span>Pending: {counts.pending}</span>
          <span>·</span>
          <span>Claimed: {counts.claimed}</span>
          <span>·</span>
          <span>Registered: {counts.registered}</span>
        </div>
      )}

      <div className="relative z-20 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:shrink-0 xl:gap-3">
          <Dropdown
            options={[...fleetFilterOptions]}
            value={fleetFilter}
            onChange={(value) => {
              setFleetFilter(value as DeviceInventoryState);
              setPage(1);
            }}
            fullWidth
            className="min-w-0"
          />
          <Dropdown
            options={[...statusOptions]}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            fullWidth
            className="min-w-0"
          />
        </div>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search serial / name / model / code..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setSearch(searchInput.trim());
              setPage(1);
            }
          }}
          aria-label="Search devices"
          className="min-w-0 w-full xl:flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-9 w-full shrink-0 whitespace-nowrap px-4 xl:w-auto"
          onClick={() => {
            setSearch(searchInput.trim());
            setPage(1);
          }}
        >
          Search
        </Button>
        <Button
          size="sm"
          className="h-9 w-full shrink-0 whitespace-nowrap px-4 xl:ml-auto xl:w-auto"
          onClick={() => setAddDeviceOpen(true)}
        >
          Add device
        </Button>
      </div>

      <AddDeviceModal
        open={addDeviceOpen}
        onClose={() => setAddDeviceOpen(false)}
        onSubmit={handleAddDevice}
        isSubmitting={isClaimingDevice}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {isError && (
            <div className="rounded-card border border-status-danger/25 bg-[rgba(234,84,85,0.1)] px-4 py-3 text-body-sm text-status-danger">
              {getApiErrorMessage(error, 'Failed to load devices')}
            </div>
          )}
          <Table
            columns={columns}
            data={filteredDevices}
            rowKey={(row) => row.id}
            emptyMessage={isLoading ? 'Loading devices...' : 'No devices found'}
            selectedRowKey={selectedDevice?.id}
            onRowClick={(row) => setSelectedDeviceId(row.id)}
          />

          <Pagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>

        <DeviceDetailsPanel device={selectedDevice} className="xl:sticky xl:top-4 xl:self-start" />
      </div>
    </PageShell>
  );
}
