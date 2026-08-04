# Graph Report - Kuruppu Medical Equipment  (2026-07-21)

## Corpus Check
- 235 files · ~105,890 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1286 nodes · 2252 edges · 171 communities (114 shown, 57 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 181 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1fd9976a`
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
- input-otp
- accordion
- avatar
- 2026_04_24_123452_payment_methods
- 2026_07_12_000003_add_payment_method_id_
- Inertia + React Bridge
- Mock Authentication (localStorage)
- BarcodeScanner
- axios
- app
- class-variance-authority
- clsx
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 94 edges
2. `Invoice` - 31 edges
3. `Controller` - 28 edges
4. `Grn` - 23 edges
5. `compilerOptions` - 21 edges
6. `Button` - 20 edges
7. `useAuth()` - 20 edges
8. `BusinessEntity` - 19 edges
9. `AppShell()` - 19 edges
10. `Expense` - 17 edges

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

## Communities (171 total, 57 thin omitted)

### Community 0 - "UI: Stat Cards & Badges"
Cohesion: 0.05
Nodes (42): IconVariant, iconVariantStyles, StatCard(), StatCardProps, Badge(), BadgeProps, badgeVariants, Card (+34 more)

### Community 1 - "Composer Dependencies"
Cohesion: 0.04
Nodes (44): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, config, allow-plugins (+36 more)

### Community 2 - "Laravel Controllers (Core)"
Cohesion: 0.13
Nodes (5): Payment, Payments, BelongsTo, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\SoftDeletes

### Community 3 - "GRN Controller & Actions"
Cohesion: 0.17
Nodes (5): Controller, DashboardController, NotificationController, ProductController, Product

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
Cohesion: 0.09
Nodes (12): SettingsController, VatController, Settings, Vat, CustomerSeeder, DatabaseSeeder, DepositAccountSeeder, PaymentMethodSeeder (+4 more)

### Community 8 - "Base Controller & Dashboard"
Cohesion: 0.10
Nodes (6): InvoiceController, ReceivableController, TaxInvoiceApiController, TaxInvoiceController, Invoice, TaxInvoice

### Community 9 - "Auth & Business Entity Controllers"
Cohesion: 0.10
Nodes (10): BusinessEntityController, CashFlowController, GrnController, PayableController, ReportController, BusinessEntity, Expense, Grn (+2 more)

### Community 10 - "App Shell & Layout"
Cohesion: 0.09
Nodes (23): AppLayout(), NavItem, navItems, SidebarContent(), SidebarContentProps, ExpiryDatePicker(), AuthContext, AuthContextType (+15 more)

### Community 11 - "Modal & Dialog Components"
Cohesion: 0.09
Nodes (27): Modal(), ModalProps, sizes, Combobox(), DialogContent, DialogDescription, DialogFooter(), DialogHeader() (+19 more)

### Community 12 - "Breadcrumb & Drawer UI"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 13 - "Customer & Payment Controllers"
Cohesion: 0.16
Nodes (3): QuotationController, Quotation, QuotationItem

### Community 14 - "Toast Notifications UI"
Cohesion: 0.08
Nodes (32): queryClient, Toaster(), Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps (+24 more)

### Community 15 - "TypeScript App Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, resources/js, compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations (+18 more)

### Community 16 - "App Bootstrap & Providers"
Cohesion: 0.09
Nodes (30): ConfirmDialog(), ConfirmDialogProps, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+22 more)

### Community 17 - "Composer Scripts"
Cohesion: 0.08
Nodes (26): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+18 more)

### Community 18 - "Search Bar & Form Inputs"
Cohesion: 0.08
Nodes (23): AppShell(), getPageNumbers(), NumberedPagination(), NumberedPaginationProps, SearchBar(), SearchBarProps, Button, Input (+15 more)

### Community 19 - "Carousel Component"
Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 20 - "Dropdown Menu UI"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 21 - "NavLink & Small Controls"
Cohesion: 0.08
Nodes (17): NotifResponse, OverdueInvoice, NavLink, NavLinkCompatProps, Calendar(), CalendarProps, Checkbox, DatePickerProps (+9 more)

### Community 22 - "Select & Cash Flow Page"
Cohesion: 0.10
Nodes (21): DatePicker(), SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger (+13 more)

### Community 23 - "Stock / Inventory Controller"
Cohesion: 0.08
Nodes (7): StockController, Grn_items, InventoryAdjustment, InvoiceItems, Receivable, StockBatches, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 24 - "Vite & Node TS Config"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 25 - "Confirm & Alert Dialogs"
Cohesion: 0.23
Nodes (4): CustomerController, PaymentMethodController, Customers, PaymentMethod

### Community 26 - "Date Pickers & Payables"
Cohesion: 0.22
Nodes (8): react, react, useCarousel(), useChart(), useFormField(), SidebarContext, useSidebar(), useIsMobile()

### Community 27 - "Company Controller & Factories"
Cohesion: 0.18
Nodes (5): CompanyController, Companies, UserFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 28 - "Combobox & Command Palette"
Cohesion: 0.21
Nodes (11): ComboboxOption, ComboboxProps, Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem (+3 more)

### Community 29 - "Settings & VAT Controllers"
Cohesion: 0.20
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 30 - "Supplier Controller"
Cohesion: 0.23
Nodes (4): SupplierController, Suppliers, SupplierVatDetail, HasOne

### Community 31 - "NPM Radix Dependencies"
Cohesion: 0.15
Nodes (13): cmdk, dependencies, cmdk, @radix-ui/react-accordion, @radix-ui/react-context-menu, @radix-ui/react-menubar, react-barcode, react-to-print (+5 more)

### Community 32 - "Root TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, baseUrl, ignoreDeprecations, noImplicitAny, noUnusedLocals, noUnusedParameters, paths (+4 more)

### Community 33 - "Product Controller"
Cohesion: 0.13
Nodes (7): AuthController, User, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Relations\HasMany, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Sanctum\HasApiTokens

### Community 34 - "Numbered Pagination & GRN History"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 35 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 39 - "Table Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 40 - "Navigation Menu UI"
Cohesion: 0.10
Nodes (14): AccordionContent, AccordionItem, AccordionTrigger, Alert, AlertDescription, AlertTitle, alertVariants, NavigationMenu (+6 more)

### Community 41 - "Toggle Components"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 43 - "Expenses Category Controller"
Cohesion: 0.21
Nodes (4): ExpensesCategoryController, HandleInertiaRequests, ExpensesCategory, Inertia\Middleware

### Community 44 - "Notification Bell & Popover"
Cohesion: 0.22
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 45 - "vite-env.d"
Cohesion: 0.33
Nodes (5): ImportMeta, ImportMetaEnv, *.jpg, *.png, *.svg

### Community 48 - "input-otp"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 50 - "accordion"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 51 - "avatar"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 91 - "Inertia + React Bridge"
Cohesion: 0.67
Nodes (3): Inertia + React Bridge, Vite React Plugin Build, Laravel Framework

### Community 92 - "Mock Authentication (localStorage)"
Cohesion: 0.67
Nodes (3): Mock Authentication (localStorage), Role-Based Demo Users (owner/admin/cashier), Manual Theme Toggle

## Knowledge Gaps
- **459 isolated node(s):** `$schema`, `name`, `type`, `description`, `laravel` (+454 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Radix Dependencies` to `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `Build Tooling & ESLint`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `@tanstack/react-query`, `vaul`, `@vitejs/plugin-react`, `zod`, `Date Pickers & Payables`, `2026_07_12_000003_add_payment_method_id_`, `axios`, `class-variance-authority`, `clsx`, `embla-carousel-react`, `@hookform/resolvers`, `html5-qrcode`, `@inertiajs/react`, `input-otp`, `lucide-react`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `react` connect `Date Pickers & Payables` to `App Shell & Layout`, `Modal & Dialog Components`, `Toast Notifications UI`, `Select & Cash Flow Page`, `NPM Radix Dependencies`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `cn()` connect `App Bootstrap & Providers` to `UI: Stat Cards & Badges`, `UI: Sheet Component`, `App Shell & Layout`, `Modal & Dialog Components`, `Breadcrumb & Drawer UI`, `Toast Notifications UI`, `Search Bar & Form Inputs`, `Carousel Component`, `Dropdown Menu UI`, `NavLink & Small Controls`, `Select & Cash Flow Page`, `Combobox & Command Palette`, `Settings & VAT Controllers`, `Numbered Pagination & GRN History`, `Context Menu UI`, `Table Component`, `Navigation Menu UI`, `Toggle Components`, `Notification Bell & Popover`, `input-otp`, `accordion`, `avatar`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _459 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI: Stat Cards & Badges` be split into smaller, more focused modules?**
  _Cohesion score 0.05224963715529753 - nodes in this community are weakly interconnected._
- **Should `Composer Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `Laravel Controllers (Core)` be split into smaller, more focused modules?**
  _Cohesion score 0.1273532668881506 - nodes in this community are weakly interconnected._