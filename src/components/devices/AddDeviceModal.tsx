import { useState, type FormEvent } from 'react';
import { Button, Dropdown, Input, Modal, ModalBody } from '../ui';
import { locationOptions, assignableLocations } from '../../constants/devices';

export interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { deviceName: string; pairingCode: string; location: string }) => void;
}

export function AddDeviceModal({ open, onClose, onSubmit }: AddDeviceModalProps) {
  const [deviceName, setDeviceName] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [location, setLocation] = useState(assignableLocations[0]?.value ?? 'new-york');

  function handleClose() {
    setDeviceName('');
    setPairingCode('');
    setLocation(assignableLocations[0]?.value ?? 'new-york');
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.({
      deviceName: deviceName.trim(),
      pairingCode: pairingCode.trim(),
      location,
    });
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add device"
      description="Enter the pairing code shown on the BrightSign device to register it."
      footer={
        <>
          <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-device-form" size="sm" className="h-9 px-4">
            Add device
          </Button>
        </>
      }
    >
      <ModalBody>
        <form id="add-device-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Device name"
            placeholder="e.g. BrightSign-046"
            value={deviceName}
            onChange={(event) => setDeviceName(event.target.value)}
          />
          <Input
            label="Pairing code"
            placeholder="Enter 6-digit code"
            value={pairingCode}
            onChange={(event) => setPairingCode(event.target.value)}
            inputMode="numeric"
            maxLength={6}
            required
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">Location</label>
            <Dropdown
              options={[...assignableLocations]}
              value={location}
              onChange={setLocation}
              fullWidth
            />
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
