# Overview
Story Learner AI is an application that allows the user to translate their favorite stories into a level suitable for their language level.

More detailed information is available in the [docs](/docs/table-of-contents.md) folder

## Getting Started
`nvm use`
`npm install`
`npm run dev`

Access the FE on `http://localhost:5173/`

## CSS Architecture & Strategy

### Overview
This project uses a modern CSS architecture built on **Tailwind CSS** with **Shadcn/ui** components, providing a scalable, maintainable, and type-safe styling system.

### Core Technologies

#### 🎨 **Tailwind CSS**
- **Utility-first CSS framework** for rapid UI development
- **Custom theme configuration** with CSS variables for dynamic theming
- **Dark mode support** with class-based toggling
- **Animation utilities** via `tailwindcss-animate`

#### 🧩 **Shadcn/ui Component System**
- **Headless UI components** built on Radix UI primitives
- **Class Variance Authority (CVA)** for type-safe component variants
- **Accessible by default** with proper ARIA attributes
- **Customizable** through CSS variables and Tailwind configuration

### Theme System

#### **CSS Variables Architecture**
```css
:root {
  --background: 203 100% 96.1%;    /* Sky-50 */
  --primary: 203 100% 57.3%;       /* Sky-500 */
  --secondary: 203 100% 86%;       /* Sky-100 */
  /* ... comprehensive color system */
}
```

#### **Color Palette**
- **Primary**: Sky blue variations for brand consistency
- **Semantic colors**: Background, foreground, muted, accent, destructive
- **Chart colors**: Dedicated palette for data visualization
- **Auto dark mode**: Automatic color adjustments for dark theme

### Component Patterns

#### **Modern Shadcn/ui Pattern** (Recommended)
```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { default: "...", sm: "...", lg: "..." }
    }
  }
)
```

#### **Utility Function**
```tsx
import { cn } from "@/lib/utils"

// Combines clsx + tailwind-merge for conflict resolution
<Button className={cn("custom-classes", conditionalClass)} />
```

### File Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components (Shadcn/ui)
│   └── story/           # Feature-specific components
├── lib/
│   └── utils.ts         # Styling utilities (cn function)
└── index.css           # Global styles + CSS variables
```

### Development Guidelines

#### **Component Development**
1. **Use Shadcn/ui patterns** for new components
2. **Leverage CVA** for variant management
3. **Apply semantic color tokens** instead of hardcoded colors
4. **Include proper TypeScript types** for component props

#### **Styling Best Practices**
- ✅ Use CSS variables for theming (`bg-background`, `text-foreground`)
- ✅ Employ `cn()` function for conditional classes
- ✅ Create component variants with CVA
- ✅ Follow Tailwind's utility-first approach
- ❌ Avoid hardcoded Tailwind colors in components
- ❌ Don't bypass the theme system

#### **Migration Strategy**
Currently migrating from legacy patterns to Shadcn/ui:
- **Modern**: Button component (✅ Complete)
- **Legacy**: TextArea component (⚠️ Needs migration)
- **Goal**: Consistent Shadcn/ui architecture across all components

### Key Dependencies
```json
{
  "tailwindcss": "^3.4.14",
  "class-variance-authority": "^0.7.0",
  "tailwind-merge": "^2.5.4",
  "clsx": "^2.1.1",
  "@radix-ui/react-slot": "^1.1.0",
  "lucide-react": "^0.454.0"
}
```

### Benefits
- **Type Safety**: Full TypeScript support with proper component props
- **Accessibility**: Built-in ARIA support via Radix UI
- **Performance**: Optimized class generation and conflict resolution
- **Developer Experience**: Consistent patterns and excellent tooling
- **Maintainability**: Centralized theme configuration and reusable components

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
