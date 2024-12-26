import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../models/User';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('jwt_token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser);
        setIsAuthenticated(!!newUser);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return null; // veya bir loading spinner
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            setUser: handleSetUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 