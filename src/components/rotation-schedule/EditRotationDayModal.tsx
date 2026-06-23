import { useEffect, useMemo, useState } from 'react';
import {
  rotationEditableColumns,
  type RotationScheduleColumnKey,
  type RotationScheduleRow,
} from '../../constants/rotationSchedule';
import { ROTATION_DAYS } from '../../constants/contentPlayback';
import { Button, Dropdown, Input, Modal, ModalBody, SectionLabel } from '../ui';

const dayOptions = Array.from({ length: ROTATION_DAYS }, (_, index) => {
  const day = index + 1;
  return { value: String(day), label: `Day ${day}` };
});

export interface EditRotationDayModalProps {
  open: boolean;
  initialDay?: number;
  getRowByDay: (day: number) => RotationScheduleRow | undefined;
  onClose: () => void;
  onSave: (day: number, updates: Partial<Record<RotationScheduleColumnKey, string>>) => void;
}

export function EditRotationDayModal({
  open,
  initialDay = 14,
  getRowByDay,
  onClose,
  onSave,
}: EditRotationDayModalProps) {
  const [selectedDay, setSelectedDay] = useState(String(initialDay));
  const [formValues, setFormValues] = useState<Partial<Record<RotationScheduleColumnKey, string>>>(
    {},
  );

  const groupedColumns = useMemo(() => {
    const groups = new Map<string, typeof rotationEditableColumns>();
    rotationEditableColumns.forEach((column) => {
      const existing = groups.get(column.group) ?? [];
      groups.set(column.group, [...existing, column]);
    });
    return Array.from(groups.entries());
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedDay(String(initialDay));
  }, [open, initialDay]);

  useEffect(() => {
    if (!open) return;
    const day = Number.parseInt(selectedDay, 10);
    const row = getRowByDay(day);
    if (!row) return;

    setFormValues({
      defaultFitness: row.defaultFitness,
      defaultGolf: row.defaultGolf,
      startHereFitness: row.startHereFitness,
      startHereGolf: row.startHereGolf,
      phase1FitnessWall: row.phase1FitnessWall,
      phase1FitnessNoWall: row.phase1FitnessNoWall,
      phase1GolfWall: row.phase1GolfWall,
      phase1GolfNoWall: row.phase1GolfNoWall,
      phase2: row.phase2,
      fullProgram: row.fullProgram,
    });
  }, [open, selectedDay, getRowByDay]);

  function handleClose() {
    onClose();
  }

  function handleSave() {
    const day = Number.parseInt(selectedDay, 10);
    if (!Number.isFinite(day) || day < 1 || day > ROTATION_DAYS) return;
    onSave(day, formValues);
    handleClose();
  }

  function updateField(key: RotationScheduleColumnKey, value: string) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit schedule day"
      description="Update video filenames assigned to each category for the selected rotation day."
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" className="h-9 px-4" onClick={handleSave}>
            Save changes
          </Button>
        </>
      }
    >
      <ModalBody>
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-content-muted">Rotation day</label>
            <Dropdown
              options={dayOptions}
              value={selectedDay}
              onChange={setSelectedDay}
              fullWidth
            />
            <p className="mt-1.5 text-caption text-content-muted">
              Day {selectedDay} of {ROTATION_DAYS}. Change day to edit a different rotation entry.
            </p>
          </div>

          {groupedColumns.map(([group, columns]) => (
            <section key={group}>
              <SectionLabel className="mb-3 block">{group}</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                {columns.map((column) => (
                  <Input
                    key={column.key}
                    label={column.label}
                    value={formValues[column.key] ?? ''}
                    onChange={(event) => updateField(column.key, event.target.value)}
                    disabled={column.readOnly}
                    placeholder={`e.g. ${column.key}.mp4`}
                  />
                ))}
              </div>
              {columns.some((column) => column.readOnly) && (
                <p className="mt-2 text-caption text-content-muted">
                  Default &amp; Start Here videos are static (same every day).
                </p>
              )}
            </section>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
}
