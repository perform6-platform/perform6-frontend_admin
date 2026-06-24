import { cn } from '../../lib/cn';
import { deploymentSteps } from '../../lib/deploymentHelpers';

export interface DeploymentStepperProps {
  currentStep: number;
  className?: string;
}

export function DeploymentStepper({ currentStep, className }: DeploymentStepperProps) {
  return (
    <ol className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      {deploymentSteps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = step.id < currentStep;

        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold',
                  isActive || isComplete
                    ? 'bg-brand-600 text-white'
                    : 'border border-surface-border bg-surface-muted text-content-muted',
                )}
              >
                {step.id}
              </span>
              <span
                className={cn(
                  'hidden text-body-sm font-medium sm:inline',
                  isActive ? 'text-content-primary' : 'text-content-secondary',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < deploymentSteps.length - 1 && (
              <span className="hidden h-px w-6 bg-surface-border sm:block lg:w-10" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
