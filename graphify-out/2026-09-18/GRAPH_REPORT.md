# Graph Report - Kuruppu Medical Equipment  (2026-08-03)

## Corpus Check
- 250 files · ~111,947 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1369 nodes · 2477 edges · 190 communities (129 shown, 61 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 200 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d5352d8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI: Stat Cards & Badges
- Composer Dependencies
- Laravel Controllers (Core)
- GRN Controller & Actions
- UI: Sheet Component
- Build Tooling & ESLint
- Mock Data & Domain Types
- Deposit Accounts & Receivables
- Base Controller & Dashboard
- Auth & Business Entity Controllers
- App Shell & Layout
- Modal & Dialog Components
- Breadcrumb & Drawer UI
- Customer & Payment Controllers
- Toast Notifications UI
- TypeScript App Config
- App Bootstrap & Providers
- Composer Scripts
- Search Bar & Form Inputs
- Carousel Component
- Dropdown Menu UI
- NavLink & Small Controls
- Select & Cash Flow Page
- Stock / Inventory Controller
- Vite & Node TS Config
- Confirm & Alert Dialogs
- Date Pickers & Payables
- Company Controller & Factories
- Combobox & Command Palette
- Settings & VAT Controllers
- Supplier Controller
- NPM Radix Dependencies
- Root TypeScript Config
- Product Controller
- Numbered Pagination & GRN History
- Context Menu UI
- Brand Controller
- Category Controller
- Unit Type Controller
- Table Component
- Navigation Menu UI
- Toggle Components
- Company Profile Controller
- Expenses Category Controller
- Notification Bell & Popover
- vite-env.d
- AppServiceProvider
- SettingsPage.tsx
- input-otp
- TaxInvoice
- accordion
- avatar
- 2026_04_24_123452_payment_methods
- require-dev
- 2026_07_12_000003_add_payment_method_id_
- QuotationPage.tsx
- setup
- config
- require
- psr-4
- alert.tsx
- Inertia + React Bridge
- Mock Authentication (localStorage)
- BarcodeScanner
- axios
- app
- class-variance-authority
- clsx
- accordion.tsx
- embla-carousel-react
- @hookform/resolvers
- html5-qrcode
- @inertiajs/react
- input-otp
- lucide-react
- @radix-ui/react-alert-dialog
- @radix-ui/react-aspect-ratio
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- @radix-ui/react-toast
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- react-day-picker
- react-dom
- react-hook-form
- react-resizable-panels
- recharts
- sonner
- tailwind-merge
- @tanstack/react-query
- vaul
- @vitejs/plugin-react
- zod
- Graphify Knowledge Graph Workflow
- Cookie Jar Export
- Robots Crawler Policy
- Kuruppu Brand Logo
- extra
- NavLink.tsx
- radio-group.tsx
- scroll-area.tsx
- cmdk

## God Nodes (most connected - your core abstractions)
1. `cn()` - 97 edges
2. `Invoice` - 35 edges
3. `Controller` - 33 edges
4. `useAuth()` - 26 edges
5. `User` - 25 edges
6. `Grn` - 23 edges
7. `AppShell()` - 22 edges
8. `Button` - 22 edges
9. `compilerOptions` - 21 edges
10. `BusinessEntity` - 20 edges

## Surprising Connections (you probably didn't know these)
- `useCarousel()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/carousel.tsx → package.json
- `useChart()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/chart.tsx → package.json
- `Combobox()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/combobox.tsx → package.json
- `DatePicker()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/date-picker.tsx → package.json
- `ExpiryDatePicker()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/date-picker.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **localStorage-Persisted Frontend Demo State** — merge_notes_mock_auth, merge_notes_theme_toggle, merge_notes_role_based_access [INFERRED 0.75]

## Communities (190 total, 61 thin omitted)

### Community 0 - "UI: Stat Cards & Badges"
Cohesion: 0.05
Nodes (42): IconVariant, iconVariantStyles, StatCard(), StatCardProps, Badge(), BadgeProps, badgeVariants, Card (+34 more)

### Community 1 - "Composer Dependencies"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 2 - "Laravel Controllers (Core)"
Cohesion: 0.11
Nodes (6): Grn_items, Payment, Payments, BelongsTo, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\SoftDeletes

### Community 4 - "UI: Sheet Component"
Cohesion: 0.07
Nodes (26): Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader (+18 more)

### Community 5 - "Build Tooling & ESLint"
Cohesion: 0.05
Nodes (40): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, laravel-vite-plugin, tailwindcss-animate (+32 more)

### Community 6 - "Mock Data & Domain Types"
Cohesion: 0.05
Nodes (31): brands, categories, Customer, Employee, Expense, expenseCategories, GRN, initialCustomers (+23 more)

### Community 7 - "Deposit Accounts & Receivables"
Cohesion: 0.06
Nodes (21): RoleController, UserController, EnsureOwner, Role, User, Closure, Collection, CustomerSeeder (+13 more)

### Community 8 - "Base Controller & Dashboard"
Cohesion: 0.08
Nodes (7): DashboardController, InvoiceController, ReceivableController, TaxInvoiceApiController, Invoice, InvoiceItems, Receivable

### Community 9 - "Auth & Business Entity Controllers"
Cohesion: 0.08
Nodes (12): BusinessEntityController, CashFlowController, GrnController, PayableController, ReportController, HandleInertiaRequests, BusinessEntity, Expense (+4 more)

### Community 10 - "App Shell & Layout"
Cohesion: 0.09
Nodes (22): AppLayout(), NavItem, navItems, SidebarContent(), SidebarContentProps, ExpiryDatePicker(), AuthContext, AuthContextType (+14 more)

### Community 11 - "Modal & Dialog Components"
Cohesion: 0.09
Nodes (23): ModalProps, sizes, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle (+15 more)

### Community 12 - "Breadcrumb & Drawer UI"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 13 - "Customer & Payment Controllers"
Cohesion: 0.16
Nodes (3): QuotationController, Quotation, QuotationItem

### Community 14 - "Toast Notifications UI"
Cohesion: 0.09
Nodes (29): queryClient, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle (+21 more)

### Community 15 - "TypeScript App Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, resources/js, compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations (+18 more)

### Community 16 - "App Bootstrap & Providers"
Cohesion: 0.19
Nodes (14): ConfirmDialog(), ConfirmDialogProps, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+6 more)

### Community 17 - "Composer Scripts"
Cohesion: 0.14
Nodes (14): scripts, dev, post-autoload-dump, post-update-cmd, pre-package-uninstall, test, Composer\\Config::disableProcessTimeout, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+6 more)

### Community 18 - "Search Bar & Form Inputs"
Cohesion: 0.14
Nodes (12): SearchBarProps, Button, Input, CartItem, Customer, StockItem, Supplier, emptyForm (+4 more)

### Community 19 - "Carousel Component"
Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 20 - "Dropdown Menu UI"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 21 - "NavLink & Small Controls"
Cohesion: 0.08
Nodes (22): Modal(), ButtonProps, Checkbox, HoverCardContent, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem (+14 more)

### Community 22 - "Select & Cash Flow Page"
Cohesion: 0.08
Nodes (25): getPageNumbers(), NumberedPagination(), NumberedPaginationProps, Combobox(), DatePicker(), SelectContent, SelectItem, SelectLabel (+17 more)

### Community 23 - "Stock / Inventory Controller"
Cohesion: 0.08
Nodes (7): CreditNoteController, StockController, CreditNote, CreditNoteItem, InventoryAdjustment, StockBatches, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 24 - "Vite & Node TS Config"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 25 - "Confirm & Alert Dialogs"
Cohesion: 0.24
Nodes (3): CustomerController, Customers, PaymentMethod

### Community 26 - "Date Pickers & Payables"
Cohesion: 0.22
Nodes (8): react, react, useCarousel(), useChart(), useFormField(), SidebarContext, useSidebar(), useIsMobile()

### Community 27 - "Company Controller & Factories"
Cohesion: 0.21
Nodes (5): CompanyController, Companies, UserFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 28 - "Combobox & Command Palette"
Cohesion: 0.13
Nodes (15): NotifResponse, OverdueInvoice, ComboboxOption, ComboboxProps, Command, CommandDialogProps, CommandEmpty, CommandGroup (+7 more)

### Community 29 - "Settings & VAT Controllers"
Cohesion: 0.20
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 30 - "Supplier Controller"
Cohesion: 0.24
Nodes (4): SupplierController, Suppliers, SupplierVatDetail, HasOne

### Community 31 - "NPM Radix Dependencies"
Cohesion: 0.15
Nodes (13): axios, dependencies, axios, @radix-ui/react-accordion, @radix-ui/react-context-menu, @radix-ui/react-menubar, react-barcode, react-to-print (+5 more)

### Community 32 - "Root TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, baseUrl, ignoreDeprecations, noImplicitAny, noUnusedLocals, noUnusedParameters, paths (+4 more)

### Community 33 - "Product Controller"
Cohesion: 0.11
Nodes (8): AuthController, Controller, NotificationController, PaymentMethodController, SettingsController, VatController, Settings, Vat

### Community 34 - "Numbered Pagination & GRN History"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 35 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 36 - "Brand Controller"
Cohesion: 0.11
Nodes (5): BrandController, CategoryController, Brands, Categories, Illuminate\Database\Eloquent\Relations\HasMany

### Community 37 - "Category Controller"
Cohesion: 0.12
Nodes (13): AppShell(), SearchBar(), CreditNoteHistoryPage(), CreditNoteItem, CreditNoteRow, reasonBadge(), Customer, emptyForm (+5 more)

### Community 39 - "Table Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 40 - "Navigation Menu UI"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 41 - "Toggle Components"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 44 - "Notification Bell & Popover"
Cohesion: 0.22
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 45 - "vite-env.d"
Cohesion: 0.33
Nodes (5): ImportMeta, ImportMetaEnv, *.jpg, *.png, *.svg

### Community 47 - "SettingsPage.tsx"
Cohesion: 0.14
Nodes (11): Toaster(), ToasterProps, useTheme(), Brand, BusinessEntity, Category, Company, DepositAccount (+3 more)

### Community 48 - "input-otp"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 50 - "accordion"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 51 - "avatar"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 57 - "require-dev"
Cohesion: 0.22
Nodes (9): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, pestphp/pest (+1 more)

### Community 84 - "QuotationPage.tsx"
Cohesion: 0.25
Nodes (6): Textarea, TextareaProps, CartItem, Customer, ProductItem, QuotationPage()

### Community 85 - "setup"
Cohesion: 0.25
Nodes (8): post-root-package-install, setup, composer install, npm install, npm run build, @php artisan key:generate, @php artisan migrate --force, @php -r \"file_exists('.env') || copy('.env.example', '.env');\

### Community 86 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 87 - "require"
Cohesion: 0.29
Nodes (7): require, barryvdh/laravel-dompdf, inertiajs/inertia-laravel, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 88 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 89 - "alert.tsx"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 91 - "Inertia + React Bridge"
Cohesion: 0.67
Nodes (3): Inertia + React Bridge, Vite React Plugin Build, Laravel Framework

### Community 92 - "Mock Authentication (localStorage)"
Cohesion: 0.67
Nodes (3): Mock Authentication (localStorage), Role-Based Demo Users (owner/admin/cashier), Manual Theme Toggle

### Community 95 - "axios"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 99 - "accordion.tsx"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 181 - "extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

## Knowledge Gaps
- **468 isolated node(s):** `$schema`, `name`, `type`, `description`, `laravel` (+463 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Radix Dependencies` to `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `Build Tooling & ESLint`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `@tanstack/react-query`, `vaul`, `@vitejs/plugin-react`, `zod`, `Date Pickers & Payables`, `cmdk`, `2026_07_12_000003_add_payment_method_id_`, `class-variance-authority`, `clsx`, `embla-carousel-react`, `@hookform/resolvers`, `html5-qrcode`, `@inertiajs/react`, `input-otp`, `lucide-react`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `cn()` connect `NavLink & Small Controls` to `UI: Stat Cards & Badges`, `UI: Sheet Component`, `App Shell & Layout`, `Modal & Dialog Components`, `Breadcrumb & Drawer UI`, `Toast Notifications UI`, `App Bootstrap & Providers`, `Search Bar & Form Inputs`, `Carousel Component`, `Dropdown Menu UI`, `Select & Cash Flow Page`, `Combobox & Command Palette`, `Settings & VAT Controllers`, `Numbered Pagination & GRN History`, `Context Menu UI`, `Category Controller`, `Table Component`, `Navigation Menu UI`, `Toggle Components`, `Notification Bell & Popover`, `input-otp`, `accordion`, `avatar`, `NavLink.tsx`, `radio-group.tsx`, `scroll-area.tsx`, `QuotationPage.tsx`, `alert.tsx`, `accordion.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `react` connect `Date Pickers & Payables` to `App Shell & Layout`, `Toast Notifications UI`, `Select & Cash Flow Page`, `NPM Radix Dependencies`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _468 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI: Stat Cards & Badges` be split into smaller, more focused modules?**
  _Cohesion score 0.05224963715529753 - nodes in this community are weakly interconnected._
- **Should `Composer Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Laravel Controllers (Core)` be split into smaller, more focused modules?**
  _Cohesion score 0.11139455782312925 - nodes in this community are weakly interconnected._