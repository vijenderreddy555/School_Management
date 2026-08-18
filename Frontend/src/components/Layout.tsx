import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const items = isAuthenticated
    ? [
        { label: 'Student Directory', icon: 'pi pi-users', command: () => navigate('/students') },
        { label: 'New Admission', icon: 'pi pi-plus', command: () => navigate('/students/new') },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Menubar
        model={items}
        start={<span className="font-bold px-2">School Management</span>}
        end={
          isAuthenticated ? (
            <div className="flex items-center gap-3 px-2">
              <span className="text-sm text-gray-600">{role}</span>
              <Button
                label="Logout"
                icon="pi pi-sign-out"
                text
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              />
            </div>
          ) : null
        }
      />
      <main>{children}</main>
    </div>
  );
}
