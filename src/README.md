# H2Blog Source Structure

This document outlines the organization of the H2Blog project's source code.

## Directory Structure

```
src/
├── assets/        # Static assets like images, icons, etc.
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── layouts/       # Layout components that structure the app
├── pages/         # Page components that correspond to routes
├── router/        # Routing configuration
├── services/      # API services and other business logic
├── style/         # Global styles and style utilities
```

## Organizational Guidelines

### Pages vs Components

- **Pages**: Components that represent entire routes/screens in the application. These are used directly in the router.
  - Located in: `src/pages/`
  - Example: `Home`, `Login`, `NotFound`

- **Components**: Reusable UI elements that can be used across multiple pages.
  - Located in: `src/components/`
  - Example: `Button`, `Card`, `Navigator`

### File Naming Conventions

1. Use PascalCase for component files and directories
   - Example: `BlogCard.tsx`, `NavigationBar.tsx`

2. Each component should be in its own directory with its related files
   - Example:
     ```
     Button/
     ├── Button.tsx
     ├── Button.scss
     ├── Button.test.tsx (optional)
     └── index.ts        (exports the component)
     ```

3. Use index.ts files to simplify imports
   - Example: `import Button from '@/components/Button'` instead of `import Button from '@/components/Button/Button'`

### Import Guidelines

1. Use absolute imports with the `@/` prefix
   - Example: `import Button from '@/components/Button'`

2. Order imports as follows:
   - React/library imports
   - Component imports
   - Asset/style imports

### Creating New Pages

When creating a new page:

1. Create a new directory in `src/pages/`
2. Create your page component files (TSX, SCSS, etc.)
3. Create an `index.ts` file that exports the main component
4. Add the route to `src/router/index.tsx`

### Creating New Components

When creating a new reusable component:

1. Create a new directory in `src/components/`
2. Create your component files (TSX, SCSS, etc.)
3. Create an `index.ts` file that exports the component
4. Use the component in your pages or other components

## Best Practices

1. Keep components focused on a single responsibility
2. Extract reusable logic into custom hooks in the `hooks/` directory
3. Keep page components focused on layout and data fetching, delegating UI rendering to smaller components
4. Use layouts for consistent page structures
5. Keep styling modular by using component-specific SCSS files 