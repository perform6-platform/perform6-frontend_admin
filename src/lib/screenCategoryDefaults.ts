/** Maps DEFAULT_DEPLOYMENT screens → parent content_categories.slug (scope-aware resolve at runtime). */

export const DEFAULT_DEPLOYMENT_SCREENS = [
  { screenKey: 'SCREEN_1', label: 'Screen 1', clusterLabel: 'Player A (DEVICE_A)' },
  { screenKey: 'SCREEN_2', label: 'Screen 2', clusterLabel: 'Player B (DEVICE_B)' },
  { screenKey: 'SCREEN_3', label: 'Screen 3', clusterLabel: 'Player C (DEVICE_C)' },
] as const;

export type DefaultScreenKey = (typeof DEFAULT_DEPLOYMENT_SCREENS)[number]['screenKey'];

/** Parent category slugs for the classic 3-screen DEFAULT layout. */
export function resolveDefaultScreenCategorySlugs(
  _fieldCategory?: string,
  _exerciseVariant?: string,
): Record<DefaultScreenKey, string> {
  return {
    SCREEN_1: 'start-here',
    SCREEN_2: 'phase-1',
    SCREEN_3: 'phase-2',
  };
}

/** @deprecated Prefer resolveDefaultScreenCategorySlugs — kept for any legacy imports. */
export function resolveDefaultScreenLibraryTypes(
  fieldCategory: string,
  exerciseVariant: string,
): Record<DefaultScreenKey, string> {
  return resolveDefaultScreenCategorySlugs(fieldCategory, exerciseVariant);
}
