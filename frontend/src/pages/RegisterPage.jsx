import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField } from '@/components/TextField';
import { Dropdown } from '@/components/Dropdown';
import { Button } from '@/components/Button';
import { register } from '@/services/api';
import { cyReplaceSpecial } from '@/utils/cy';

const ROLE_OPTIONS = [
  { value: 'patient', labelId: 'patient', label: 'Patient' },
  { value: 'staff', labelId: 'staff', label: 'Staff' },
  { value: 'admin', labelId: 'admin', label: 'Admin' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [error, setError] = useState('');

  function set(field) {
    return (e) =>
      setForm((f) => ({ ...f, [field]: typeof e === 'string' ? e : e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message ?? 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-civic-dark">Create account</h1>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <TextField
          keyName="register_TextField_name"
          label="Full name"
          value={form.name}
          onChange={set('name')}
          required
        />
        <TextField
          keyName="register_EmailInput_email"
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          required
        />
        <TextField
          keyName="register_PasswordInput_password"
          label="Password"
          type="password"
          value={form.password}
          onChange={set('password')}
          required
        />
        <TextField
          keyName="register_PasswordInput_confirmPassword"
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          required
        />
        <Dropdown
          keyName="register_Dropdown_role"
          label="Role"
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={set('role')}
        />
        {error && (
          <p
            data-cy={cyReplaceSpecial('register_error')}
            className="text-sm text-red-600"
          >
            {error}
          </p>
        )}
        <Button keyName="register_submit_button" type="submit" className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-sm text-civic-muted">
        Already registered?{' '}
        <Link
          to="/login"
          data-cy="nav_login"
          className="text-civic-blue hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
