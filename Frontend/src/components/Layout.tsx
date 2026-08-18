import { useRef, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Student Directory', icon: 'pi pi-users', to: '/students' },
  { label: 'New Admission', icon: 'pi pi-user-plus', to: '/students/new' },
];

const ROLE_LABELS: Record<string, string> = {
  REGISTRAR: 'Registrar',
  ADMISSIONS_ADMIN: 'Admissions Admin',
  SYSTEM_ADMIN: 'System Admin',
  TEACHER: 'Teacher',
};

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const userMenu = useRef<Menu>(null);

  if (!isAuthenticated) {
    return <main className="min-h-screen">{children}</main>;
  }

  const userMenuItems = [
    {
      label: role ? ROLE_LABELS[role] ?? role : '',
      items: [
        {
          label: 'Sign Out',
          icon: 'pi pi-sign-out',
          command: () => {
            logout();
            navigate('/login');
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-bg)' }}>
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 text-white"
        style={{ background: 'linear-gradient(180deg, var(--brand-900), var(--brand-800))' }}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <i className="pi pi-building text-lg" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-wide">SCHOOL MGMT</div>
            <div className="text-[11px] text-indigo-200">Admissions Suite</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
          <span className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Student Records
          </span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-indigo-100 hover:bg-white/10'
                }`
              }
            >
              <i className={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-[11px] text-indigo-300">
          v1.0 &middot; Student Information &amp; Admission Management
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <i className="pi pi-home" />
            <span>/</span>
            <span className="text-gray-800 font-medium">Student Management</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-medium text-gray-600">
              {role ? ROLE_LABELS[role] ?? role : ''}
            </span>
            <Avatar
              label={role ? role.charAt(0) : 'U'}
              shape="circle"
              style={{ backgroundColor: 'var(--brand-600)', color: '#fff', cursor: 'pointer' }}
              onClick={(e) => userMenu.current?.toggle(e)}
            />
            <Menu model={userMenuItems} popup ref={userMenu} popupAlignment="right" />
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

