import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Registrar', username: 'registrar', password: 'Registrar@123' },
  { role: 'Admissions Admin', username: 'admissions', password: 'Admissions@123' },
  { role: 'System Admin', username: 'admin', password: 'Admin@123' },
  { role: 'Teacher', username: 'teacher', password: 'Teacher@123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/students');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-900), var(--brand-600))' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <i className="pi pi-building text-xl" />
          </div>
          <span className="font-bold tracking-wide">SCHOOL MGMT</span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Student Information &amp;<br /> Admission Management
          </h1>
          <p className="text-indigo-100 text-base max-w-md">
            A unified platform for registrars and administrators to manage enrollment,
            academic placement, and student lifecycle records securely and efficiently.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-indigo-100">
            <li className="flex items-center gap-2">
              <i className="pi pi-check-circle" /> Auto-generated student codes &amp; roll numbers
            </li>
            <li className="flex items-center gap-2">
              <i className="pi pi-check-circle" /> Role-based access &amp; audit history
            </li>
            <li className="flex items-center gap-2">
              <i className="pi pi-check-circle" /> Real-time section capacity management
            </li>
          </ul>
        </div>

        <span className="text-xs text-indigo-200">&copy; {new Date().getFullYear()} School Management Application</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to access the admissions console.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Message severity="error" text={error} className="w-full" />}
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <IconField iconPosition="left" className="w-full">
                <InputIcon className="pi pi-user" />
                <InputText
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  required
                />
              </IconField>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
                required
                className="w-full"
                inputClassName="w-full"
              />
            </div>
            <Button type="submit" label="Sign In" loading={loading} raised className="mt-2" />
          </form>

          <div className="app-card mt-8 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {DEMO_ACCOUNTS.map((acct) => (
                <div key={acct.username} className="flex flex-col">
                  <span className="font-semibold text-gray-800">{acct.role}</span>
                  <span>
                    {acct.username} / {acct.password}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

