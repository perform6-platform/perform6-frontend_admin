import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { NewDeploymentModal } from '../components/deployments/NewDeploymentModal';
import {
  ActionMenu,
  Badge,
  Button,
  PageTitle,
  Pagination,
  Table,
  type TableColumn,
} from '../components/ui';
import {
  deploymentTabs,
  getDeploymentStatusLabel,
  getDeploymentStatusVariant,
  mockDeployments,
  type Deployment,
  type DeploymentStatus,
  type DeploymentTab,
} from '../constants/deployments';
import { cn } from '../lib/cn';

const PAGE_SIZE = 5;

export default function Deployments() {
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);
  const [activeTab, setActiveTab] = useState<DeploymentTab>('all');
  const [page, setPage] = useState(1);
  const [newDeploymentOpen, setNewDeploymentOpen] = useState(false);

  const filteredDeployments = useMemo(() => {
    if (activeTab === 'scheduled') {
      return deployments.filter((deployment) => deployment.status === 'scheduled');
    }
    return deployments;
  }, [activeTab, deployments]);

  const totalPages = Math.max(1, Math.ceil(filteredDeployments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedDeployments = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredDeployments.slice(start, start + PAGE_SIZE);
  }, [filteredDeployments, safePage]);

  function handleCreateDeployment(payload: {
    name: string;
    targetDevices: string;
    contentSchedule: string;
    status: DeploymentStatus;
    startedAt: string;
    completedAt: string;
  }) {
    setDeployments((current) => [
      {
        id: `dep-${Date.now()}`,
        name: payload.name,
        targetDevices: payload.targetDevices,
        contentSchedule: payload.contentSchedule,
        status: payload.status,
        startedAt: payload.startedAt,
        completedAt: payload.completedAt,
      },
      ...current,
    ]);
    setActiveTab('all');
    setPage(1);
  }

  const columns: TableColumn<Deployment>[] = [
    {
      key: 'name',
      header: 'Deployment Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'targetDevices',
      header: 'Target Devices',
      render: (row) => row.targetDevices,
    },
    {
      key: 'contentSchedule',
      header: 'Content / Schedule',
      render: (row) => <span className="text-content-secondary">{row.contentSchedule}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={getDeploymentStatusVariant(row.status)}>
          {getDeploymentStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'startedAt',
      header: 'Started',
      hideOnMobile: true,
      render: (row) => <span className="text-content-secondary">{row.startedAt}</span>,
    },
    {
      key: 'completedAt',
      header: 'Completed',
      hideOnMobile: true,
      render: (row) => <span className="text-content-secondary">{row.completedAt}</span>,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-10',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <ActionMenu
            items={[
              { value: 'view', label: 'View Details' },
              { value: 'retry', label: 'Retry Deployment' },
              { value: 'cancel', label: 'Cancel', variant: 'danger' },
            ]}
            onSelect={() => undefined}
            triggerLabel={`Actions for ${row.name}`}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageTitle>Deployments</PageTitle>
          <Button
            size="sm"
            className="h-9 shrink-0 gap-1.5 px-4"
            onClick={() => setNewDeploymentOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Deployment
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {deploymentTabs.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-body-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
                  isActive
                    ? 'ui-button-primary shadow-sm'
                    : 'border border-surface-border bg-surface-muted text-content-secondary hover:border-brand-500/20 hover:text-content-primary',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <Table
            columns={columns}
            data={paginatedDeployments}
            rowKey={(row) => row.id}
            emptyMessage="No deployments found"
          />

          <Pagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={filteredDeployments.length}
            onPageChange={setPage}
            entityLabel="deployments"
          />
        </div>
      </div>

      <NewDeploymentModal
        open={newDeploymentOpen}
        onClose={() => setNewDeploymentOpen(false)}
        onSubmit={handleCreateDeployment}
      />
    </>
  );
}
