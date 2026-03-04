# 🍰 Pizca

A pastry recipe app for calculating costs, adapting recipes to different molds, and managing a personal recipe collection with photos.

## 🎯 Features

- **Recipe Management**: Create, edit, and organize recipes with detailed instructions, planning timelines, and multi-day preparation steps
- **Ingredient Pricing**: Track ingredient prices from multiple sources (manual, barcode scanner, community crowdsourced data)
- **Cost Calculation**: Automatically calculate recipe costs and cost per serving
- **Mold Adapter**: Scale recipes to different mold sizes with intelligent volume calculations
- **Barcode Scanner**: Search for products by EAN/barcode using Open Food Facts API
- **Community Prices**: Access crowdsourced ingredient prices from Open Prices API
- **Recipe Components**: Organize complex recipes (e.g., entremets) into multiple components with separate ingredients and steps
- **Recipe Planning**: Multi-day planning for complex recipes with day-by-day task breakdown
- **Photo Storage**: Upload and manage recipe and preparation step photos
- **Tags & Organization**: Categorize recipes with custom tags
- **Shopping Lists**: Generate shopping lists from recipes
- **User Profiles**: Personal recipe collections with authentication

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript (generated with Lovable)
- **Backend / Database / Auth / Storage**: Lovable Cloud (managed Supabase)
- **Hosting**: Lovable Cloud (integrated deployment)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **External APIs**:
  - [Open Food Facts API v2](https://openfoodfacts.github.io/openfoodfacts-server/api/) – product data by barcode
  - [Open Prices API v1](https://prices.openfoodfacts.org/api/docs) – crowdsourced ingredient prices

## 📋 Getting Started

### Prerequisites

- Node.js 16+ & npm (or use [nvm](https://github.com/nvm-sh/nvm))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd pizca

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
npm run test     # Run tests with Vitest
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── profile/         # Profile & pricing components
│   ├── recipe/          # Recipe view & detail components
│   ├── recipe-form/     # Recipe creation & editing
│   └── ui/              # shadcn/ui base components
├── pages/               # Main app pages
├── hooks/               # Custom React hooks
│   ├── useRecipes.ts       # Recipe management
│   ├── useOpenFoodFacts.ts # Barcode search
│   ├── useOpenPrices.ts    # Community prices
│   ├── useTags.ts          # Tag management
│   └── useAuth.tsx         # Authentication
├── services/            # API integrations
│   ├── openfoodfacts.ts    # Open Food Facts API
│   ├── openprices.ts       # Open Prices API
│   └── supabase.ts         # Supabase client helpers
├── lib/                 # Utilities
│   ├── calculations.ts     # Mold volume & cost formulas
│   ├── exportRecipe.ts     # JSON export
│   └── exportRecipePdf.ts  # PDF generation
├── types/              # TypeScript interfaces
└── test/               # Test files

supabase/
└── migrations/         # Database migrations
```

## 🗄️ Database Schema

### Core Tables

- **recipes** – Recipe metadata, timing, difficulty, origin
- **recipe_components** – Recipe sections (e.g., "Pâte sablée", "Ganache")
- **recipe_ingredients** – Ingredients per component with quantities & units
- **recipe_steps** – Preparation steps with timing & technical notes
- **recipe_planning** – Multi-day planning for complex recipes (J-3, J-2, J-1, Day J)
- **recipe_variants** – Recipe variations
- **recipe_scale_factors** – Mold scaling multipliers
- **recipe_notes** – Chef tips and notes
- **tags** – Custom recipe tags
- **ingredient_prices** – Tracked ingredient prices (manual, scanner, Open Prices)
- **shopping_lists** – Shopping list management

**Row Level Security (RLS)**: All tables have RLS enabled. Users can only access their own data.

## 🧮 Calculation Formulas

### Mold Volumes

- **Circular**: Volume = π × r² × h
- **Square**: Volume = s² × h
- **Rectangular**: Volume = l × w × h

Scale factor: Volume_target / Volume_origin

### Smart Rounding

- Eggs → nearest whole number
- Flours, sugar → multiples of 5g
- Liquids → multiples of 5ml
- Butter → multiples of 10g
- Yeast → multiples of 0.5g

### Cost Calculation

Cost per ingredient = (quantity used / package size) × package price

Cost per serving = total recipe cost / servings

## 🎨 Design System

- **Primary**: `#E8784A` (warm orange)
- **Secondary**: `#2B4C7E` (dark blue)
- **Background**: `#FFF8F0` (cream) / `#FAFAF8` (warm gray)
- **Success**: `#3DA06E` | **Error**: `#D94444`
- **Typography**: DM Sans (Google Fonts)
- **Border radius**: 12–16px cards, 8–10px inputs
- **Shadows**: subtle `0 2px 12px rgba(0,0,0,0.06)`

## 🔍 Debugging

### VS Code Debugger

1. Press `Ctrl+Shift+D` to open the debugger
2. Press `F5` to start debugging
3. Set breakpoints by clicking line numbers
4. Open DevTools (`F12`) to inspect network/console

### Browser DevTools

- **Sources** tab: Set breakpoints and step through code
- **Console** tab: Log messages and test expressions
- **Network** tab: Monitor API calls (Open Food Facts, Open Prices, Supabase)
- **Device emulation** (`Ctrl+Shift+M`): Test responsive mobile/tablet views

## 🌐 External APIs

### Open Food Facts (Barcode Search)

```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
```

- Rate limit: 100 req/min (products), 10 req/min (searches)
- License: ODbL (attribution required: "Data from Open Food Facts")

### Open Prices (Community Prices)

```
GET https://prices.openfoodfacts.org/api/v1/prices?product_code={barcode}
```

- Filter by `country=ES` for Spanish results
- License: ODbL (same attribution required)

## 🚀 Deployment

### Lovable Cloud (Recommended)

1. Navigate to [Lovable](https://lovable.dev/projects/)
2. Click **Share → Publish**
3. Follow prompts to deploy

Database, auth, and storage are automatically managed by Lovable Cloud (Supabase).

### Custom Domain

1. Go to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow [Lovable's domain setup guide](https://docs.lovable.dev/features/custom-domain)

## 📐 Code Conventions

- **Components**: PascalCase, one file per component
- **Hooks**: camelCase with `use` prefix (e.g., `useRecipes`)
- **Services**: camelCase, pure async functions
- **Types**: Descriptive TypeScript interfaces (e.g., `Recipe`, `IngredientPrice`)
- **Styling**: Tailwind utility classes (no custom CSS except animations)
- **Commits**: Spanish, descriptive (e.g., "Añade integración Open Food Facts")
- **New files**: Always place in appropriate `src/` subdirectory

## ✅ Important Rules

1. Maintain compatibility with existing Lovable-generated structure
2. Don't break existing features when adding new ones
3. All images → Supabase Storage (max 1200px, WebP format)
4. Test in browser before committing (`npm run dev`)
5. **Responsive**: Mobile (375px), Tablet (768px), Desktop (1280px+)
6. **Empty states**: Always show guidance + illustration when no data
7. **Errors**: Clear Spanish messages, never show technical errors to users
8. **Loading**: Use skeleton loaders, never blank screens
9. **Accessibility**: Form labels, sufficient contrast, keyboard navigation

## 📚 Documentation

- Full PRD: [docs/PRD.md](docs/PRD.md)
- Configuration guide: [CLAUDE.md](CLAUDE.md)
- Open Food Facts: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Open Prices: https://prices.openfoodfacts.org/api/docs
- Lovable Docs: https://docs.lovable.dev
- Supabase Docs: https://supabase.com/docs

## 📄 License

[Add your license here]

---

Made with 🍰 using Lovable & React
