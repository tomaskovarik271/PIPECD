import React from 'react';
import { useThemeStore, ThemeMode } from '../../stores/useThemeStore';
import { IconButton, useColorMode, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import { SunIcon, MoonIcon, ChevronDownIcon, StarIcon } from '@chakra-ui/icons';

const ThemeSwitcher: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setCurrentTheme = useThemeStore((state) => state.setCurrentTheme);
  const { setColorMode } = useColorMode();

  // Chakra's useColorMode can still be useful for components that inherently use it,
  // but our primary theme switching is now manual via Zustand.
  // We might not need toggleColorMode directly if our themes explicitly set colors.
  // const { colorMode, toggleColorMode } = useColorMode(); 

  const handleThemeChange = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    // For Chakra's internal mode, Ocean Breeze, Bowie & Industrial are considered 'light' or 'dark'
    // based on their overall brightness. Bowie & Industrial are dark-based.
    let chakraColorMode: 'light' | 'dark';
    if (newTheme === 'dark' || newTheme === 'bowie' || newTheme === 'industrialMetal' || newTheme === 'daliDark') {
      chakraColorMode = 'dark';
    } else {
      chakraColorMode = 'light';
    }
    setColorMode(chakraColorMode);
  };

  const getThemeIcon = (theme: ThemeMode) => {
    if (theme === 'light') return <SunIcon />;
    if (theme === 'dark') return <MoonIcon />;
    if (theme === 'daliDark') return <Text as="span">👁️</Text>; // Dali Eye Icon
    if (theme === 'bowie') return <Text as="span">⚡</Text>;
    if (theme === 'industrialMetal') return <Text as="span">⚙️</Text>;
    if (theme === 'andyWarhol') return <Text as="span">🥫</Text>;
    return <ChevronDownIcon />; // Fallback for button
  };

  const themeLabels: Record<ThemeMode, string> = {
    light: 'Light Mode',
    dark: 'Dark Mode',
    daliDark: 'Dark Salvador Dali', // Renamed and relabeled
    bowie: 'David Bowie',
    industrialMetal: 'Industrial Metal',
    andyWarhol: 'Andy Warhol',
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Select theme"
        icon={getThemeIcon(currentTheme)}
        variant="ghost"
      />
      <MenuList>
        {(Object.keys(themeLabels) as ThemeMode[]).map((themeKey) => (
          <MenuItem
            key={themeKey}
            icon={getThemeIcon(themeKey)}
            onClick={() => handleThemeChange(themeKey)}
            fontWeight={currentTheme === themeKey ? 'bold' : 'normal'}
          >
            {themeLabels[themeKey]}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeSwitcher; 