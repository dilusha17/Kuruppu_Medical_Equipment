import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Printer, Wallet, Landmark, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';

interface Transaction {
    id: string;
    date: string;
    type: 'inflow' | 'outflow';
    description: string;
    party: string;
    deposit_account: string;
    account_type: string | null;
    account_id: number | null;
    reference_no: string | null;
    amount: number;
}

interface AccountSummary {
    id: number;
    name: string;
    type: string;
    bank_name: string | null;
    inflow: number;
    outflow: number;
    balance: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];
const OUTFLOW_COLORS = ['#ef4444', '#b91c1c', '#f87171', '#dc2626', '#fca5a5', '#991b1b', '#f43f5e', '#7f1d1d'];

function CashFlowPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>([]);
    const [totalInflow, setTotalInflow] = useState(0);
    const [totalOutflow, setTotalOutflow] = useState(0);
    const [netFlow, setNetFlow] = useState(0);
    const [accounts, setAccounts] = useState<{ id: number; name: string; type: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const [dateFrom, setDateFrom] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [accountFilter, setAccountFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

    useEffect(() => {
        axios.get('/deposit-accounts/all').then((res) => setAccounts(res.data)).catch(() => {});
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/cash-flow/data', {
                params: {
                    date_from: dateFrom,
                    date_to: dateTo,
                    deposit_account_id: accountFilter || undefined,
                },
            });
            setTransactions(res.data.transactions);
            setAccountSummaries(res.data.account_summaries);
            setTotalInflow(res.data.total_inflow);
            setTotalOutflow(res.data.total_outflow);
            setNetFlow(res.data.net_flow);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFilter = () => fetchData();

    const handlePrint = () => {
        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
        if (accountFilter) params.set('deposit_account_id', accountFilter);
        window.open(`/cash-flow/pdf?${params.toString()}`, '_blank');
    };

    const filteredTransactions = typeFilter === 'all'
        ? transactions
        : transactions.filter((t) => t.type === typeFilter);

    // Chart data for bar chart
    const barChartData = accountSummaries.map((acc) => ({
        name: acc.name,
        Inflow: Number(acc.inflow),
        Outflow: Number(acc.outflow),
        Balance: Number(acc.balance),
    }));

    // Pie chart data for inflow distribution
    const inflowPieData = accountSummaries
        .filter((a) => Number(a.inflow) > 0)
        .map((a) => ({ name: a.name, value: Number(a.inflow) }));

    const outflowPieData = accountSummaries
        .filter((a) => Number(a.outflow) > 0)
        .map((a) => ({ name: a.name, value: Number(a.outflow) }));

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Filters */}
            <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                        <DatePicker value={dateFrom} onChange={setDateFrom} className="w-40" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                        <DatePicker value={dateTo} onChange={setDateTo} className="w-40" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Account</label>
                        <Select value={accountFilter || 'all'} onValueChange={(v) => setAccountFilter(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-48 h-9 text-sm">
                                <SelectValue placeholder="All Accounts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Accounts</SelectItem>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={String(a.id)}>
                                        {a.name} ({a.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleFilter} className="h-9">Apply</Button>
                    <Button variant="outline" onClick={handlePrint} className="h-9 gap-2 ml-auto">
                        <Printer className="h-4 w-4" /> Print PDF
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-muted-foreground">Total Inflow</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">Rs. {Number(totalInflow).toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <p className="text-xs text-muted-foreground">Total Outflow</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">Rs. {Number(totalOutflow).toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border-2 border-primary/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                        <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                    </div>
                    <p className={cn('text-2xl font-bold', netFlow >= 0 ? 'text-green-600' : 'text-red-600')}>
                        Rs. {Number(netFlow).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Account Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {accountSummaries.map((acc, i) => (
                    <div key={acc.id} className="bg-card rounded-xl border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                            {acc.type === 'cash' ? (
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Wallet className="h-4 w-4 text-green-600" />
                                </div>
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Landmark className="h-4 w-4 text-blue-600" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium">{acc.name}</p>
                                <p className="text-[10px] text-muted-foreground">{acc.bank_name || acc.type}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">In</span>
                                <span className="text-green-600 font-medium">Rs. {Number(acc.inflow).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Out</span>
                                <span className="text-red-600 font-medium">Rs. {Number(acc.outflow).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                                <span className="text-muted-foreground">Balance</span>
                                <span className={Number(acc.balance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    Rs. {Number(acc.balance).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            {accountSummaries.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Bar Chart */}
                    <div className="bg-card rounded-xl border border-border p-4">
                        <h3 className="text-sm font-semibold mb-4">Inflow vs Outflow by Account</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip
                                    formatter={(value: number) => `Rs. ${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '12px', color: '#000' }}
                                    labelStyle={{ color: '#000' }}
                                    itemStyle={{ color: '#000' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="Inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Charts */}
                    <div className="bg-card rounded-xl border border-border p-4">
                        <h3 className="text-sm font-semibold mb-4">Distribution by Account</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-center text-muted-foreground mb-2">Inflow</p>
                                {inflowPieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={inflowPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false} style={{ fontSize: '9px' }}>
                                                {inflowPieData.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`}
                                                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">No data</div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-center text-muted-foreground mb-2">Outflow</p>
                                {outflowPieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={outflowPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false} style={{ fontSize: '9px' }}>
                                                {outflowPieData.map((_, i) => (
                                                    <Cell key={i} fill={OUTFLOW_COLORS[i % OUTFLOW_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`}
                                                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">No data</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Type Filter + Table */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(['all', 'inflow', 'outflow'] as const).map((t) => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={cn('px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                                typeFilter === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {t === 'all' ? 'All' : t === 'inflow' ? 'Inflow' : 'Outflow'}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">{filteredTransactions.length} transactions</span>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Description</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Party</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Account</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Reference</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
                                    {loading ? 'Loading...' : 'No transactions found.'}
                                </td></tr>
                            ) : filteredTransactions.map((t) => (
                                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 text-sm">{t.date}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                                            t.type === 'inflow'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        )}>
                                            {t.type === 'inflow' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{t.description}</td>
                                    <td className="px-4 py-3 text-sm">{t.party}</td>
                                    <td className="px-4 py-3 text-sm">{t.deposit_account}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{t.reference_no || '—'}</td>
                                    <td className={cn('px-4 py-3 text-sm font-semibold text-right',
                                        t.type === 'inflow' ? 'text-green-600' : 'text-red-600')}>
                                        {t.type === 'inflow' ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function WrappedCashFlowPage() {
    return (
        <>
            <Head title="Cash Flow" />
            <CashFlowPage />
        </>
    );
}

(WrappedCashFlowPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
