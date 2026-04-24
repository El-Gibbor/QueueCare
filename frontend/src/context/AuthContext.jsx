import { createContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload.user, token: action.payload.token };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  // Lazy initializer rehydrates auth state from localStorage so a refresh keeps you logged in.
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    const token = localStorage.getItem('qc_token');
    const user = localStorage.getItem('qc_user');
    return token && user ? { token, user: JSON.parse(user) } : initialState;
  });

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('qc_token', state.token);
      localStorage.setItem('qc_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('qc_token');
      localStorage.removeItem('qc_user');
    }
  }, [state.token, state.user]);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}
