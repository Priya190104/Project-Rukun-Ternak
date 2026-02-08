/**
 * Theme Provider - Apply color system globally
 * Inject CSS variables untuk konsistensi warna di seluruh aplikasi
 */

import React, { useEffect } from 'react';
import { cssVariables } from '../utils/colors';

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Apply CSS variables to document root
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
