# Graph Report - .  (2026-07-21)

## Corpus Check
- 247 files · ~106,133 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1313 nodes · 2270 edges · 181 communities (122 shown, 59 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 180 edges (avg confidence: 0.8)
- Token cost: 4,200 input · 850 output

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
- alert
- input-otp
- Payments
- accordion
- avatar
- Inertia + React Bridge
- Mock Authentication (localStorage)
- BarcodeScanner
- axios
- app
- class-variance-authority
- clsx
- cmdk
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
8. `AppShell()` - 19 edges
9. `BusinessEntity` - 18 edges
10. `Expense` - 17 edges

## Surprising Connections (you probably didn't know these)
- `useChart()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/chart.tsx → package.json
- `useFormField()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/form.tsx → package.json
- `useCarousel()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/carousel.tsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  resources/js/components/ui/sidebar.tsx → package.json
- `useIsMobile()` --references--> `react`  [EXTRACTED]
  resources/js/hooks/use-mobile.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **localStorage-Persisted Frontend Demo State** — merge_notes_mock_auth, merge_notes_theme_toggle, merge_notes_role_based_access [INFERRED 0.75]

## Communities (181 total, 59 thin omitted)

### Community 0 - "UI: Stat Cards & Badges"
Cohesion: 0.05
Nodes (43): IconVariant, iconVariantStyles, StatCard(), StatCardProps, Badge(), BadgeProps, badgeVariants, Card (+35 more)

### Community 1 - "Composer Dependencies"
Cohesion: 0.04
Nodes (44): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, config, allow-plugins (+36 more)

### Community 2 - "Laravel Controllers (Core)"
Cohesion: 0.13
Nodes (4): CashFlowController, Payment, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\SoftDeletes

### Community 3 - "GRN Controller & Actions"
Cohesion: 0.07
Nodes (7): GrnController, PayableController, Expense, Grn, Grn_items, Payable, Illuminate\Database\Eloquent\Relations\BelongsTo

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
Cohesion: 0.08
Nodes (15): DepositAccountController, DepositAccount, User, CustomerSeeder, DatabaseSeeder, DepositAccountSeeder, PaymentMethodSeeder, UserSeeder (+7 more)

### Community 8 - "Base Controller & Dashboard"
Cohesion: 0.09
Nodes (9): Controller, DashboardController, InvoiceController, NotificationController, ReceivableController, VatInvoiceApiController, Invoice, InvoiceItems (+1 more)

### Community 9 - "Auth & Business Entity Controllers"
Cohesion: 0.12
Nodes (9): AuthController, BusinessEntityController, ReportController, VatInvoiceController, HandleInertiaRequests, BusinessEntity, VatInvoice, Illuminate\Http\Request (+1 more)

### Community 10 - "App Shell & Layout"
Cohesion: 0.09
Nodes (25): AppShell(), AppLayout(), NavItem, navItems, SidebarContent(), SidebarContentProps, Textarea, TextareaProps (+17 more)

### Community 11 - "Modal & Dialog Components"
Cohesion: 0.09
Nodes (25): Modal(), ModalProps, sizes, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay (+17 more)

### Community 12 - "Breadcrumb & Drawer UI"
Cohesion: 0.08
Nodes (27): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator(), DrawerContent (+19 more)

### Community 13 - "Customer & Payment Controllers"
Cohesion: 0.09
Nodes (7): CustomerController, PaymentMethodController, QuotationController, Customers, PaymentMethod, Quotation, QuotationItem

### Community 14 - "Toast Notifications UI"
Cohesion: 0.12
Nodes (24): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+16 more)

### Community 15 - "TypeScript App Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, resources/js, compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations (+18 more)

### Community 16 - "App Bootstrap & Providers"
Cohesion: 0.10
Nodes (18): queryClient, PaginationContent, PaginationItem, Toaster(), ToasterProps, AuthProvider(), ThemeContext, ThemeContextType (+10 more)

### Community 17 - "Composer Scripts"
Cohesion: 0.08
Nodes (26): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+18 more)

### Community 18 - "Search Bar & Form Inputs"
Cohesion: 0.14
Nodes (11): SearchBar(), SearchBarProps, Button, ButtonProps, Input, Customer, emptyForm, FormData (+3 more)

### Community 19 - "Carousel Component"
Cohesion: 0.08
Nodes (20): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+12 more)

### Community 20 - "Dropdown Menu UI"
Cohesion: 0.09
Nodes (20): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+12 more)

### Community 21 - "NavLink & Small Controls"
Cohesion: 0.10
Nodes (11): NavLink, NavLinkCompatProps, Checkbox, HoverCardContent, Progress, RadioGroup, RadioGroupItem, ScrollArea (+3 more)

### Community 22 - "Select & Cash Flow Page"
Cohesion: 0.14
Nodes (13): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, AccountSummary (+5 more)

### Community 23 - "Stock / Inventory Controller"
Cohesion: 0.16
Nodes (4): StockController, InventoryAdjustment, StockBatches, Illuminate\Database\Eloquent\Relations\HasMany

### Community 24 - "Vite & Node TS Config"
Cohesion: 0.11
Nodes (17): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+9 more)

### Community 25 - "Confirm & Alert Dialogs"
Cohesion: 0.21
Nodes (13): ConfirmDialog(), ConfirmDialogProps, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+5 more)

### Community 26 - "Date Pickers & Payables"
Cohesion: 0.16
Nodes (12): react, react, useCarousel(), Combobox(), DatePicker(), DatePickerProps, ExpiryDatePicker(), ExpenseItem (+4 more)

### Community 27 - "Company Controller & Factories"
Cohesion: 0.21
Nodes (5): CompanyController, Companies, UserFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 28 - "Combobox & Command Palette"
Cohesion: 0.21
Nodes (11): ComboboxOption, ComboboxProps, Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem (+3 more)

### Community 29 - "Settings & VAT Controllers"
Cohesion: 0.22
Nodes (4): SettingsController, VatController, Settings, Vat

### Community 30 - "Supplier Controller"
Cohesion: 0.23
Nodes (4): SupplierController, Suppliers, SupplierVatDetail, HasOne

### Community 31 - "NPM Radix Dependencies"
Cohesion: 0.15
Nodes (13): date-fns, dependencies, date-fns, @radix-ui/react-accordion, @radix-ui/react-context-menu, @radix-ui/react-menubar, react-barcode, react-to-print (+5 more)

### Community 32 - "Root TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, baseUrl, ignoreDeprecations, noImplicitAny, noUnusedLocals, noUnusedParameters, paths (+4 more)

### Community 34 - "Numbered Pagination & GRN History"
Cohesion: 0.20
Nodes (7): getPageNumbers(), NumberedPagination(), NumberedPaginationProps, Separator, Grn, GrnItem, GrnPayable

### Community 35 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

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
Cohesion: 0.40
Nodes (3): NotifResponse, OverdueInvoice, PopoverContent

### Community 45 - "vite-env.d"
Cohesion: 0.33
Nodes (5): ImportMeta, ImportMetaEnv, *.jpg, *.png, *.svg

### Community 47 - "alert"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 48 - "input-otp"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 50 - "accordion"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

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
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Radix Dependencies` to `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `Build Tooling & ESLint`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `@tanstack/react-query`, `vaul`, `@vitejs/plugin-react`, `zod`, `Date Pickers & Payables`, `axios`, `class-variance-authority`, `clsx`, `cmdk`, `embla-carousel-react`, `@hookform/resolvers`, `html5-qrcode`, `@inertiajs/react`, `input-otp`, `lucide-react`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `react` connect `Date Pickers & Payables` to `UI: Stat Cards & Badges`, `UI: Sheet Component`, `Toast Notifications UI`, `Carousel Component`, `NPM Radix Dependencies`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `cn()` connect `Breadcrumb & Drawer UI` to `UI: Stat Cards & Badges`, `UI: Sheet Component`, `App Shell & Layout`, `Modal & Dialog Components`, `Toast Notifications UI`, `Search Bar & Form Inputs`, `Carousel Component`, `Dropdown Menu UI`, `NavLink & Small Controls`, `Select & Cash Flow Page`, `Confirm & Alert Dialogs`, `Date Pickers & Payables`, `Combobox & Command Palette`, `Numbered Pagination & GRN History`, `Context Menu UI`, `Table Component`, `Navigation Menu UI`, `Toggle Components`, `Notification Bell & Popover`, `alert`, `input-otp`, `accordion`, `avatar`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _459 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI: Stat Cards & Badges` be split into smaller, more focused modules?**
  _Cohesion score 0.05101327742837177 - nodes in this community are weakly interconnected._
- **Should `Composer Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `Laravel Controllers (Core)` be split into smaller, more focused modules?**
  _Cohesion score 0.12624584717607973 - nodes in this community are weakly interconnected._