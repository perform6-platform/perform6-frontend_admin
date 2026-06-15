import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { EditLocationModal } from '../components/locations/EditLocationModal';
import {
  Button,
  ConfirmModal,
  IconButton,
  PageTitle,
  Pagination,
  Table,
  type TableColumn,
} from '../components/ui';
import { mockLocations, type Location } from '../constants/locations';

const PAGE_SIZE = 6;

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [page, setPage] = useState(1);
  const [deleteLocationOpen, setDeleteLocationOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const totalPages = Math.max(1, Math.ceil(locations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedLocations = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return locations.slice(start, start + PAGE_SIZE);
  }, [locations, safePage]);

  function handleDeleteLocation() {
    if (!locationToDelete) return;
    setLocations((current) => current.filter((location) => location.id !== locationToDelete.id));
  }

  function handleEditLocation(payload: {
    id: string;
    name: string;
    devices: string;
    address: string;
    status: Location['status'];
  }) {
    setLocations((current) =>
      current.map((location) =>
        location.id === payload.id
          ? {
              ...location,
              name: payload.name,
              devices: Number.parseInt(payload.devices, 10) || location.devices,
              address: payload.address,
              status: payload.status,
            }
          : location,
      ),
    );
  }

  const columns: TableColumn<Location>[] = [
    {
      key: 'name',
      header: 'Location Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'devices',
      header: 'Devices',
      render: (row) => row.devices,
    },
    {
      key: 'address',
      header: 'Address',
      className: 'max-w-[320px] whitespace-normal',
      render: (row) => <span className="text-content-secondary">{row.address}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={
            row.status === 'active'
              ? 'font-medium text-status-success'
              : 'font-medium text-content-muted'
          }
        >
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Edit ${row.name}`}
            onClick={() => {
              setEditingLocation(row);
              setEditLocationOpen(true);
            }}
          >
            <Pencil />
          </IconButton>
          <IconButton
            label={`Delete ${row.name}`}
            className="hover:border-red-500/30 hover:text-status-danger"
            onClick={() => {
              setLocationToDelete(row);
              setDeleteLocationOpen(true);
            }}
          >
            <Trash2 />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>Locations</PageTitle>
        <Button size="sm" className="h-9 shrink-0 gap-1.5 px-4">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="space-y-4">
        <Table
          columns={columns}
          data={paginatedLocations}
          rowKey={(row) => row.id}
          emptyMessage="No locations found"
        />

        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={locations.length}
          onPageChange={setPage}
          entityLabel="locations"
        />
      </div>

      <EditLocationModal
        open={editLocationOpen}
        location={editingLocation}
        onClose={() => {
          setEditLocationOpen(false);
          setEditingLocation(null);
        }}
        onSubmit={handleEditLocation}
      />

      <ConfirmModal
        open={deleteLocationOpen}
        onClose={() => {
          setDeleteLocationOpen(false);
          setLocationToDelete(null);
        }}
        onConfirm={handleDeleteLocation}
        title="Delete location?"
        description={
          locationToDelete
            ? `Are you sure you want to delete ${locationToDelete.name}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
