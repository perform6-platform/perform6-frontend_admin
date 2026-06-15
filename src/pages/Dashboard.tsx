import {
  CalendarDays,
  MapPin,
  Monitor,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DonutChart, BarChart } from '../components/dashboard/Charts';
import { UpcomingRotationCard } from '../components/dashboard/UpcomingRotation';
import { quickActions } from '../constants/navigation';
import { cn } from '../lib/cn';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricCard,
  PageShell,
  QuickActionButton,
  SectionLabel,
  StatusDot,
} from '../components/ui';

const deviceStatusSegments = [
  { label: 'Online', value: 42, color: '#28C76F' },
  { label: 'Offline', value: 3, color: '#FF9F43' },
  { label: 'Error', value: 0, color: '#EA5455' },
];

const locationData = [
  { label: 'New York Gym', value: 12 },
  { label: 'Chicago Gym', value: 9 },
  { label: 'Dallas Gym', value: 8 },
  { label: 'Los Angeles Gym', value: 7 },
  { label: 'Miami Gym', value: 7 },
  { label: 'Boston Gym', value: 5 },
];

const recentActivity = [
  { device: 'BrightSign-001', action: 'Content Updated', time: '1 min ago', status: 'success' as const },
  { device: 'BrightSign-014', action: 'Device Online', time: '3 min ago', status: 'success' as const },
  { device: 'BrightSign-007', action: 'Sync Failed', time: '8 min ago', status: 'warning' as const },
  { device: 'BrightSign-022', action: 'Schedule Deployed', time: '12 min ago', status: 'success' as const },
  { device: 'BrightSign-003', action: 'Connection Lost', time: '18 min ago', status: 'danger' as const },
];

export default function Dashboard() {
  const navigate = useNavigate();

  function handleQuickAction(label: string) {
    if (label === 'Upload New Content') {
      navigate('/content-library', { state: { openUpload: true } });
      return;
    }
    if (label === 'Create New Schedule') {
      navigate('/rotation-schedule');
      return;
    }
    if (label === 'Deploy to Devices') {
      navigate('/deployments');
    }
  }

  return (
    <PageShell title="Dashboard">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          label="Total Devices"
          value="45"
          subtext="All BrightSign Devices"
          icon={<Monitor className="h-5 w-5" />}
        />
        <MetricCard
          label="Online Devices"
          value="42"
          subtext="93% Online"
          accent="success"
          icon={<Wifi className="h-5 w-5" />}
        />
        <MetricCard
          label="Offline Devices"
          value="3"
          subtext="7% Offline"
          accent="warning"
          icon={<WifiOff className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Locations"
          value="12"
          subtext="All Locations"
          icon={<MapPin className="h-5 w-5" />}
        />
        <MetricCard
          label="Today's Schedule"
          value="DAY 14"
          subtext="4-Day Rotation"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <MetricCard
          label="Last Sync"
          value="2 min ago"
          subtext="All Devices"
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart segments={deviceStatusSegments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices By Location</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={locationData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {recentActivity.map((item, index) => (
                <li
                  key={`${item.device}-${item.time}`}
                  className={cn(
                    'flex items-center gap-3 py-3',
                    index < recentActivity.length - 1 && 'border-b border-surface-border',
                  )}
                >
                  <StatusDot variant={item.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-content-primary">{item.device}</p>
                    <p className="text-caption text-content-secondary">{item.action}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-caption text-content-muted sm:text-caption">{item.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <UpcomingRotationCard />
      </section>

      <section>
        <SectionLabel className="mb-3 block">Quick Actions</SectionLabel>
        <div className="flex flex-col gap-3 sm:flex-row">
          {quickActions.map(({ label, icon: Icon }) => (
            <QuickActionButton
              key={label}
              label={label}
              icon={<Icon className="h-4 w-4" />}
              onClick={() => handleQuickAction(label)}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
