import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewDeploymentForm } from '../components/deployments/NewDeploymentForm';
import { Button, PageTitle } from '../components/ui';

export default function Deployments() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <PageTitle>Deployments</PageTitle>
          <p className="mt-1 text-body-sm text-content-secondary">
            Configure type, category, variant, pick a claimed device, set branding, and register.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="h-9 w-full shrink-0 gap-2 px-4 sm:w-auto"
          onClick={() => navigate('/rotation-schedule')}
        >
          <CalendarDays className="h-4 w-4" />
          View Schedule
        </Button>
      </div>

      <NewDeploymentForm />
    </div>
  );
}
