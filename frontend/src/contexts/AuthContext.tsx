import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Envoyer les cookies httpOnly sur chaque requête cross-origin
axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  profilePicture?: string;
  profileCompletionPercentage?: number;
  preferredLanguage?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);

  // Au chargement : vérifier l'état auth via le cookie httpOnly (transparent)
  useEffect(() => {
    axios
      .get(`${API_URL}/me`)
      .then((res) => {
        if (res.data.success) setUser(res.data.data);
      })
      .catch(() => {
        // Pas de cookie valide → non connecté, état normal
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data.success) {
        // Le backend a posé les cookies httpOnly — on stocke uniquement l'objet user en mémoire
        setUser(response.data.data.user);
        return true;
      }
      return false;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
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
        setUser(response.data.data.user);
        return true;
      }
      return false;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Appel backend pour révoquer les tokens et effacer les cookies côté serveur
    axios.post(`${API_URL}/logout`).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
