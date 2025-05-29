import { ThemeConfig, extendTheme, StyleFunctionProps } from '@chakra-ui/react';
import { baseThemeConfig } from './theme.config'; // Import baseThemeConfig
import { cdColors as importedCdColors } from './theme.colors'; // Import cdColors

// Export the imported cdColors
export const cdColors = importedCdColors;

// Creative Dock Specific Colors based on Visual Identity Guidelines

// Export the imported base config as 'config' for compatibility
export const config: ThemeConfig = baseThemeConfig;

// Import themes from their individual files
// import { creativeDockLightTheme } from './themes/creativeDockLightTheme'; // Removed
// import { creativeDockDarkTheme } from './themes/creativeDockDarkTheme'; // Removed
// import { daliDarkTheme } from './themes/daliDarkTheme'; // Removed
// import { bowieTheme } from './themes/bowieTheme'; // Removed
import { industrialMetalTheme } from './themes/industrialMetalTheme';
// import { andyWarholTheme } from './themes/andyWarholTheme'; // Removed
import { creativeDockModernTheme } from './themes/creativeDockModernTheme';
import { creativeDockLightModernTheme } from './themes/creativeDockLightModernTheme';  // NEW: Import light modern theme

// Export only the allowed themes
export const themes = {
  modern: creativeDockModernTheme,
  lightModern: creativeDockLightModernTheme,  // NEW: Add light modern theme
  industrialMetal: industrialMetalTheme,
};

// Define an array of available themes for easier use in components like ThemeSwitcher
export const availableThemes = [
  { key: 'modern', name: 'Modern Dark' , theme: creativeDockModernTheme },
  { key: 'lightModern', name: 'Modern Light', theme: creativeDockLightModernTheme },  // NEW: Add light modern option
  { key: 'industrialMetal', name: 'Industrial Metal', theme: industrialMetalTheme },
];

// Update default export to one of the remaining themes
export default creativeDockModernTheme; 