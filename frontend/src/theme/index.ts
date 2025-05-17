import { ThemeConfig, extendTheme, StyleFunctionProps } from '@chakra-ui/react';
import { baseThemeConfig } from './theme.config'; // Import baseThemeConfig
import { cdColors as importedCdColors } from './theme.colors'; // Import cdColors

// Export the imported cdColors
export const cdColors = importedCdColors;

// Creative Dock Specific Colors based on Visual Identity Guidelines

// Export the imported base config as 'config' for compatibility
export const config: ThemeConfig = baseThemeConfig;

// Import themes from their individual files
import { creativeDockLightTheme } from './themes/creativeDockLightTheme';
import { creativeDockDarkTheme } from './themes/creativeDockDarkTheme';
import { daliDarkTheme } from './themes/daliDarkTheme';
import { bowieTheme } from './themes/bowieTheme';
import { industrialMetalTheme } from './themes/industrialMetalTheme';
import { andyWarholTheme } from './themes/andyWarholTheme';

// Export all themes
export const themes = {
  light: creativeDockLightTheme,
  dark: creativeDockDarkTheme,
  daliDark: daliDarkTheme,
  bowie: bowieTheme,
  industrialMetal: industrialMetalTheme,
  andyWarhol: andyWarholTheme,
};

// Default export for compatibility
export default creativeDockLightTheme; 