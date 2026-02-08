# Color System Documentation

## Overview
Centralized color management system untuk Rukun Ternak aplikasi.

**File utama:**
- `src/utils/colors.js` - Color palette dan utilities
- `src/context/ThemeProvider.jsx` - Theme provider
- `tailwind.config.js` - Tailwind color configuration

## Setup

### 1. Wrap App dengan ThemeProvider (App.jsx)
```jsx
import ThemeProvider from './context/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Routes */}
      </Router>
    </ThemeProvider>
  );
}
```

## Usage

### Option 1: Gunakan Tailwind Classes (Recommended)
```jsx
import React from 'react';

function MyComponent() {
  return (
    <>
      {/* Primary color */}
      <button className="bg-primary-700 text-white hover:bg-primary-800">
        Submit
      </button>

      {/* Status colors */}
      <div className="bg-success-bg text-success border border-success rounded-lg">
        Success message
      </div>

      {/* Danger */}
      <div className="bg-danger-bg text-danger border border-danger rounded-lg">
        Error message
      </div>
    </>
  );
}
```

### Option 2: Import colors.js untuk dynamic colors
```jsx
import { colors, colorUtils } from '../utils/colors';

function StatusBadge({ status }) {
  const statusColor = colorUtils.getAnimalStatusColor(status);
  
  return (
    <span className={statusColor.badge}>
      {status}
    </span>
  );
}

function UserRoleBadge({ role }) {
  const roleColor = colorUtils.getRoleColor(role);
  
  return (
    <span style={{ color: roleColor, backgroundColor: `${roleColor}20` }}>
      {role}
    </span>
  );
}
```

### Option 3: Gunakan CSS Variables
```jsx
function CustomComponent() {
  return (
    <div style={{
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      padding: '1rem',
      borderRadius: '0.5rem'
    }}>
      Content
    </div>
  );
}
```

## Available Colors

### Primary Colors
```js
colors.primary          // #0369a1 (Main blue)
colors.primaryLight     // #38bdf8 (Light blue)
colors.primaryDark      // #0c4a6e (Dark blue)
```

### Status Colors
```js
colors.success         // #10b981 (Emerald)
colors.error           // #ef4444 (Red)
colors.warning         // #f59e0b (Amber)
colors.info            // #3b82f6 (Blue)
```

### Utilities
```js
colorUtils.getStatusColor(status)      // Get color object untuk status
colorUtils.getRoleColor(role)           // Get color untuk user role
colorUtils.getAnimalStatusColor(status) // Get color untuk animal status
```

## Tailwind Classes

### Text Colors
```html
<div class="text-primary">Primary text</div>
<div class="text-success">Success text</div>
<div class="text-danger">Danger text</div>
<div class="text-warning">Warning text</div>
<div class="text-info">Info text</div>
<div class="text-muted">Muted text</div>
```

### Background Colors
```html
<div class="bg-primary">Primary background</div>
<div class="bg-success">Success background</div>
<div class="bg-success-bg">Success light background</div>
<div class="bg-danger-bg">Danger light background</div>
```

### Primary Color Shades
```html
<div class="bg-primary-50">Very light</div>
<div class="bg-primary-100">Light</div>
<div class="bg-primary-700">Main (Default)</div>
<div class="bg-primary-900">Very dark</div>
```

## Common Patterns

### Alert/Notification Boxes
```jsx
import { colorUtils } from '../utils/colors';

function Alert({ type, message }) {
  const color = colorUtils.getStatusColor(type);
  
  return (
    <div className={`rounded-lg p-4 border`} style={{
      backgroundColor: color.bg,
      borderColor: color.border,
      color: color.text
    }}>
      {message}
    </div>
  );
}

// Usage:
<Alert type="success" message="Data saved successfully!" />
<Alert type="error" message="Failed to update data" />
<Alert type="warning" message="Please review changes" />
```

### Status Badges
```jsx
function StatusBadge({ status }) {
  const colors = {
    AKTIF: 'bg-green-100 text-green-800',
    TIDAK_AKTIF: 'bg-gray-100 text-gray-800',
    TERJUAL: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
```

### Button Variants
```jsx
// Primary button
<button className="bg-primary-700 text-white hover:bg-primary-800 px-4 py-2 rounded-lg">
  Primary
</button>

// Secondary button
<button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg">
  Secondary
</button>

// Danger button
<button className="bg-danger text-white hover:bg-red-600 px-4 py-2 rounded-lg">
  Delete
</button>
```

## Performance Benefits

✅ **Reduced CSS duplication** - Single source of truth  
✅ **Easier maintenance** - Change one place, updates everywhere  
✅ **Faster development** - Predefined colors ready to use  
✅ **Consistent UX** - Same colors across application  
✅ **Tree-shakeable** - Unused colors removed by bundler  
✅ **CSS-in-JS optimization** - Minimal CSS generated  
✅ **Small bundle size** - Less duplicate color definitions  

## Example: Before vs After

### ❌ BEFORE (Multiple places):
```jsx
// Component A
<div className="bg-blue-600 text-white">...</div>

// Component B
<div style={{ backgroundColor: '#0284c7', color: 'white' }}>...</div>

// Component C
const colors = { bg: '#0369a1' };
<div style={{ backgroundColor: colors.bg }}>...</div>
```

### ✅ AFTER (Single source):
```jsx
import { colors } from '../utils/colors';

// Component A, B, C
<div className="bg-primary-700 text-white">...</div>
// atau
<div style={{ backgroundColor: colors.primary }}>...</div>
```

## Adding New Colors

Untuk menambah warna baru, edit `src/utils/colors.js`:

```js
export const colors = {
  // ... existing colors
  newColor: '#hexa-code',
};
```

Lalu update `tailwind.config.js` jika perlu Tailwind class.

## Theming Support

Untuk dark mode atau theme switching di masa depan, struktur ini sudah siap:

```jsx
// Future enhancement
const themes = {
  light: { /* existing colors */ },
  dark: { /* dark mode colors */ }
};
```
