import type { IdSelectOption, SelectOption } from './api';
import type { HardwareProfileCode } from './devices';

// ---------------------------------------------------------------------------
// Wizard metadata
// ---------------------------------------------------------------------------

export type DeploymentTypeOption = SelectOption;
export type CategoryOption = IdSelectOption;
export type VariantOption = IdSelectOption;

export type BrandingMode = 'NONE' | 'PLATFORM_DEFAULT' | 'CUSTOM';

export interface PreviewSlot {
  key: string;
  label: string;
  libraryType: string;
}

export interface PreviewItem {
  day: number;
  video: string;
  order: number;
  thumbnail: string;
  duration: number;
  mediaVersionId: string;
  fileUrl: string;
}

/** Wizard preview slot — rotating libraries (phase1, phase2, fullProgram) are PreviewItem[]. */
export interface DeploymentPreviewSlotData {
  key: string;
  label: string;
  libraryType?: string;
  items: PreviewItem[];
}

/** GET /deployments/preview — wizard shows all assigned rotation videos per slot. */
export interface DeploymentPreview {
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate: string | null;
  rotationDay: number | null;
  slots: PreviewSlot[];
  default?: PreviewItem | PreviewItem[];
  startHere?: PreviewItem | PreviewItem[];
  phase1?: PreviewItem[];
  phase2?: PreviewItem[];
  fullProgram?: PreviewItem[];
  [slotKey: string]: unknown;
}

export interface DeploymentPreviewQuery {
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate?: string;
  /** Optional single-day filter — omit in wizard to load the full rotation list. */
  day?: number;
}

// ---------------------------------------------------------------------------
// Register — XC4055 / XT2145 / HD226
// ---------------------------------------------------------------------------

export interface Hd226ClusterMember {
  memberKey: 'DEVICE_A' | 'DEVICE_B' | 'DEVICE_C' | string;
  pairingId: string;
  deviceName?: string;
}

/** Single-player register (XC4055 / XT2145). */
export interface RegisterSinglePayload {
  pairingId: string;
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate?: string;
  deviceName?: string;
  hardwareProfile?: HardwareProfileCode;
  brandingMode: BrandingMode;
  brandingId?: string;
}

/** HD226 3-player cluster register. */
export interface RegisterClusterPayload {
  hardwareProfile: 'HD226';
  members: Hd226ClusterMember[];
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate?: string;
  brandingMode: BrandingMode;
  brandingId?: string;
}

export type RegisterDeploymentPayload = RegisterSinglePayload | RegisterClusterPayload;

export interface RegisterDeploymentResult {
  deviceId?: string;
  deviceIds?: string[];
  apiToken?: string;
  apiTokens?: Record<string, string>;
  deploymentId: string;
  pairingId?: string;
  screenCount?: number;
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate: string | null;
  playbackManifest?: PlaybackManifest;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Playback manifest
// ---------------------------------------------------------------------------

export interface ManifestContentItem {
  day: number;
  order: number;
  video: string;
  mediaVersionId: string;
  mediaAssetId: string;
  thumbnail: string;
  durationSeconds: number;
  checksum: string;
  fileUrl: string;
  title: string;
  description: string | null;
}

export interface ManifestSlot {
  slot: string;
  label: string;
  libraryType: string;
  programId: string;
  isRotating: boolean;
  items: ManifestContentItem[];
  metadata: {
    title: string;
    description: string | null;
    duration: number;
    thumbnail: string;
  };
}

export interface PlaybackManifest {
  deviceId: string;
  deploymentType: string;
  field: string;
  variant: string;
  rotationStartDate: string | null;
  rotationDay: number | null;
  branding: {
    brandName: string;
    logoUrl: string;
  } | null;
  runtimeUi: {
    touchMode: 'CONTROLLER' | null;
    displayMode: 'PLAYBACK' | 'PRESENTATION';
    supportsControls: boolean;
    uiMode: 'CONTROLLER' | 'PLAYBACK';
  };
  content: Record<string, ManifestSlot>;
  resolutionSource: string;
  hardwareProfileCode: string;
  screens: unknown[];
  targets: Record<string, unknown>;
  bindings: unknown[];
}

// ---------------------------------------------------------------------------
// Hardware abstraction
// ---------------------------------------------------------------------------

export interface HardwareProfile {
  id: string;
  code: HardwareProfileCode;
  name: string;
  outputCount: number;
  supportsTouch: boolean;
  isCluster: boolean;
}

export interface ScreenAssignment {
  id?: string;
  screenKey: string;
  contentSlot: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}

export interface CreateScreenAssignmentPayload {
  screenKey: string;
  contentSlot: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateScreenAssignmentPayload {
  contentSlot?: string;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface HardwareBindingPayload {
  hardwareProfileCode: string;
  bindings: Array<{
    screenAssignmentId: string;
    targetType: string;
    targetKey: string;
  }>;
}

export interface RuntimeManifestQuery {
  deviceId?: string;
  displayTarget?: string;
  clusterMember?: string;
  rotationStartDate?: string;
}

export interface RuntimeManifestResult {
  deploymentId: string;
  deviceId: string;
  resolutionMode: 'logical' | 'legacy';
  manifest: unknown;
}

export interface DeploymentEntity {
  id: string;
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate?: string | null;
  devices?: unknown[];
  branding?: unknown[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// GET /deployments/:id/schedule-table
// ---------------------------------------------------------------------------

export interface DeploymentScheduleTableQuery {
  rotationStartDate: string;
  days?: number;
  fromDate?: string;
}

export interface DeploymentScheduleTableColumn {
  key: string;
  label: string;
  group?: string | null;
  libraryType?: string | null;
  /** Wall / No Wall / Fitness / Golf — shown under Phase 1 headers and in cells. */
  variantLabel?: string | null;
}

export interface DeploymentScheduleTableCell {
  title?: string | null;
  thumbnail?: string | null;
  assigned?: boolean;
  mediaVersionId?: string | null;
}

export interface DeploymentScheduleTableRow {
  day: number;
  dayLabel: string;
  dateLabel: string;
  rotationDay: number;
  cells: Record<string, DeploymentScheduleTableCell | null | undefined>;
}

export interface DeploymentScheduleTable {
  deploymentId: string;
  deploymentType: string;
  fieldCategory: string;
  exerciseVariant: string;
  rotationStartDate: string;
  days: number;
  columns: DeploymentScheduleTableColumn[];
  rows: DeploymentScheduleTableRow[];
}
