import { useState } from 'react';
import { CheckCircle2, Pencil, Upload, X } from 'lucide-react';
import { EditRotationDayModal } from '../components/rotation-schedule/EditRotationDayModal';
import { RotationScheduleTable } from '../components/rotation-schedule/RotationScheduleTable';
import { Button, Dropdown, PageTitle } from '../components/ui';
import { ROTATION_DAYS } from '../constants/contentPlayback';
import { currentRotationDay, rotationViewOptions } from '../constants/rotationSchedule';
import { useRotationSchedule } from '../context/RotationScheduleContext';

export default function RotationSchedule() {
  const [viewFilter, setViewFilter] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(currentRotationDay);
  const { previewRows, isEditing, setIsEditing, getRowByDay, updateDayRow } = useRotationSchedule();

  function openEditModal(day = currentRotationDay) {
    setEditingDay(day);
    setEditModalOpen(true);
  }

  function handleEditScheduleClick() {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    setIsEditing(true);
    openEditModal(currentRotationDay);
  }

  function handleExportSchedule() {
    const headers = [
      'Day',
      'Date',
      'Default Fitness',
      'Default Golf',
      'Start Here Fitness',
      'Start Here Golf',
      'Phase 1 Fitness Wall',
      'Phase 1 Fitness No Wall',
      'Phase 1 Golf Wall',
      'Phase 1 Golf No Wall',
      'Phase 2',
      'Full Program',
    ];

    const allRows = Array.from({ length: ROTATION_DAYS }, (_, index) => getRowByDay(index + 1)).filter(
      Boolean,
    );

    const csvLines = [
      headers.join(','),
      ...allRows.map((row) =>
        [
          row!.day,
          row!.dateLabel,
          row!.defaultFitness,
          row!.defaultGolf,
          row!.startHereFitness,
          row!.startHereGolf,
          row!.phase1FitnessWall,
          row!.phase1FitnessNoWall,
          row!.phase1GolfWall,
          row!.phase1GolfNoWall,
          row!.phase2,
          row!.fullProgram,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'perform6-rotation-schedule.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <PageTitle>Rotation Schedule ({ROTATION_DAYS}-Day)</PageTitle>
            <p className="mt-1 text-body-sm text-content-secondary">
              Sequential loop — Day {ROTATION_DAYS} is followed by Day 1. Current rotation day:{' '}
              <strong className="font-medium text-content-primary">Day {currentRotationDay}</strong>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              size="md"
              variant={isEditing ? 'primary' : 'outline'}
              className="h-9 w-full gap-2 px-4 sm:w-auto"
              onClick={handleEditScheduleClick}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {isEditing ? 'Done Editing' : 'Edit Schedule'}
            </Button>
            {isEditing && (
              <Button
                size="md"
                variant="outline"
                className="h-9 w-full gap-2 px-4 sm:w-auto"
                onClick={() => openEditModal()}
              >
                <Pencil className="h-4 w-4" />
                Edit Day…
              </Button>
            )}
            <Button size="md" className="h-9 w-full gap-2 px-4 sm:w-auto" onClick={handleExportSchedule}>
              <Upload className="h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </div>

        <Dropdown
          options={rotationViewOptions.map((option) => ({ value: option.value, label: option.label }))}
          value={viewFilter}
          onChange={setViewFilter}
          className="w-full sm:w-[240px]"
        />

        <RotationScheduleTable
          rows={previewRows}
          viewFilter={viewFilter as 'all' | 'fitness' | 'golf' | 'rotation'}
          isEditing={isEditing}
          onEditDay={(day) => openEditModal(day)}
        />

        <p className="flex items-center gap-2 text-body-sm text-content-secondary">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
          Default &amp; Start Here use static videos (Fitness/Golf). Phase 1–Full Program map one video
          per day in the {ROTATION_DAYS}-day sequence.
        </p>
      </div>

      <EditRotationDayModal
        open={editModalOpen}
        initialDay={editingDay}
        getRowByDay={getRowByDay}
        onClose={() => setEditModalOpen(false)}
        onSave={updateDayRow}
      />
    </>
  );
}
