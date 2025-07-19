# Advanced Svelte+Bun Example

This is a comprehensive example showcasing advanced features and patterns using Svelte 5 and Bun. It demonstrates modern web development practices including routing, data loading, state management, and beautiful UI components.

## Features

- 🛣️ **Advanced Routing** - Client-side routing with dynamic parameters and nested routes
- 📊 **Data Loading** - Efficient API data fetching with loading states and error handling
- 🔄 **State Management** - Reactive Svelte stores for global state management
- 🎨 **Modern UI** - Beautiful components with CSS custom properties and dark mode support
- 🔍 **Search & Filter** - Powerful search functionality across different data types
- 🖼️ **Photo Gallery** - Responsive image gallery with lazy loading
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- ⚡ **Performance** - Optimized with Bun's fast bundling and runtime

## Project Structure

```
src/
├── lib/
│   ├── api/           # API utilities and types
│   ├── components/    # Reusable UI components
│   └── stores/        # Svelte stores for state management
├── routes/            # Page components
├── styles/            # Global CSS styles
├── app.svelte         # Main app component
├── app.ts            # App entry point
└── router.ts         # Route configuration
```

## Pages & Routes

- **Home** (`/`) - Landing page with feature overview
- **Dashboard** (`/dashboard`) - Statistics and recent activity overview
- **Users** (`/users`) - Browse and search user profiles
- **User Detail** (`/users/:id`) - Individual user profile page
- **User Posts** (`/users/:id/posts`) - Posts by specific user
- **User Albums** (`/users/:id/albums`) - Albums by specific user
- **Posts** (`/posts`) - Browse all posts with search
- **Post Detail** (`/posts/:id`) - Individual post with comments
- **Albums** (`/albums`) - Browse photo albums
- **Album Detail** (`/albums/:id`) - Album photos gallery
- **Photos** (`/photos`) - All photos in a grid layout
- **Search** (`/search`) - Global search across all content types

## Key Components

### API Layer (`src/lib/api/`)

- Type-safe API client using JSONPlaceholder
- Error handling and loading states
- Generic data loading utilities

### State Management (`src/lib/stores/`)

- Reactive stores for different data types
- Search functionality with debouncing
- Theme management (light/dark mode)
- Notification system
- Local storage persistence

### UI Components (`src/lib/components/`)

- **LoadingSpinner** - Configurable loading indicator
- **ErrorMessage** - Error display with retry functionality
- **UserCard** - User profile card with actions
- **SearchBar** - Search input with clear functionality

### Styling (`src/styles/`)

- CSS custom properties for theming
- Dark mode support
- Responsive design utilities
- Modern component styles

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start development server:**
   ```bash
   bun run dev
   ```

3. **Build for production:**
   ```bash
   bun run build
   ```

The app will be available at `http://localhost:1337`.

## Data Source

This example uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as a mock REST API providing:

- 10 Users with profiles and contact information
- 100 Posts with titles and content
- 100 Albums organized by users
- 5000 Photos with thumbnails and full images

## Technical Highlights

### Routing

- File-based routing with dynamic parameters
- Programmatic navigation with `goto()`
- Route guards and navigation state management

### Data Loading

- Async data fetching with proper error handling
- Loading states and retry mechanisms
- Optimistic updates and caching strategies

### State Management

- Centralized state with Svelte stores
- Derived stores for computed values
- Reactive updates across components

### Styling

- CSS custom properties for consistent theming
- Dark mode with system preference detection
- Mobile-first responsive design
- Smooth animations and transitions

### Performance

- Lazy loading of images and content
- Debounced search to reduce API calls
- Efficient re-rendering with Svelte's reactivity

## Browser Support

This example uses modern web APIs and ES modules. It requires:

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

This example is part of the svelte-bun-poc project and is provided for educational purposes.
