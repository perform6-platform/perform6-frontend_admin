import { useEffect, useState, type FormEvent } from 'react';
import type { Location, LocationStatus } from '../../constants/locations';
import { Button, Dropdown, Input, Modal, ModalBody } from '../ui';

const locationStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export interface EditLocationModalProps {
  open: boolean;
  location: Location | null;
  onClose: () => void;
  onSubmit?: (payload: {
    id: string;
    name: string;
    devices: string;
    address: string;
    status: LocationStatus;
  }) => void;
}

export function EditLocationModal({ open, location, onClose, onSubmit }: EditLocationModalProps) {
  const [name, setName] = useState('');
  const [devices, setDevices] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<LocationStatus>('active');

  useEffect(() => {
    if (!open || !location) return;

    setName(location.name);
    setDevices(String(location.devices));
    setAddress(location.address);
    setStatus(location.status);
  }, [open, location]);

  function handleClose() {
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!location) return;

    onSubmit?.({
      id: location.id,
      name: name.trim(),
      devices: devices.trim(),
      address: address.trim(),
      status,
    });
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit location"
      description={location ? `Update details for ${location.name}.` : undefined}
      footer={
        <>
          <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-location-form" size="sm" className="h-9 px-4" disabled={!location}>
            Save changes
          </Button>
        </>
      }
    >
      <ModalBody>
        <form id="edit-location-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location name"
            placeholder="e.g. New York Gym"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            label="Devices"
            placeholder="e.g. 12"
            value={devices}
            onChange={(event) => setDevices(event.target.value)}
            inputMode="numeric"
            required
          />
          <Input
            label="Address"
            placeholder="e.g. 123 Main St, New York, NY"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">Status</label>
            <Dropdown
              options={[...locationStatusOptions]}
              value={status}
              onChange={(value) => setStatus(value as LocationStatus)}
              fullWidth
            />
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
