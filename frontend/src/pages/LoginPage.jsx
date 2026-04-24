import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/services/api';
import { cyReplaceSpecial } from '@/utils/cy';

export function LoginPage() {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
      navigate('/appointments');
    } catch (err) {
      setError(err.message ?? 'Invalid credentials');
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-civic-dark">Sign in</h1>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <TextField
          keyName="login_EmailInput_email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          keyName="login_PasswordInput_password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p
            data-cy={cyReplaceSpecial('login_error')}
            className="text-sm text-red-600"
          >
            {error}
          </p>
        )}
        <Button keyName="login_submit_button" type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm text-civic-muted">
        No account?{' '}
        <Link
          to="/register"
          data-cy="nav_register"
          className="text-civic-blue hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
