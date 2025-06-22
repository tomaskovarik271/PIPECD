import React from 'react';
import { useThemeStore, ThemeMode } from '../../stores/useThemeStore';
import { IconButton, useColorMode, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import { SunIcon, MoonIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { availableThemes } from '../../theme'; // Import availableThemes

const ThemeSwitcher: React.FC = () => {
  const currentThemeKey = useThemeStore((state) => state.currentTheme);
  const setCurrentTheme = useThemeStore((state) => state.setCurrentTheme);
  const { setColorMode } = useColorMode();

  // Chakra's useColorMode can still be useful for components that inherently use it,
  // but our primary theme switching is now manual via Zustand.
  // We might not need toggleColorMode directly if our themes explicitly set colors.
  // const { colorMode, toggleColorMode } = useColorMode(); 

  const handleThemeChange = (newThemeKey: ThemeMode) => {
    setCurrentTheme(newThemeKey);
    // Set appropriate Chakra color mode based on theme
    if (newThemeKey === 'lightModern') {
      setColorMode('light');  // NEW: Use light mode for lightModern theme
    } else {
      setColorMode('dark');   // Use dark mode for other themes
    }
  };

  // Updated to use keys from availableThemes
  const getThemeIcon = (themeKey: ThemeMode) => {
    if (themeKey === 'modern') return <MoonIcon />;  // Dark theme gets moon icon
    if (themeKey === 'lightModern') return <SunIcon />;  // NEW: Light theme gets sun icon
    if (themeKey === 'industrialMetal') return <Text as="span">⚙️</Text>;
    return <ChevronDownIcon />; // Fallback for button if currentThemeKey is somehow invalid
  };

  // No longer need themeLabels if using availableThemes directly for name
  // const themeLabels: Record<ThemeMode, string> = {
  //   modern: 'Creative Dock Modern',
  //   industrialMetal: 'Industrial Metal',
  // };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Select theme"
        icon={getThemeIcon(currentThemeKey)}
        variant="ghost"
      />
      <MenuList
        // Optional: Style MenuList for modern theme if needed
        // bg={currentThemeKey === 'modern' ? 'gray.700' : undefined}
        // borderColor={currentThemeKey === 'modern' ? 'gray.600' : undefined}
      >
        {availableThemes.map((themeObj) => (
          <MenuItem
            key={themeObj.key as ThemeMode} // Cast key to ThemeMode
            icon={getThemeIcon(themeObj.key as ThemeMode)} // Cast key to ThemeMode
            onClick={() => handleThemeChange(themeObj.key as ThemeMode)} // Cast key to ThemeMode
            fontWeight={currentThemeKey === themeObj.key ? 'bold' : 'normal'}
            // Optional: Style MenuItem for modern theme if needed
            // _hover={currentThemeKey === 'modern' ? { bg: 'gray.600' } : {}}
            // color={currentThemeKey === 'modern' ? 'white' : undefined}
          >
            {themeObj.name} {/* Use name from availableThemes object */}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeSwitcher; 