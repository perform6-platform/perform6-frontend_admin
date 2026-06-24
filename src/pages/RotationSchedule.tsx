import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload } from 'lucide-react';
import { RotationScheduleTable } from '../components/rotation-schedule/RotationScheduleTable';
import { ScheduleDayDetailsModal } from '../components/rotation-schedule/ScheduleDayDetailsModal';
import { Button, Dropdown, PageTitle } from '../components/ui';
import { mockDevices } from '../constants/devices';
import { ROTATION_DAYS } from '../constants/contentPlayback';
import type { ContentCategoryId } from '../constants/contentPlayback';
import type { RotationScheduleRow } from '../constants/rotationSchedule';
import {
  getDeploymentTableColumnKeys,
  getPreviewRotationRows,
  getScheduleColumnForCategory,
  getViewFilterForCategory,
  rotationViewOptions,
} from '../constants/rotationSchedule';
import { useDeployments } from '../context/DeploymentsContext';
import { useRotationSchedule } from '../context/RotationScheduleContext';
import {
  getDeviceRotationDay,
  getLatestDeploymentForDevice,
} from '../lib/deviceSchedule';
import { exportRotationScheduleCsv } from '../lib/exportRotationSchedule';

export interface RotationScheduleLocationState {
  fromDeployment?: boolean;
  deviceId?: string;
  rotationDay?: number;
  deploymentName?: string;
  contentSchedule?: string;
  categoryId?: ContentCategoryId;
  usesRotation?: boolean;
  isBundleDeployment?: boolean;
  deploymentMode?: 'touch-screen' | 'default';
}

