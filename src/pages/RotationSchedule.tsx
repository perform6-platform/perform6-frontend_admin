import { useState } from 'react';
import { CheckCircle2, Pencil, Upload } from 'lucide-react';
import { RotationScheduleTable } from '../components/rotation-schedule/RotationScheduleTable';
import { Button, Dropdown, PageTitle } from '../components/ui';
import { ROTATION_DAYS } from '../constants/contentPlayback';
import {
  currentRotationDay,
  mockRotationScheduleRows,
  rotationViewOptions,
} from '../constants/rotationSchedule';

export default function RotationSchedule() {
  const [viewFilter, setViewFilter] = useState('all');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <PageTitle>Rotation Schedule ({ROTATION_DAYS}-Day)</PageTitle>
          <p className="mt-1 text-body-sm text-content-secondary">
            Sequential loop — Day {ROTATION_DAYS} is followed by Day 1. Current rotation day:{' '}
            <strong className="font-medium text-content-primary">Day {currentRotationDay}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="md" variant="outline" className="h-9 gap-2 px-4">
            <Pencil className="h-4 w-4" />
            Edit Schedule
          </Button>
          <Button size="md" className="h-9 gap-2 px-4">
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
        rows={mockRotationScheduleRows}
        viewFilter={viewFilter as 'all' | 'fitness' | 'golf' | 'rotation'}
      />

      <p className="flex items-center gap-2 text-body-sm text-content-secondary">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
        Default &amp; Start Here use static videos (Fitness/Golf). Phase 1–Full Program map one video
        per day in the {ROTATION_DAYS}-day sequence.
      </p>
    </div>
  );
}
