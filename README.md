# Overview
Story Learner AI is an application that allows the user to translate their favorite stories into a level suitable for their language level.

More detailed information is available in the [docs](/docs/table-of-contents.md) folder

## Getting Started

### Prerequisites
- Node.js (see `.nvmrc` for version)
- npm
- LLM API key (OpenAI, Anthropic, or custom provider)

### Setup
1. `nvm use`
2. `npm install`
3. Copy `env.example` to `.env` and configure your LLM settings:
   ```bash
   cp env.example .env
   ```
4. Edit `.env` with your LLM provider configuration
5. `npm run dev`

Access the FE on `http://localhost:5173/`

## LLM Service Configuration

### Overview
Story Learner AI uses a flexible LLM service system that supports multiple providers through a unified interface. The system is designed to be provider-agnostic, allowing you to easily switch between OpenAI, Anthropic, Google Gemini, or custom API endpoints.

### Supported Providers

#### OpenAI GPT
```bash
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=your-openai-api-key
VITE_LLM_ENDPOINT=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4o-mini
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

#### Anthropic Claude
```bash
VITE_LLM_PROVIDER=anthropic
VITE_LLM_API_KEY=your-anthropic-api-key
VITE_LLM_ENDPOINT=https://api.anthropic.com/v1
VITE_LLM_MODEL=claude-3-haiku-20240307
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

#### Google Gemini
```bash
VITE_LLM_PROVIDER=google
VITE_LLM_API_KEY=your-gemini-api-key
VITE_LLM_ENDPOINT=https://generativelanguage.googleapis.com/v1
VITE_LLM_MODEL=gemini-pro
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

#### Meta Llama
```bash
VITE_LLM_PROVIDER=llama
VITE_LLM_API_KEY=your-llama-api-key-or-none-for-ollama
VITE_LLM_ENDPOINT=http://localhost:11434
VITE_LLM_MODEL=llama3.1:8b
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
VITE_LLAMA_PROVIDER=ollama
VITE_LLAMA_SYSTEM_PROMPT=You are a helpful assistant.
VITE_LLAMA_STOP_SEQUENCES=["<|end|>", "<|stop|>"]
```

##### Llama Provider Options:
- **ollama**: Local Ollama deployment (default endpoint: http://localhost:11434)
- **groq**: Groq cloud API (fast Llama inference)
- **together**: Together AI API
- **replicate**: Replicate API
- **custom**: Custom Llama-compatible endpoint

#### Custom API
```bash
VITE_LLM_PROVIDER=custom
VITE_LLM_API_KEY=your-custom-api-key
VITE_LLM_ENDPOINT=https://your-custom-endpoint.com/v1
VITE_LLM_MODEL=your-custom-model
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

### Architecture

The LLM service system follows a modular architecture:

- **LLMService (Abstract Base Class)**: Defines the contract for all LLM providers
- **Provider Implementations**: Concrete classes for OpenAI, Anthropic, Llama, and Custom APIs
- **LLMServiceFactory**: Creates service instances based on provider configuration
- **LLMServiceManager**: Singleton that manages the active LLM service and configuration
- **Environment Configuration**: Handles environment variable parsing and validation

### Adding New Providers

To add a new LLM provider:

1. Create a new service class extending `LLMService`
2. Implement the required methods (`generateCompletion`, `healthCheck`)
3. Add provider-specific configuration types
4. Update the `LLMServiceFactory` to handle the new provider

### Development Mode

In development mode, the translation service will use a mock implementation by default. To test with a real LLM provider, ensure your environment variables are properly configured and the service passes health checks.

## CI/CD Pipeline

### Overview
This project uses a comprehensive GitHub Actions CI/CD pipeline with **fail-fast behavior** and **automated tests** including security audits, performance monitoring, SEO validation, and multi-Node compatibility testing. The pipeline is designed with **cost optimization** in mind, using label-based triggering to conserve CI minutes.

### 🏷️ Triggering the Pipeline

#### **Label-Based Trigger**
1. **Create or update a Pull Request**
2. **Apply the `run-ci` label** to the PR:
   ```bash
   # Using GitHub CLI
   gh pr edit [PR-NUMBER] --add-label "run-ci"
   
   # Or via GitHub web interface:
   # Go to PR → Labels → Add "run-ci" label
   ```
3. **Monitor execution** in the Actions tab
4. **Remove label** when done to stop future CI runs and conserve minutes

### 🛠️ Local Testing (Before CI)

Run these commands locally to catch issues early:

```bash
# Security & dependencies
npm audit                    # Check for vulnerabilities
npm ci                      # Clean install

# Code quality
npx tsc --noEmit           # TypeScript type checking
npm run lint               # ESLint checks

# Testing
npm run test:once          # Unit & component tests
npm run test:coverage      # Tests with coverage

# Build verification
npm run build              # Production build

# CI/CD check (runs all checks locally)
npm run ci-check           # Run all CI checks locally
```

### 🔧 Development Workflow

#### **Pre-Push Checks**
Before pushing code, run all CI checks locally to catch errors early:

```bash
npm run ci-check
```

This script runs:
- ✅ **ESLint** - Code style and quality checks
- ✅ **TypeScript Build** - Type checking and compilation
- ✅ **Tests** - Complete test suite with coverage

You can also run individual checks:
```bash
npm run lint         # ESLint only
npm run build        # TypeScript build only
npm test -- --run    # Tests only
```

### 🚨 Troubleshooting

#### **Common Issues**
- **Security audit failures** → Run `npm audit fix` (high severity only)
- **TypeScript errors** → Check `tsc --noEmit` output
- **Test failures** → Run `npm run test:once` locally
- **Performance budget violations** → Optimize bundle size or adjust budgets in `lighthouserc.js`
- **SEO audit failures** → Check meta description in `index.html` and `robots.txt` in `public/`
- **Node.js compatibility** → Ensure Node.js 20.11.1+ (Vite v5.4.19 compatible)
- **Development server crashes** → Verify Node.js version and run `npm ci`

#### **SEO Requirements**
- ✅ **Meta description** present in `index.html`
- ✅ **Robots.txt** accessible at `/robots.txt`
- ✅ **Crawlable content** (no blocking CSS/JS)
- ✅ **Valid HTML structure** with proper headings

#### **Node.js Compatibility**
- **Supported**: Node.js 20.11.1+ (current project version)
- **Vite version**: v5.4.19 (compatible with Node.js 20.11.1)
- **Note**: Vite v7+ requires Node.js ^20.19.0 or >=22.12.0

#### **Getting Help**
- Check **Actions tab** for detailed logs
- Review **lighthouse reports** in artifacts (7-day retention)
- Compare **bundle analysis** output for size changes
- Verify **Node compatibility** across both versions tested
- Download **SEO audit results** from lighthouse artifacts

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
