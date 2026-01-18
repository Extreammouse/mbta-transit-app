import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    colorScheme: ColorScheme;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@mbta_theme_preference';

interface ThemeProviderProps {
    children: ReactNode;
}

export function AppThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useSystemColorScheme();
    const [userPreference, setUserPreference] = useState<ColorScheme | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved === 'light' || saved === 'dark') {
                    setUserPreference(saved);
                }
            } catch (error) {
                console.log('Failed to load theme preference:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadThemePreference();
    }, []);

    // Determine the effective color scheme
    const colorScheme: ColorScheme = userPreference ?? systemColorScheme ?? 'light';
    const isDarkMode = colorScheme === 'dark';

    const setDarkMode = async (enabled: boolean) => {
        const newScheme: ColorScheme = enabled ? 'dark' : 'light';
        setUserPreference(newScheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newScheme);
        } catch (error) {
            console.log('Failed to save theme preference:', error);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!isDarkMode);
    };

    // Don't render children until we've loaded the preference
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ colorScheme, isDarkMode, toggleDarkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within an AppThemeProvider');
    }
    return context;
}

// Re-export for convenience - this uses the app's theme preference
export function useColorScheme(): ColorScheme {
    const context = useContext(ThemeContext);
    // If not within provider, fall back to system preference
    if (context === undefined) {
        const systemScheme = useSystemColorScheme();
        return systemScheme ?? 'light';
    }
    return context.colorScheme;
}
