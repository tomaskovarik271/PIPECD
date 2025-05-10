import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useAppStore, ThemeMode } from '../../stores/useAppStore';

const ThemeSwitcher: React.FC = () => {
  const currentTheme = useAppStore((state) => state.currentTheme);
  const setCurrentTheme = useAppStore((state) => state.setCurrentTheme);

  // Chakra's useColorMode can still be useful for components that inherently use it,
  // but our primary theme switching is now manual via Zustand.
  // We might not need toggleColorMode directly if our themes explicitly set colors.
  // const { colorMode, toggleColorMode } = useColorMode(); 

  const toggleTheme = () => {
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    // If we still want to synchronize with Chakra's internal color mode for 
    // any components that might rely on it directly:
    // if ((newTheme === 'dark' && colorMode === 'light') || (newTheme === 'light' && colorMode === 'dark')) {
    //   toggleColorMode();
    // }
  };

  return (
    <IconButton
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      icon={currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleTheme}
      variant="ghost"
    />
  );
};

export default ThemeSwitcher; 