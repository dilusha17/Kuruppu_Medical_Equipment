# Graph Report - Kuruppu Medical Equipment  (2026-09-22)

## Corpus Check
- 255 files · ~118,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1407 nodes · 2610 edges · 195 communities (132 shown, 63 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 218 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `94395f9a`
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
- axios
- clsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 98 edges
2. `Invoice` - 39 edges
3. `Controller` - 33 edges
4. `useAuth()` - 32 edges
5. `Grn` - 25 edges
6. `User` - 25 edges
7. `ReportController` - 24 edges
8. `AppShell()` - 22 edges
9. `Button` - 22 edges
10. `BusinessEntity` - 21 edges

## Surprising Connections (you probably didn't know these)
- `up()` --calls--> `Invoice`  [INFERRED]
  database/migrations/2026_09_22_000001_resync_invoice_status_for_credit_notes.php → app/Models/Invoice.php
- `useChart()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/chart.tsx → package.json
- `useFormField()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/form.tsx → package.json
- `useCarousel()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/carousel.tsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/sidebar.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **localStorage-Persisted Frontend Demo State** — merge_notes_mock_auth, merge_notes_theme_toggle, merge_notes_role_based_access [INFERRED 0.75]

## Communities (195 total, 63 thin omitted)

### Community 0 - "UI: Stat Cards & Badges"
Cohesion: 0.05
Nodes (43): IconVariant, iconVariantStyles, StatCard(), StatCardProps, Badge(), BadgeProps, badgeVariants, Card (+35 more)

### Community 1 - "Composer Dependencies"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 4 - "UI: Sheet Component"
Cohesion: 0.05
Nodes (37): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+29 more)

### Community 5 - "Build Tooling & ESLint"
Cohesion: 0.05
Nodes (40): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, laravel-vite-plugin, tailwindcss-animate (+32 more)

### Community 6 - "Mock Data & Domain Types"
Cohesion: 0.05
Nodes (31): brands, categories, Customer, Employee, Expense, expenseCategories, GRN, initialCustomers (+23 more)

### Community 7 - "Deposit Accounts & Receivables"
Cohesion: 0.06
Nodes (23): AuthController, Controller, RoleController, UserController, EnsureOwner, Role, User, Closure (+15 more)

### Community 8 - "Base Controller & Dashboard"
Cohesion: 0.07
Nodes (7): InvoiceController, ReceivableController, TaxInvoiceApiController, Invoice, InvoiceItems, Receivable, up()

### Community 9 - "Auth & Business Entity Controllers"
Cohesion: 0.13
Nodes (4): CashFlowController, PayableController, Expense, Payable

### Community 10 - "App Shell & Layout"
Cohesion: 0.11
Nodes (20): AppShell(), AppLayout(), NavItem, navItems, SidebarContent(), SidebarContentProps, AuthContext, AuthContextType (+12 more)

### Community 11 - "Modal & Dialog Components"
Cohesion: 0.15
Nodes (11): getPageNumbers(), NumberedPagination(), NumberedPaginationProps, Separator, Grn, GRNHistoryPage(), GrnItem, GrnPayable (+3 more)

### Community 12 - "Breadcrumb & Drawer UI"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 13 - "Customer & Payment Controllers"
Cohesion: 0.12
Nodes (5): CustomerController, QuotationController, Customers, Quotation, Illuminate\Database\Eloquent\Relations\HasOne

### Community 14 - "Toast Notifications UI"
Cohesion: 0.12
Nodes (24): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+16 more)

### Community 15 - "TypeScript App Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, resources/js, compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations (+18 more)

### Community 16 - "App Bootstrap & Providers"
Cohesion: 0.13
Nodes (20): ConfirmDialog(), ConfirmDialogProps, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+12 more)

### Community 17 - "Composer Scripts"
Cohesion: 0.14
Nodes (14): scripts, dev, post-autoload-dump, post-update-cmd, pre-package-uninstall, test, Composer\\Config::disableProcessTimeout, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+6 more)

### Community 18 - "Search Bar & Form Inputs"
Cohesion: 0.14
Nodes (11): SearchBar(), SearchBarProps, Button, Input, Customer, emptyForm, FormData, InvoiceReceivable (+3 more)

### Community 19 - "Carousel Component"
Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 20 - "Dropdown Menu UI"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 21 - "NavLink & Small Controls"
Cohesion: 0.08
Nodes (16): NavLink, NavLinkCompatProps, Checkbox, HoverCardContent, Progress, RadioGroup, RadioGroupItem, ScrollArea (+8 more)

### Community 22 - "Select & Cash Flow Page"
Cohesion: 0.09
Nodes (22): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, AccountSummary (+14 more)

### Community 24 - "Vite & Node TS Config"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 25 - "Confirm & Alert Dialogs"
Cohesion: 0.20
Nodes (9): ResizableHandle(), ResizablePanelGroup(), cn(), OutstandingReport(), ProfitLossReport(), PurchasesReport(), ReportsPage(), ReportTab (+1 more)

### Community 26 - "Date Pickers & Payables"
Cohesion: 0.09
Nodes (19): react, react, NotifResponse, OverdueInvoice, useCarousel(), Combobox(), DatePicker(), DatePickerProps (+11 more)

### Community 28 - "Combobox & Command Palette"
Cohesion: 0.21
Nodes (11): ComboboxOption, ComboboxProps, Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem (+3 more)

### Community 29 - "Settings & VAT Controllers"
Cohesion: 0.12
Nodes (11): CreditNoteItem, CustomerVatDetail, Grn_items, InventoryAdjustment, Payment, Payments, BelongsTo, QuotationItem (+3 more)

### Community 30 - "Supplier Controller"
Cohesion: 0.22
Nodes (4): SupplierController, HasOne, Suppliers, SupplierVatDetail

### Community 31 - "NPM Radix Dependencies"
Cohesion: 0.15
Nodes (13): class-variance-authority, dependencies, class-variance-authority, @radix-ui/react-accordion, @radix-ui/react-context-menu, @radix-ui/react-menubar, react-barcode, react-to-print (+5 more)

### Community 32 - "Root TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, baseUrl, ignoreDeprecations, noImplicitAny, noUnusedLocals, noUnusedParameters, paths (+4 more)

### Community 33 - "Product Controller"
Cohesion: 0.22
Nodes (4): SettingsController, VatController, Settings, Vat

### Community 34 - "Numbered Pagination & GRN History"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 35 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 37 - "Category Controller"
Cohesion: 0.18
Nodes (8): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES, useChart()

### Community 39 - "Table Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 40 - "Navigation Menu UI"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 41 - "Toggle Components"
Cohesion: 0.47
Nodes (3): UserFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 45 - "vite-env.d"
Cohesion: 0.33
Nodes (5): ImportMeta, ImportMetaEnv, *.jpg, *.png, *.svg

### Community 47 - "SettingsPage.tsx"
Cohesion: 0.10
Nodes (18): queryClient, PaginationContent, PaginationItem, Toaster(), ToasterProps, AuthProvider(), ThemeContext, ThemeContextType (+10 more)

### Community 48 - "input-otp"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 50 - "accordion"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 56 - "2026_04_24_123452_payment_methods"
Cohesion: 0.23
Nodes (4): DepositAccountController, PaymentMethodController, DepositAccount, PaymentMethod

### Community 57 - "require-dev"
Cohesion: 0.22
Nodes (9): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, pestphp/pest (+1 more)

### Community 84 - "QuotationPage.tsx"
Cohesion: 0.08
Nodes (29): Modal(), ModalProps, sizes, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay (+21 more)

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

### Community 97 - "class-variance-authority"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 98 - "clsx"
Cohesion: 0.16
Nodes (3): DashboardController, GrnController, Grn

### Community 99 - "accordion.tsx"
Cohesion: 0.26
Nodes (3): ReportController, Carbon\Carbon, Symfony\Component\HttpFoundation\StreamedResponse

### Community 181 - "extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 185 - "NavLink.tsx"
Cohesion: 0.32
Nodes (3): BusinessEntityController, BusinessEntity, Carbon

### Community 186 - "radio-group.tsx"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 187 - "scroll-area.tsx"
Cohesion: 0.15
Nodes (3): BrandController, Brands, Illuminate\Database\Eloquent\Relations\HasMany

## Knowledge Gaps
- **468 isolated node(s):** `$schema`, `name`, `type`, `description`, `laravel` (+463 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Radix Dependencies` to `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `Build Tooling & ESLint`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `@tanstack/react-query`, `vaul`, `@vitejs/plugin-react`, `zod`, `Date Pickers & Payables`, `cmdk`, `axios`, `clsx`, `2026_07_12_000003_add_payment_method_id_`, `embla-carousel-react`, `@hookform/resolvers`, `html5-qrcode`, `@inertiajs/react`, `input-otp`, `lucide-react`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `react` connect `Date Pickers & Payables` to `UI: Stat Cards & Badges`, `UI: Sheet Component`, `Category Controller`, `Toast Notifications UI`, `NPM Radix Dependencies`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `cn()` connect `Confirm & Alert Dialogs` to `UI: Stat Cards & Badges`, `UI: Sheet Component`, `App Shell & Layout`, `Modal & Dialog Components`, `Breadcrumb & Drawer UI`, `Toast Notifications UI`, `App Bootstrap & Providers`, `Search Bar & Form Inputs`, `Carousel Component`, `Dropdown Menu UI`, `NavLink & Small Controls`, `Select & Cash Flow Page`, `Date Pickers & Payables`, `Combobox & Command Palette`, `Numbered Pagination & GRN History`, `Context Menu UI`, `Category Controller`, `Table Component`, `Navigation Menu UI`, `input-otp`, `accordion`, `radio-group.tsx`, `QuotationPage.tsx`, `alert.tsx`, `class-variance-authority`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _468 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI: Stat Cards & Badges` be split into smaller, more focused modules?**
  _Cohesion score 0.05101327742837177 - nodes in this community are weakly interconnected._
- **Should `Composer Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `UI: Sheet Component` be split into smaller, more focused modules?**
  _Cohesion score 0.053426248548199766 - nodes in this community are weakly interconnected._