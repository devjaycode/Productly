
## Introduction

Productly is a mobile application built using **Expo** for React Native development. It's a product management app, allowing users to view, search, add, and manage a list of products. The app leverages TypeScript for type safety, NativeWind (Tailwind CSS for React Native) for styling, and follows best practices for component-based architecture with context providers and custom hooks for state management.

It includes UI components for interactive elements like buttons, modals, and search bars, suggesting features such as product listing, adding new products via a bottom sheet, and toast notifications for user feedback.

This walkthrough provides a step-by-step guide to understanding, setting up, and navigating the codebase. It covers the repository structure, key files, and how the app components interact.

**Technologies Used:**

-   **Framework:** Expo (React Native)
-   **Language:** TypeScript
-   **Styling:** NativeWind (Tailwind CSS)
-   **Linting:** ESLint
-   **State Management:** React Context + Custom Hooks
-   **Other:** Metro bundler, Babel

## Prerequisites

Before diving in, ensure you have:

-   Node.js (v18+ recommended)
-   Expo CLI: npm install -g @expo/cli
-   A code editor like VS Code (note the .vscode directory for settings)
-   Expo Go app on your mobile device for testing

## Setup Instructions

1.  **Clone the Repository:**
    
    text
    
    ```
    git clone https://github.com/devjaycode/Productly.git
    cd Productly
    ```
    
2.  **Install Dependencies:** Run the following to install all packages (including Expo, React Native, NativeWind, etc.):
    
    text
    
    ```
    npm install
    ```
    
3.  **Start the Development Server:** Launch the app in development mode:
    
    text
    
    ```
    npx expo start
    ```
    
    -   Scan the QR code with Expo Go on iOS/Android.
    -   Or press w for web, a for Android emulator, i for iOS simulator.

**Troubleshooting:** If you encounter NativeWind issues, ensure tailwind.config.js is configured correctly and run npx expo start --clear to reset the cache.

## Repository Structure

The project follows a clean, modular structure typical of Expo apps with file-based routing. Here's a tree view of the key directories and files:

text

```
Productly/
├── .gitignore                  # Standard Git ignore rules
├── .vscode/                    # VS Code settings (e.g., extensions, tasks)
├── README.md                   # Project overview and setup guide (standard Expo template)
├── app.json                    # Expo configuration (app name, icons, orientation, etc.)
├── app/                        # Core app screens and layouts (file-based routing)
│   ├── _layout.tsx             # Root layout component (wraps all screens with providers)
│   └── index.tsx               # Home screen (product list view)
├── assets/                     # Static assets
│   └── images/                 # App icons, logos, and placeholders
│       ├── icon.png            # Main app icon
│       ├── splash-icon.png     # Splash screen icon
│       ├── react-logo.png      # React branding assets
│       ├── no-data.png         # Empty state image
│       └── ... (other icons)   # Android-specific icons, favicon
├── babel.config.js             # Babel configuration for transpilation
├── components/                 # Reusable UI components
│   ├── image-preview.tsx       # Component for previewing product images
│   ├── product-list-tile.tsx   # Tile/card for displaying individual products in a list
│   ├── modal/                  # Modal components directory
│   │   └── add-product-bottom-sheet.tsx  # Bottom sheet modal for adding new products
│   └── ui/                     # Atomic UI components
│       ├── bottom-sheet.tsx    # Reusable bottom sheet (e.g., for modals)
│       ├── button.tsx          # Custom button component
│       ├── empty-list.tsx      # Empty state component for lists
│       ├── fab.tsx             # Floating action button (e.g., to add products)
│       ├── input.tsx           # Text input field
│       ├── search-bar.tsx      # Search input with filtering
│       ├── toast.tsx           # Notification toast component
│       └── view-switcher.tsx   # Toggle between list/grid views
├── constants/                  # App-wide constants
│   └── color.ts                # Color palette definitions (e.g., primary, secondary colors)
├── contexts/                   # React Context providers
│   ├── products-provider.tsx   # Provider for global product state
│   └── toast-provider.tsx      # Provider for toast notifications
├── eslint.config.js            # ESLint configuration for code quality
├── global.css                  # Global styles (Tailwind directives)
├── hooks/                      # Custom React hooks
│   └── use-products-state.ts   # Hook for managing product data (CRUD operations)
├── metro.config.js             # Metro bundler configuration
├── nativewind-env.d.ts         # TypeScript declarations for NativeWind
├── package.json                # Project metadata, scripts, and dependencies
├── package-lock.json           # Locked dependency versions
├── tailwind.config.js          # Tailwind CSS configuration (themes, plugins)
├── tsconfig.json               # TypeScript configuration
└── types/                      # TypeScript type definitions
    └── product.type.ts         # Interface for Product data (e.g., id, name, thumbnail, price)
```

