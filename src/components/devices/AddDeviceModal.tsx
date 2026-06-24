import { useState, type FormEvent } from 'react';
import { Button, Input, Modal, ModalBody } from '../ui';

export interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { deviceName: string; pairingCode: string }) => void;
}

export function AddDeviceModal({ open, onClose, onSubmit }: AddDeviceModalProps) {
  const [deviceName, setDeviceName] = useState('');
  const [pairingCode, setPairingCode] = useState('');

  function handleClose() {
    setDeviceName('');
    setPairingCode('');
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.({
      deviceName: deviceName.trim(),
      pairingCode: pairingCode.trim(),
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
        </form>
      </ModalBody>
    </Modal>
  );
}
