import { NavLink, Outlet } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/devices', label: 'Devices' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-slate-200 bg-white p-4">
        <h1 className="mb-8 text-lg font-bold text-sky-600">Perform6</h1>
        <nav className="flex flex-col gap-2">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? 'bg-sky-50 font-medium text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
