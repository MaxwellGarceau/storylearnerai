# Tools

A collection of tools used in this project

## FE - libraries and build tools

- React
- TypeScript
- Vite v5.4.19 (Node.js 20.11.1 compatible)
- Vitest

### Styling/Components

- Shadcn/ui
  - Add components with `npx shadcn@latest add [options] [components...]`
- Tailwind/PostCSS
- Radix UI
  - [Color scheme](https://www.radix-ui.com/blog/themes-3)

## CI/CD Pipeline Tools

### GitHub Actions Workflow

- **4-stage pipeline**: Test → Build → Lighthouse → Performance Budget
- **Multi-Node testing**: Node.js 18 & 20 compatibility
- **Fail-fast behavior**: Immediate stop on any job failure
- **Label-based triggering**: Cost-optimized CI execution

### Testing & Quality Assurance

- **Vitest**: Unit and component testing framework
- **ESLint**: Code quality and style checking
- **TypeScript**: Type checking with `tsc --noEmit`
- **npm audit**: Security vulnerability scanning (high severity)
- **Codecov**: Test coverage reporting and tracking

### Performance & SEO Monitoring

- **Lighthouse CI**: Automated performance auditing
- **Core Web Vitals**: LCP, CLS, FCP, TBT monitoring
- **SEO validation**: Meta description, robots.txt, crawlability
- **Performance budgets**: 80% performance, 95% accessibility, 90% best practices, 90% SEO
- **Bundle analysis**: Size tracking and optimization alerts

### Build & Deployment

- **Vite**: Fast build tool with ES modules
- **Artifact management**: Build files (1-day retention), Lighthouse reports (7-day retention)
- **Static serving**: `serve` package for CI testing
- **GitHub Actions artifacts**: Automated upload/download

### Development Environment

- **Node.js**: 20.11.1 (development), 18 & 20 (CI testing)
- **npm**: Package management with `npm ci` for reproducible builds
- **GitHub CLI**: PR management and CI integration
