import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  profile_picture?: string;
  profile_completion?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
  role?: 'candidate' | 'recruiter';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Configurer axios avec le token
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        // ✅ CORRECTION : Utiliser token au lieu de tokens.accessToken
        const { user: userData, token: accessToken } = response.data.data;

        // Sauvegarder dans le state
        setUser(userData);
        setToken(accessToken);

        // Sauvegarder dans localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Configurer axios avec le token
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/register`, {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        role: userData.role || 'candidate',
      });

      if (response.data.success) {
        // ✅ CORRECTION : Utiliser token au lieu de tokens.accessToken
        const { user: newUser, token: accessToken } = response.data.data;

        // Sauvegarder dans le state
        setUser(newUser);
        setToken(accessToken);

        // Sauvegarder dans localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Configurer axios avec le token
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Nettoyer le state
    setUser(null);
    setToken(null);

    // Nettoyer localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Nettoyer axios
    delete axios.defaults.headers.common['Authorization'];

    // Optionnel : appeler l'endpoint de logout du backend
    axios.post(`${API_URL}/logout`).catch(() => {
      // Ignorer les erreurs de logout
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};