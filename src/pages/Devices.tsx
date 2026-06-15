import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, XCircle } from 'lucide-react';
import { DeviceDetailsPanel } from '../components/devices/DeviceDetailsPanel';
import { AddDeviceModal } from '../components/devices/AddDeviceModal';
import { EditDeviceModal } from '../components/devices/EditDeviceModal';
import {
  ActionMenu,
  Badge,
  Button,
  ConfirmModal,
  Dropdown,
  IconButton,
  Input,
  PageShell,
  Pagination,
  Table,
  type TableColumn,
} from '../components/ui';
import {
  locationOptions,
  mockDevices,
  statusOptions,
  type Device,
  type DeviceStatus,
} from '../constants/devices';
import { cn } from '../lib/cn';

const PAGE_SIZE = 8;

const locationFilterMap: Record<string, string> = {
  'new-york': 'New York Gym',
  chicago: 'Chicago Gym',
  dallas: 'Dallas Gym',
  'los-angeles': 'Los Angeles Gym',
  miami: 'Miami Gym',
  boston: 'Boston Gym',
};

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [page, setPage] = useState(1);
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [editDeviceOpen, setEditDeviceOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteDeviceOpen, setDeleteDeviceOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesLocation =
        locationFilter === 'all' || device.location === locationFilterMap[locationFilter];
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        device.name.toLowerCase().includes(query) ||
        device.location.toLowerCase().includes(query);

      return matchesLocation && matchesStatus && matchesSearch;
    });
  }, [devices, locationFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedDevices = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredDevices.slice(start, start + PAGE_SIZE);
  }, [filteredDevices, safePage]);

  const selectedDevice = useMemo(() => {
    if (selectedDeviceId) {
      return filteredDevices.find((device) => device.id === selectedDeviceId) ?? null;
    }
    return paginatedDevices[0] ?? filteredDevices[0] ?? null;
  }, [filteredDevices, paginatedDevices, selectedDeviceId]);

  useEffect(() => {
    if (selectedDeviceId && !filteredDevices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId(null);
    }
  }, [filteredDevices, selectedDeviceId]);

  function handleEditDevice(payload: {
    id: string;
    deviceName: string;
    location: string;
    currentDay: string;
    status: DeviceStatus;
  }) {
    setDevices((current) =>
      current.map((device) =>
        device.id === payload.id
          ? {
              ...device,
              name: payload.deviceName,
              location: payload.location,
              currentDay: payload.currentDay,
              status: payload.status,
            }
          : device,
      ),
    );
  }

  function handleDeleteDevice() {
    if (!deviceToDelete) return;

    setDevices((current) => current.filter((device) => device.id !== deviceToDelete.id));

    if (selectedDeviceId === deviceToDelete.id) {
      setSelectedDeviceId(null);
    }
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
      header: 'Current Day',
      hideOnMobile: true,
      render: (row) => row.currentDay,
    },
    {
      key: 'brightSignStatus',
      header: 'BrightSign Status',
      hideOnMobile: true,
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-body-sm font-medium',
            row.brightSignStatus === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
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
        <div className="flex items-center justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
          <IconButton label="Sync device">
            <RefreshCw className="h-4 w-4 text-current" />
          </IconButton>
          <ActionMenu
            items={[
              { value: 'edit', label: 'Edit' },
              { value: 'delete', label: 'Delete', variant: 'danger' },
            ]}
            onSelect={(action) => {
              setSelectedDeviceId(row.id);
              if (action === 'edit') {
                setEditingDevice(row);
                setEditDeviceOpen(true);
                return;
              }
              if (action === 'delete') {
                setDeviceToDelete(row);
                setDeleteDeviceOpen(true);
              }
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <PageShell title="Devices">
      <div className="relative z-20 flex w-full flex-nowrap items-center gap-3">
        <Dropdown
          options={[...locationOptions]}
          value={locationFilter}
          onChange={(value) => {
            setLocationFilter(value);
            setPage(1);
          }}
          className="shrink-0"
        />
        <Dropdown
          options={[...statusOptions]}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          className="shrink-0"
        />
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search devices..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Search devices"
          className="min-w-0 flex-1"
        />
        <Button
          size="sm"
          className="ml-auto h-9 shrink-0 whitespace-nowrap px-4"
          onClick={() => setAddDeviceOpen(true)}
        >
          Add device
        </Button>
      </div>

      <AddDeviceModal open={addDeviceOpen} onClose={() => setAddDeviceOpen(false)} />

      <EditDeviceModal
        open={editDeviceOpen}
        device={editingDevice}
        onClose={() => {
          setEditDeviceOpen(false);
          setEditingDevice(null);
        }}
        onSubmit={handleEditDevice}
      />

      <ConfirmModal
        open={deleteDeviceOpen}
        onClose={() => {
          setDeleteDeviceOpen(false);
          setDeviceToDelete(null);
        }}
        onConfirm={handleDeleteDevice}
        title="Delete device?"
        description={
          deviceToDelete
            ? `Are you sure you want to delete ${deviceToDelete.name}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <Table
            columns={columns}
            data={paginatedDevices}
            rowKey={(row) => row.id}
            emptyMessage="No devices found"
            selectedRowKey={selectedDevice?.id}
            onRowClick={(row) => setSelectedDeviceId(row.id)}
          />

          <Pagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={filteredDevices.length}
            onPageChange={setPage}
          />
        </div>

        <DeviceDetailsPanel device={selectedDevice} className="xl:sticky xl:top-4 xl:self-start" />
      </div>
    </PageShell>
  );
}
