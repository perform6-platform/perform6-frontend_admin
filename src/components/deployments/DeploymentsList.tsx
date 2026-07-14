import { useMemo, useState } from 'react';
import { Pencil, Search } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Pagination,
  SectionLabel,
} from '../ui';
import { useDeploymentsList } from '../../hooks/useDeployments';
import type { DeploymentEntity } from '../../types/deployments';
import { EditDeploymentModal } from './EditDeploymentModal';

const PAGE_SIZE = 10;

function brandingLabel(config?: Record<string, unknown>): string {
  const mode = config?.brandingMode;
  if (mode === 'CUSTOM') return 'Custom';
  if (mode === 'NONE') return 'None';
  return 'Platform default';
}

function formatLabel(value: string | undefined): string {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DeploymentsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [editing, setEditing] = useState<DeploymentEntity | null>(null);

  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
    }),
    [page, search],
  );

  const { data, isLoading, isError, refetch } = useDeploymentsList(query);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Registered deployments</SectionLabel>
            <p className="mt-1 text-caption text-content-secondary">
              Live list from the API — edit field, variant, branding, or name after register.
            </p>
          </div>
          <form
            className="flex w-full gap-2 sm:max-w-sm"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchDraft);
            }}
          >
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by name…"
              className="min-w-0 flex-1"
            />
            <Button type="submit" variant="outline" size="sm" className="h-10 shrink-0 gap-1.5 px-3">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        {isError ? (
          <EmptyState message="Failed to load deployments. Try refreshing." />
        ) : isLoading ? (
          <EmptyState message="Loading deployments…" />
        ) : items.length === 0 ? (
          <EmptyState message="No deployments yet. Complete the wizard above to register one." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="min-w-full text-left text-body-sm">
              <thead className="bg-surface-muted/60 text-caption uppercase tracking-wide text-content-muted">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Name</th>
                  <th className="px-3 py-2.5 font-medium">Type</th>
                  <th className="px-3 py-2.5 font-medium">Field</th>
                  <th className="px-3 py-2.5 font-medium">Variant</th>
                  <th className="px-3 py-2.5 font-medium">Devices</th>
                  <th className="px-3 py-2.5 font-medium">Branding</th>
                  <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((deployment) => (
                  <tr key={deployment.id} className="border-t border-surface-border">
                    <td className="px-3 py-3 font-medium text-content-primary">
                      {deployment.name || deployment.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-3 text-content-secondary">
                      {formatLabel(deployment.deploymentType)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="brand">{formatLabel(deployment.fieldCategory)}</Badge>
                    </td>
                    <td className="px-3 py-3 text-content-secondary">
                      {formatLabel(deployment.exerciseVariant)}
                    </td>
                    <td className="px-3 py-3 text-content-secondary">
                      {deployment.devices?.length ?? 0}
                    </td>
                    <td className="px-3 py-3 text-content-secondary">
                      {brandingLabel(deployment.config)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 px-2.5"
                        onClick={() => setEditing(deployment)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > PAGE_SIZE && (
          <Pagination
            page={meta.page}
            pageSize={meta.limit}
            total={meta.total}
            onPageChange={setPage}
            entityLabel="deployments"
          />
        )}
      </Card>

      <EditDeploymentModal
        open={editing !== null}
        deployment={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void refetch();
        }}
      />
    </>
  );
}