This structure promotes separation of concerns: screens in app/, UI in components/, state in contexts/ and hooks/, and shared assets/types in dedicated folders.

## Key Files and Components Explained

### 1. Configuration Files

-   **package.json**: Defines scripts (e.g., start), dependencies like expo, react-native, nativewind and dev dependencies like eslint, typescript. This is the entry point for npm/yarn commands.
-   **app.json**: Configures app metadata, such as name ("Productly"), slug, version, icon paths from assets/images, and platform-specific settings (e.g., android package name).
-   **tailwind.config.js**: Extends Tailwind with custom colors from constants/color.ts, fonts, and NativeWind-specific plugins for React Native compatibility.
-   **tsconfig.json**: Sets up TypeScript paths, strict mode, and JSX for React Native.

### 2. App Entry and Routing (app/)

-   **_layout.tsx**: The root layout wraps the entire app with providers (e.g., ProductsProvider, ToastProvider from contexts). It includes global navigation (e.g., Stack @expo-router).
-   **index.tsx**: The main screen, renders a product list using product-list-tile.tsx, a search bar, view switcher (list/grid), and FAB to open the add product modal. It consumes the products context and hook for data fetching/display.

### 3. State Management

-   **contexts/products-provider.tsx**: A React Context for sharing product data across components. Wraps the app and provides values like products array, loading state.
-   **hooks/use-products-state.ts**: Custom hook using useState for local product management (add, edit, delete). Integrates with context for global access.
-   **types/product.type.ts**: Defines the Product interface, e.g.:
    
    typescript
    
    ```
    export interface Product {
      id: string;
      name: string;
      price: number;
      thumbnail: string;
      description?: string;
    }
    ```
    

### 4. UI Components

-   **components/product-list-tile.tsx**: Renders a single product card with image, name, price, and actions (e.g., edit/delete). Uses Tailwind classes for responsive design.
-   **components/modal/add-product-bottom-sheet.tsx**: A modal triggered by FAB, using bottom-sheet.tsx for slide-up input form (name, price, thumbnail). Validates and adds to state via hook.
-   **components/ui/**: Atomic components:
    -   button.tsx: Styled pressable button with variants (primary, secondary).
    -   search-bar.tsx: Input with icon for filtering products by name.
    -   toast.tsx: Banner-like notification for success/error (e.g., "Product added!").
    -   fab.tsx: Floating action button for quick actions.
    -   empty-list.tsx: Placeholder with no-data.png when no products.
    -   view-switcher.tsx: Toggle icons for list/grid layout.

### 5. Styling and Assets

-   **global.css**: Imports Tailwind base/layers/components for consistent styling.
-   **constants/color.ts**: Exports color objects, e.g., { primary: '#007AFF', background: '#FFFFFF' }, used in Tailwind config.
-   **assets/images/**: Includes app icons (icon.png, splash-icon.png), logos (react-logo.png), and UI assets (no-data.png).

### 6. Build and Linting

-   **eslint.config.js**: Enforces code style (e.g., no unused vars, TypeScript rules).
-   **metro.config.js**: Customizes bundling for NativeWind and assets.

## How the App Works (High-Level Flow)

1.  **Launch**: App starts at index.tsx, wrapped by _layout.tsx providers.
2.  **Load Data**: use-products-state.ts initializes empty product list.
3.  **Display List**: Render products in tiles, with search/filter via search-bar.tsx.
4.  **Add Product**: Tap FAB → Open add-product-bottom-sheet.tsx → Fill form → Add to state → Show toast.
5.  **Interact**: Switch views, preview images, handle empty states.

The app is data-driven via context/hook, with no backend (local state only—extend with AsyncStorage for persistence).

## Conclusion

Productly demonstrates a scalable Expo app architecture for product management. Start by exploring app/index.tsx and the products hook to see the core logic. For full code details, view files directly on GitHub.
