import React from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { IconButton, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const ThemeSwitcher: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setCurrentTheme = useThemeStore((state) => state.setCurrentTheme);
  const { setColorMode } = useColorMode();

  // Chakra's useColorMode can still be useful for components that inherently use it,
  // but our primary theme switching is now manual via Zustand.
  // We might not need toggleColorMode directly if our themes explicitly set colors.
  // const { colorMode, toggleColorMode } = useColorMode(); 

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setColorMode(newTheme);
    // If we still want to synchronize with Chakra's internal color mode for 
    // any components that might rely on it directly:
    // if ((newTheme === 'dark' && colorMode === 'light') || (newTheme === 'light' && colorMode === 'dark')) {
    //   toggleColorMode();
    // }
  };

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleTheme}
      variant="ghost"
    />
  );
};

export default ThemeSwitcher; 