export default function RotationSchedule() {
  const location = useLocation();
  const navigate = useNavigate();
  const { deployments } = useDeployments();
  const [viewFilter, setViewFilter] = useState('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deploymentNotice, setDeploymentNotice] = useState<RotationScheduleLocationState | null>(null);
  const [viewRow, setViewRow] = useState<RotationScheduleRow | null>(null);
  const { rows, previewRows: basePreviewRows, getRowByDay } = useRotationSchedule();

  const deviceOptions = useMemo(
    () =>
      mockDevices.map((device) => ({
        value: device.id,
        label: `${device.name} — ${device.location}`,
      })),
    [],
  );

  const selectedDevice = useMemo(
    () => mockDevices.find((device) => device.id === selectedDeviceId),
    [selectedDeviceId],
  );

  const deviceDeployment = useMemo(
    () => (selectedDeviceId ? getLatestDeploymentForDevice(deployments, selectedDeviceId) : undefined),
    [deployments, selectedDeviceId],
  );

  const deviceRotationDay = useMemo(() => {
    if (!selectedDevice) return undefined;
    return getDeviceRotationDay(selectedDevice, deviceDeployment);
  }, [selectedDevice, deviceDeployment]);

  const tableRows = useMemo(() => {
    if (selectedDeviceId) {
      return rows;
    }
    if (deploymentNotice?.isBundleDeployment) {
      return rows;
    }
    if (!deploymentNotice?.rotationDay) return basePreviewRows;
    return getPreviewRotationRows(rows, [deploymentNotice.rotationDay]);
  }, [basePreviewRows, deploymentNotice, rows, selectedDeviceId]);

  const deploymentHighlight =
    deploymentNotice?.isBundleDeployment
      ? undefined
      : deploymentNotice?.rotationDay && deploymentNotice.categoryId
        ? {
            day: deploymentNotice.rotationDay,
            column: getScheduleColumnForCategory(deploymentNotice.categoryId),
          }
        : undefined;

  const deploymentTableColumns =
    deploymentNotice?.categoryId && !deploymentNotice.usesRotation && !deploymentNotice.isBundleDeployment
      ? getDeploymentTableColumnKeys(deploymentNotice.categoryId)
      : undefined;

  useEffect(() => {
    const state = location.state as RotationScheduleLocationState | null;
    if (state?.deviceId) {
      setSelectedDeviceId(state.deviceId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const state = location.state as RotationScheduleLocationState | null;
    if (!state?.fromDeployment || !state.rotationDay) return;

    setDeploymentNotice(state);

    if (state.isBundleDeployment) {
      setViewFilter('all');
    } else if (state.categoryId) {
      setViewFilter(getViewFilterForCategory(state.categoryId));
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setViewRow(null);
  }, [selectedDeviceId]);

  function dismissDeploymentNotice() {
    setDeploymentNotice(null);
  }

  function handleExportSchedule() {
    exportRotationScheduleCsv(getRowByDay);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <PageTitle>Schedule ({ROTATION_DAYS}-Day)</PageTitle>
          <p className="mt-1 text-body-sm text-content-secondary">
            {selectedDevice && deviceRotationDay ? (
              <>
                <strong className="font-medium text-content-primary">{selectedDevice.name}</strong> is on{' '}
                <strong className="font-medium text-content-primary">Day {deviceRotationDay}</strong> of the
                rotation.
              </>
            ) : (
              <>
                Sequential loop — Day {ROTATION_DAYS} is followed by Day 1. Select a device to filter the
                schedule table, then use View on any row for video details.
              </>
            )}
          </p>
        </div>
        <Button size="md" className="h-9 w-full gap-2 px-4 sm:w-auto" onClick={handleExportSchedule}>
          <Upload className="h-4 w-4" />
          Export Schedule
        </Button>
      </div>

      {deploymentNotice && (
        <div className="flex flex-col gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-brand-600/30 dark:bg-brand-600/10">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
            <div>
              <p className="text-body-sm font-medium text-content-primary">
                Deployment added to rotation schedule
              </p>
              <p className="mt-0.5 text-body-sm text-content-secondary">
                <strong>{deploymentNotice.deploymentName}</strong>
                {deploymentNotice.isBundleDeployment
                  ? deploymentNotice.deploymentMode === 'default'
                    ? ` — Default, Start Here, Phase 1 & Phase 2 applied to the full ${ROTATION_DAYS}-day schedule`
                    : ` — all programs applied to the full ${ROTATION_DAYS}-day rotation schedule at once`
                  : deploymentNotice.usesRotation
                    ? ` — full ${ROTATION_DAYS}-day rotation added to the schedule`
                    : ` is on Day ${deploymentNotice.rotationDay}`}
                {deploymentNotice.contentSchedule ? ` (${deploymentNotice.contentSchedule})` : ''}.
                Review the schedule table below.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 px-3"
            onClick={dismissDeploymentNotice}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-[240px]">
          <label className="mb-1 block text-xs font-medium text-content-muted">View</label>
          <Dropdown
            options={rotationViewOptions.map((option) => ({ value: option.value, label: option.label }))}
            value={viewFilter}
            onChange={setViewFilter}
            fullWidth
          />
        </div>
        <div className="w-full sm:w-[280px] sm:ml-auto">
          <label className="mb-1 block text-xs font-medium text-content-muted">Device</label>
          <Dropdown
            options={deviceOptions}
            value={selectedDeviceId}
            onChange={setSelectedDeviceId}
            placeholder="Select a device"
            fullWidth
            clearable
          />
        </div>
      </div>

      <RotationScheduleTable
        rows={tableRows}
        viewFilter={viewFilter as 'all' | 'fitness' | 'golf' | 'rotation'}
        isEditing={false}
        highlightCell={deploymentHighlight}
        highlightDay={selectedDeviceId ? deviceRotationDay : undefined}
        visibleColumnKeys={deploymentTableColumns}
        showViewActions={Boolean(selectedDeviceId)}
        onViewRow={setViewRow}
      />

      <ScheduleDayDetailsModal
        open={viewRow !== null}
        onClose={() => setViewRow(null)}
        row={viewRow}
        device={selectedDevice}
        connectionStartDate={deviceDeployment?.connectionStartDate}
        isCurrentDay={viewRow?.day === deviceRotationDay}
      />

      <p className="flex items-center gap-2 text-body-sm text-content-secondary">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
        To change which videos play on each day, go to{' '}
        <Link to="/rotation" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Rotation
        </Link>
        .
      </p>
    </div>
  );
}
