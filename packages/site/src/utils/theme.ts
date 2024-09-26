// theme.ts

import { getLocalStorage, setLocalStorage } from './localStorage';

/**
 * Get the user's preferred theme in local storage.
 * Will default to the browser's preferred theme if there is no value in local storage.
 *
 * @returns True if the theme is "dark", otherwise "light".
 */
export const getThemePreference = () => {
  if (typeof window === 'undefined') {
    return 'dark'; // Fallback in case window is not available
  }

  const darkModeSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const localStoragePreference = getLocalStorage('theme');
  const systemPreference = darkModeSystem ? 'dark' : 'light';
  const preference = localStoragePreference ?? systemPreference;

  // Apply the theme directly to the document's root class before anything else renders
  const root = document.documentElement;
  root.classList.remove('dark', 'light'); // Clean previous classes
  root.classList.add(preference); // Apply the detected theme

  if (!localStoragePreference) {
    setLocalStorage('theme', systemPreference); // Store the system preference if no local storage is found
  }

  return preference;
};

/**
 * Toggle the theme between light and dark.
 */
export const toggleTheme = () => {
  const currentTheme = getThemePreference();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Apply the new theme
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(newTheme);

  // Save the new theme to local storage
  setLocalStorage('theme', newTheme);
};

