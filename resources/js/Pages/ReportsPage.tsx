import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import NumberedPagination from '@/components/shared/NumberedPagination';
import { format } from 'date-fns';
import { Printer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

type ReportTab = 'outstanding' | 'profit-loss' | 'expenses' | 'purchases' | 'invoice-summary' | 'purchase-summary' | 'sales';

function ReportsPage() {
    const [tab, setTab] = useState<ReportTab>('outstanding');

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
                {([
                    { key: 'outstanding', label: 'Outstanding' },
                    { key: 'profit-loss', label: 'Profit & Loss' },
                    { key: 'expenses', label: 'Expenses' },
                    { key: 'purchases', label: 'Purchases' },
                    { key: 'sales', label: 'Sales' },
                    { key: 'invoice-summary', label: 'Invoice Summary' },
                    { key: 'purchase-summary', label: 'Purchase Summary' },
                ] as const).map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={cn('px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                            tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'outstanding' && <OutstandingReport />}
            {tab === 'profit-loss' && <ProfitLossReport />}
            {tab === 'expenses' && <ExpensesReport />}
            {tab === 'purchases' && <PurchasesReport />}
            {tab === 'sales' && <SalesReport />}
            {tab === 'invoice-summary' && <InvoiceSummaryReport />}
            {tab === 'purchase-summary' && <PurchaseSummaryReport />}
        </div>
    );
}

// ─── Outstanding Report ─────────────────────────────────────────────
function OutstandingReport() {
    const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
    const [customerId, setCustomerId] = useState('');
    const [period, setPeriod] = useState('30');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/customers/all').then((r) => setCustomers(r.data)).catch(() => {});
    }, []);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/reports/outstanding', {
                params: { customer_id: customerId || undefined, period },
            });
            setData(res.data);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [customerId, period]);

    const customerOptions = [
        { value: 'all', label: 'All Customers' },
        ...customers.map((c) => ({ value: String(c.id), label: c.name })),
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-64">
                    <Combobox options={customerOptions} value={customerId} onValueChange={(v) => setCustomerId(v === 'all' ? '' : v)}
                        placeholder="All Customers" searchPlaceholder="Search..." className="h-9 text-sm" />
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs"
                    onClick={() => window.open(`/reports/outstanding/pdf?period=${period}${customerId ? `&customer_id=${customerId}` : ''}`, '_blank')}>
                    <Printer className="h-3.5 w-3.5" /> Print
                </Button>
            </div>

            {data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Invoices</p>
                            <p className="text-2xl font-bold text-primary">{data.count}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Invoiced</p>
                            <p className="text-2xl font-bold">Rs. {Number(data.total_invoiced).toLocaleString()}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Outstanding</p>
                            <p className="text-2xl font-bold text-destructive">Rs. {Number(data.total_outstanding).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Invoice #</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Total</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Collected</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Outstanding</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Days Overdue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.invoices.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">No outstanding invoices found.</td></tr>
                                    ) : data.invoices.map((inv: any) => (
                                        <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm font-mono text-primary">{inv.invoice_number}</td>
                                            <td className="px-4 py-3 text-sm">{inv.invoice_date}</td>
                                            <td className="px-4 py-3 text-sm">{inv.customer}</td>
                                            <td className="px-4 py-3 text-sm text-right">Rs. {Number(inv.grand_total).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-right text-green-600">Rs. {Number(inv.collected).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-destructive">Rs. {Number(inv.outstanding).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                                                    inv.days_overdue > 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : inv.days_overdue > 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>
                                                    {inv.days_overdue} days
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Profit & Loss Report ───────────────────────────────────────────
function ProfitLossReport() {
    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo]     = useState(format(new Date(), 'yyyy-MM-dd'));
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/reports/profit-loss', { params: { date_from: dateFrom, date_to: dateTo } });
            setData(res.data);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [dateFrom, dateTo]);

    return (
        <div className="space-y-4">
            <div className="flex gap-3 items-end">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                    <DatePicker value={dateFrom} onChange={setDateFrom} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                    <DatePicker value={dateTo} onChange={setDateTo} className="h-9 text-sm w-44" />
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs"
                    onClick={() => window.open(`/reports/profit-loss/pdf?date_from=${dateFrom}&date_to=${dateTo}`, '_blank')}>
                    <Printer className="h-3.5 w-3.5" /> Print
                </Button>
            </div>

            {data && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                            <p className="text-2xl font-bold text-green-600">Rs. {Number(data.revenue).toLocaleString()}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Purchases</p>
                            <p className="text-2xl font-bold text-blue-600">Rs. {Number(data.purchases).toLocaleString()}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                            <p className="text-2xl font-bold text-amber-600">Rs. {Number(data.expenses).toLocaleString()}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                            <p className={cn('text-2xl font-bold', data.profit >= 0 ? 'text-green-600' : 'text-destructive')}>
                                Rs. {Number(data.profit).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h3 className="text-sm font-semibold">Profit & Loss Statement</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-medium">Revenue (Collected)</span>
                                <span className="font-semibold text-green-600">Rs. {Number(data.revenue).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-medium">Less: Purchases (Paid)</span>
                                <span className="text-blue-600">Rs. {Number(data.purchases).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="font-medium">Less: Expenses</span>
                                <span className="text-amber-600">Rs. {Number(data.expenses).toLocaleString()}</span>
                            </div>
                            {data.expense_breakdown?.length > 0 && (
                                <div className="pl-6 space-y-1 py-1">
                                    {data.expense_breakdown.map((cat: any, i: number) => (
                                        <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                            <span>{cat.category}</span>
                                            <span>Rs. {Number(cat.total).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-t-2 border-border">
                                <span className="font-bold">Net Profit / (Loss)</span>
                                <span className={cn('font-bold text-lg', data.profit >= 0 ? 'text-green-600' : 'text-destructive')}>
                                    Rs. {Number(data.profit).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Expenses Report ────────────────────────────────────────────────
function ExpensesReport() {
    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo]     = useState(format(new Date(), 'yyyy-MM-dd'));
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/expenses-category/all').then((r) => setCategories(r.data)).catch(() => {});
    }, []);

    const fetch = async (pg: number) => {
        setLoading(true);
        try {
            const res = await axios.get('/reports/expenses', {
                params: { date_from: dateFrom, date_to: dateTo, category_id: categoryId || undefined, page: pg },
            });
            setData(res.data);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { setPage(1); fetch(1); }, [dateFrom, dateTo, categoryId]);
    useEffect(() => { fetch(page); }, [page]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                    <DatePicker value={dateFrom} onChange={setDateFrom} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                    <DatePicker value={dateTo} onChange={setDateTo} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                    <Select value={categoryId} onValueChange={(v) => setCategoryId(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs"
                        onClick={() => window.open(`/reports/expenses/pdf?date_from=${dateFrom}&date_to=${dateTo}${categoryId ? `&category_id=${categoryId}` : ''}`, '_blank')}>
                        <Printer className="h-3.5 w-3.5" /> Print
                    </Button>
                </div>
            </div>

            {data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-amber-600">Rs. {Number(data.total_amount).toLocaleString()}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">By Category</p>
                            <div className="space-y-1">
                                {data.category_summary?.map((c: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{c.category}</span>
                                        <span className="font-medium">Rs. {Number(c.total).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Expense #</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Category</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Description</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.expenses.data?.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-10 text-sm text-muted-foreground">No expenses found.</td></tr>
                                    ) : data.expenses.data?.map((exp: any) => (
                                        <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm font-mono text-primary">{exp.expense_number}</td>
                                            <td className="px-4 py-3 text-sm">{exp.date}</td>
                                            <td className="px-4 py-3 text-sm">{exp.category?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{exp.description || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">Rs. {Number(exp.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <NumberedPagination
                        currentPage={data.expenses.current_page}
                        lastPage={data.expenses.last_page}
                        total={data.expenses.total}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}

// ─── Purchases Report ───────────────────────────────────────────────
function PurchasesReport() {
    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo]     = useState(format(new Date(), 'yyyy-MM-dd'));
    const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
    const [supplierId, setSupplierId] = useState('');
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/suppliers/all').then((r) => setSuppliers(r.data)).catch(() => {});
    }, []);

    const fetch = async (pg: number) => {
        setLoading(true);
        try {
            const res = await axios.get('/reports/purchases', {
                params: { date_from: dateFrom, date_to: dateTo, supplier_id: supplierId || undefined, page: pg },
            });
            setData(res.data);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { setPage(1); fetch(1); }, [dateFrom, dateTo, supplierId]);
    useEffect(() => { fetch(page); }, [page]);

    const supplierOptions = [
        { value: 'all', label: 'All Suppliers' },
        ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                    <DatePicker value={dateFrom} onChange={setDateFrom} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                    <DatePicker value={dateTo} onChange={setDateTo} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Supplier</label>
                    <Combobox options={supplierOptions} value={supplierId} onValueChange={(v) => setSupplierId(v === 'all' ? '' : v)}
                        placeholder="All Suppliers" searchPlaceholder="Search..." className="h-9 text-sm" />
                </div>
                <div className="flex items-end">
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs"
                        onClick={() => window.open(`/reports/purchases/pdf?date_from=${dateFrom}&date_to=${dateTo}${supplierId ? `&supplier_id=${supplierId}` : ''}`, '_blank')}>
                        <Printer className="h-3.5 w-3.5" /> Print
                    </Button>
                </div>
            </div>

            {data && (
                <>
                    <div className="bg-card rounded-xl border border-border p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Purchases</p>
                        <p className="text-2xl font-bold text-blue-600">Rs. {Number(data.total_amount).toLocaleString()}</p>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">GRN #</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Supplier</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tax Invoice No.</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                                        <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.grns.data?.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-sm text-muted-foreground">No GRNs found.</td></tr>
                                    ) : data.grns.data?.map((grn: any) => (
                                        <tr key={grn.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm font-mono text-primary">{grn.grn_number}</td>
                                            <td className="px-4 py-3 text-sm">{grn.received_date}</td>
                                            <td className="px-4 py-3 text-sm">{grn.supplier?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-sm font-mono">{grn.supplier_invoice_no || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">Rs. {Number(grn.total_amount).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                                                    grn.payment_status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                                                    {grn.payment_status ?? 'unpaid'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <NumberedPagination
                        currentPage={data.grns.current_page}
                        lastPage={data.grns.last_page}
                        total={data.grns.total}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}

// ─── Sales Report ───────────────────────────────────────────────────
function SalesReport() {
    const todayStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const todayEnd = format(new Date(), 'yyyy-MM-dd');

    const [dateFrom, setDateFrom] = useState(todayStart);
    const [dateTo, setDateTo] = useState(todayEnd);
    const [entities, setEntities] = useState<{ id: number; name: string }[]>([]);
    const [entityId, setEntityId] = useState('');
    const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
    const [customerId, setCustomerId] = useState('');

    const [appliedFilters, setAppliedFilters] = useState<{ dateFrom: string; dateTo: string; entityId: string; customerId: string } | null>(null);
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/business-entities/all').then((r) => setEntities(r.data)).catch(() => {});
        axios.get('/customers/all').then((r) => setCustomers(r.data)).catch(() => {});
    }, []);

    const fetchData = async (filters: { dateFrom: string; dateTo: string; entityId: string; customerId: string }, pg: number) => {
        if (!filters.dateFrom || !filters.dateTo) return;
        setLoading(true);
        try {
            const res = await axios.get('/reports/sales', {
                params: {
                    date_from: filters.dateFrom,
                    date_to: filters.dateTo,
                    business_entity_id: filters.entityId || undefined,
                    customer_id: filters.customerId || undefined,
                    page: pg,
                },
            });
            setData(res.data);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    const handleApply = () => {
        const filters = { dateFrom, dateTo, entityId, customerId };
        setAppliedFilters(filters);
        setPage(1);
        fetchData(filters, 1);
    };

    useEffect(() => {
        if (appliedFilters) fetchData(appliedFilters, page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const entityOptions = [
        { value: 'all', label: 'All Entities' },
        ...entities.map((e) => ({ value: String(e.id), label: e.name })),
    ];
    const customerOptions = [
        { value: 'all', label: 'All Customers' },
        ...customers.map((c) => ({ value: String(c.id), label: c.name })),
    ];

    const exportParams = () => {
        if (!appliedFilters) return null;
        const params = new URLSearchParams({ date_from: appliedFilters.dateFrom, date_to: appliedFilters.dateTo });
        if (appliedFilters.entityId) params.set('business_entity_id', appliedFilters.entityId);
        if (appliedFilters.customerId) params.set('customer_id', appliedFilters.customerId);
        return params;
    };

    const handleExportCsv = () => {
        const params = exportParams();
        if (!params) return;
        window.open(`/reports/sales/csv?${params.toString()}`, '_blank');
    };

    const handlePrint = () => {
        const params = exportParams();
        if (!params) return;
        window.open(`/reports/sales/pdf?${params.toString()}`, '_blank');
    };

    const fmt = (n: number) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const statusColor = (status: string) => {
        if (status === 'paid') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'partial') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                    <DatePicker value={dateFrom} onChange={setDateFrom} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                    <DatePicker value={dateTo} onChange={setDateTo} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Entity</label>
                    <Select value={entityId || 'all'} onValueChange={(v) => setEntityId(v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All Entities" /></SelectTrigger>
                        <SelectContent>
                            {entityOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer</label>
                    <Combobox options={customerOptions} value={customerId} onValueChange={(v) => setCustomerId(v === 'all' ? '' : v)}
                        placeholder="All Customers" searchPlaceholder="Search..." className="h-9 text-sm w-56" />
                </div>
                <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={handleApply} disabled={loading}>
                    Apply Filter
                </Button>
                {appliedFilters && data?.records?.data?.length > 0 && (
                    <>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handlePrint}>
                            <Printer className="h-3.5 w-3.5" /> Print
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExportCsv}>
                            <Download className="h-3.5 w-3.5" /> Export CSV
                        </Button>
                    </>
                )}
            </div>

            {appliedFilters && data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Invoices</p>
                            <p className="text-2xl font-bold text-primary">{data.totals?.count ?? 0}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                            <p className="text-2xl font-bold text-green-600">Rs. {fmt(data.totals?.grand_total ?? 0)}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Collected</p>
                            <p className="text-2xl font-bold text-blue-600">Rs. {fmt(data.totals?.collected ?? 0)}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                            <p className="text-2xl font-bold text-destructive">Rs. {fmt(data.totals?.balance ?? 0)}</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">#</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Invoice #</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Entity</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Sub Total</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Discount</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">VAT</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Grand Total</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Balance</th>
                                        <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.records?.data?.length === 0 ? (
                                        <tr><td colSpan={11} className="text-center py-10 text-sm text-muted-foreground">No sales found for the selected filters.</td></tr>
                                    ) : data.records?.data?.map((row: any) => (
                                        <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{row.serial_no}</td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">{row.invoice_date}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-primary">{row.invoice_number}</td>
                                            <td className="px-4 py-3 text-sm">{row.customer_name}</td>
                                            <td className="px-4 py-3 text-sm">{row.business_entity}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.sub_total)}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.discount)}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.vat)}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums font-semibold">Rs. {fmt(row.grand_total)}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums text-destructive">Rs. {fmt(row.balance)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(row.status))}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {data.records?.data?.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-border bg-muted/30">
                                            <td colSpan={5} className="px-4 py-3 text-sm font-bold">Grand Total</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.sub_total ?? 0)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.discount ?? 0)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.vat ?? 0)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.grand_total ?? 0)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.balance ?? 0)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {data.records?.last_page > 1 && (
                        <NumberedPagination
                            currentPage={data.records.current_page}
                            lastPage={data.records.last_page}
                            total={data.records.total}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// ─── Invoice Summary (Output Tax) ──────────────────────────────────
function InvoiceSummaryReport() {
    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo]     = useState(format(new Date(), 'yyyy-MM-dd'));
    const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
    const [customerId, setCustomerId] = useState('');
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        axios.get('/customers/all').then((r) => setCustomers(r.data.filter((c: any) => c.is_vat === 1))).catch(() => {});
    }, []);

    const handleSearch = async (pg = 1) => {
        if (!dateFrom || !dateTo) return;
        setLoading(true);
        try {
            const res = await axios.get('/reports/invoice-summary', {
                params: { date_from: dateFrom, date_to: dateTo, customer_id: customerId || undefined, page: pg },
            });
            setData(res.data);
            setHasSearched(true);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { setPage(1); handleSearch(1); }, [dateFrom, dateTo, customerId]);
    useEffect(() => { if (hasSearched) handleSearch(page); }, [page]);

    const customerOptions = [
        { value: 'all', label: 'All Customers' },
        ...customers.map((c) => ({ value: String(c.id), label: c.name })),
    ];

    const handleExportCsv = () => {
        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
        if (customerId) params.set('customer_id', customerId);
        window.open(`/reports/invoice-summary/csv?${params.toString()}`, '_blank');
    };

    const fmt = (n: number) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                    <DatePicker value={dateFrom} onChange={setDateFrom} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                    <DatePicker value={dateTo} onChange={setDateTo} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer</label>
                    <Combobox options={customerOptions} value={customerId} onValueChange={(v) => setCustomerId(v === 'all' ? '' : v)}
                        placeholder="All Customers" searchPlaceholder="Search..." className="h-9 text-sm" />
                </div>
                {hasSearched && data?.records?.data?.length > 0 && (
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExportCsv}>
                        <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                )}
            </div>

            {hasSearched && data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Records</p>
                            <p className="text-2xl font-bold text-primary">{data.records?.total ?? 0}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Value of Supply</p>
                            <p className="text-2xl font-bold text-green-600">Rs. {fmt(data.totals?.sum_net ?? 0)}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Output VAT</p>
                            <p className="text-2xl font-bold text-blue-600">Rs. {fmt(data.totals?.sum_vat ?? 0)}</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">#</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Invoice Date</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tax Invoice No</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Purchaser's TIN</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name of the Purchaser</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Value of Supply</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">VAT Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.records?.data?.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">No tax invoices found for the selected period.</td></tr>
                                    ) : data.records?.data?.map((row: any) => (
                                        <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{row.serial_no}</td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">{row.invoice_date}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-primary">{row.tax_invoice_no}</td>
                                            <td className="px-4 py-3 text-sm font-mono">{row.tin || '—'}</td>
                                            <td className="px-4 py-3 text-sm">{row.purchaser_name}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.net_amount)}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.vat_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {data.records?.data?.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-border bg-muted/30">
                                            <td colSpan={5} className="px-4 py-3 text-sm font-bold">Grand Total</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.sum_net ?? 0)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.sum_vat ?? 0)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {data.records?.last_page > 1 && (
                        <NumberedPagination
                            currentPage={data.records.current_page}
                            lastPage={data.records.last_page}
                            total={data.records.total}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

// ─── Purchase Summary (Input Tax) ──────────────────────────────────
function PurchaseSummaryReport() {
    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo]     = useState(format(new Date(), 'yyyy-MM-dd'));
    const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
    const [supplierId, setSupplierId] = useState('');
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        axios.get('/suppliers/all').then((r) => setSuppliers(r.data.filter((s: any) => s.is_vat === 1))).catch(() => {});
    }, []);

    const handleSearch = async (pg = 1) => {
        if (!dateFrom || !dateTo) return;
        setLoading(true);
        try {
            const res = await axios.get('/reports/purchase-summary', {
                params: { date_from: dateFrom, date_to: dateTo, supplier_id: supplierId || undefined, page: pg },
            });
            setData(res.data);
            setHasSearched(true);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { setPage(1); handleSearch(1); }, [dateFrom, dateTo, supplierId]);
    useEffect(() => { if (hasSearched) handleSearch(page); }, [page]);

    const supplierOptions = [
        { value: 'all', label: 'All Suppliers' },
        ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
    ];

    const handleExportCsv = () => {
        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
        if (supplierId) params.set('supplier_id', supplierId);
        window.open(`/reports/purchase-summary/csv?${params.toString()}`, '_blank');
    };

    const fmt = (n: number) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                    <DatePicker value={dateFrom} onChange={setDateFrom} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                    <DatePicker value={dateTo} onChange={setDateTo} className="h-9 text-sm w-44" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Supplier</label>
                    <Combobox options={supplierOptions} value={supplierId} onValueChange={(v) => setSupplierId(v === 'all' ? '' : v)}
                        placeholder="All Suppliers" searchPlaceholder="Search..." className="h-9 text-sm" />
                </div>
                {hasSearched && data?.records?.data?.length > 0 && (
                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExportCsv}>
                        <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                )}
            </div>

            {hasSearched && data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Records</p>
                            <p className="text-2xl font-bold text-primary">{data.records?.total ?? 0}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Value of Purchase</p>
                            <p className="text-2xl font-bold text-green-600">Rs. {fmt(data.totals?.sum_net ?? 0)}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total Input VAT</p>
                            <p className="text-2xl font-bold text-blue-600">Rs. {fmt(data.totals?.sum_vat ?? 0)}</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">#</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tax Invoice No.</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Supplier's TIN</th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name of the Supplier</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Value of Purchase</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">VAT Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.records?.data?.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">No VAT purchase records found for the selected period.</td></tr>
                                    ) : data.records?.data?.map((row: any) => (
                                        <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{row.serial_no}</td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap">{row.date}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-primary">{row.supplier_invoice_no}</td>
                                            <td className="px-4 py-3 text-sm font-mono">{row.tin || '—'}</td>
                                            <td className="px-4 py-3 text-sm">{row.supplier_name}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.net_amount)}</td>
                                            <td className="px-4 py-3 text-sm text-right whitespace-nowrap tabular-nums">Rs. {fmt(row.vat_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {data.records?.data?.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-border bg-muted/30">
                                            <td colSpan={5} className="px-4 py-3 text-sm font-bold">Grand Total</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.sum_net ?? 0)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold whitespace-nowrap tabular-nums">Rs. {fmt(data.totals?.sum_vat ?? 0)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {data.records?.last_page > 1 && (
                        <NumberedPagination
                            currentPage={data.records.current_page}
                            lastPage={data.records.last_page}
                            total={data.records.total}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default function WrappedReportsPage() {
    return (
        <>
            <Head title="Reports" />
            <ReportsPage />
        </>
    );
}

(WrappedReportsPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
