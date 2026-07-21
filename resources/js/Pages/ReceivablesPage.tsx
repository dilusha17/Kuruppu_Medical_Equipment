// import { Head } from '@inertiajs/react';
// import AppShell from '@/AppShell';
// import React, { useState } from 'react';
// import {
//   initialInvoices,
//   initialReceivablePayments,
//   type Invoice,
//   type ReceivablePayment,
// } from '@/data/mockData';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { DatePicker } from '@/components/ui/date-picker';
// import SearchBar from '@/components/shared/SearchBar';
// import Modal from '@/components/shared/Modal';
// import { format } from 'date-fns';
// import { Plus, CreditCard, CheckCircle2, Clock, Eye } from 'lucide-react';
// import { cn } from '@/lib/utils';

// // Compute outstanding balance per invoice after applying all payment records
// function computeOutstanding(invoice: Invoice, payments: ReceivablePayment[]): number {
//   const paid = payments
//     .filter((p) => p.invoiceId === invoice.id)
//     .reduce((s, p) => s + p.amount, 0);
//   return Math.max(0, invoice.total - paid);
// }

// function ReceivablesPage() {
//   const [invoices] = useState<Invoice[]>(initialInvoices);
//   const [payments, setPayments] = useState<ReceivablePayment[]>(initialReceivablePayments);

//   // ── Receivable list filters ───────────────────────────────────────────────
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'outstanding' | 'paid'>('all');

//   // ── Add payment modal ─────────────────────────────────────────────────────
//   const [addOpen, setAddOpen] = useState(false);
//   const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
//   const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [payAmount, setPayAmount] = useState('');
//   const [payNotes, setPayNotes] = useState('');

//   // ── Payment history modal ─────────────────────────────────────────────────
//   const [historyInvoice, setHistoryInvoice] = useState<Invoice | null>(null);

//   // Filtered receivable list (all invoices are receivable once sold on credit or partial)
//   const filteredInvoices = invoices.filter((inv) => {
//     const outstanding = computeOutstanding(inv, payments);
//     const matchSearch =
//       inv.number.toLowerCase().includes(search.toLowerCase()) ||
//       (inv.customerName ?? '').toLowerCase().includes(search.toLowerCase());
//     const matchStatus =
//       statusFilter === 'all' ||
//       (statusFilter === 'outstanding' && outstanding > 0) ||
//       (statusFilter === 'paid' && outstanding === 0);
//     return matchSearch && matchStatus;
//   });

//   // Summary stats
//   const totalReceivable = invoices.reduce((s, inv) => s + inv.total, 0);
//   const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
//   const totalOutstanding = invoices.reduce((s, inv) => s + computeOutstanding(inv, payments), 0);

//   const openAddPayment = (inv: Invoice) => {
//     setPayInvoice(inv);
//     setPayAmount(String(computeOutstanding(inv, payments)));
//     setPayDate(format(new Date(), 'yyyy-MM-dd'));
//     setPayNotes('');
//     setAddOpen(true);
//   };

//   const handleAddPayment = () => {
//     if (!payInvoice || !payDate || !payAmount) return;
//     const amount = Number(payAmount);
//     if (amount <= 0) return;
//     const newPayment: ReceivablePayment = {
//       id: String(Date.now()),
//       invoiceId: payInvoice.id,
//       invoiceNumber: payInvoice.number,
//       customerName: payInvoice.customerName ?? 'Walk-in',
//       date: payDate,
//       amount,
//       notes: payNotes || undefined,
//     };
//     setPayments((prev) => [...prev, newPayment]);
//     setAddOpen(false);
//   };

//   const invoicePayments = (inv: Invoice) => payments.filter((p) => p.invoiceId === inv.id);

//   return (
//     <div className="space-y-5 animate-fade-in">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="bg-card rounded-xl border border-border p-4">
//           <p className="text-xs text-muted-foreground mb-1">Total Invoiced</p>
//           <p className="text-2xl font-bold text-primary">Rs. {totalReceivable.toLocaleString()}</p>
//         </div>
//         <div className="bg-card rounded-xl border border-border p-4">
//           <p className="text-xs text-muted-foreground mb-1">Total Collected</p>
//           <p className="text-2xl font-bold text-green-600">Rs. {totalCollected.toLocaleString()}</p>
//         </div>
//         <div className="bg-card rounded-xl border border-border p-4">
//           <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
//           <p className="text-2xl font-bold text-destructive">Rs. {totalOutstanding.toLocaleString()}</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-3">
//         <div className="w-full sm:w-72">
//           <SearchBar value={search} onChange={setSearch} placeholder="Search by invoice # or customer..." />
//         </div>
//         <div className="flex gap-2">
//           {(['all', 'outstanding', 'paid'] as const).map((s) => (
//             <button
//               key={s}
//               onClick={() => setStatusFilter(s)}
//               className={cn(
//                 'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
//                 statusFilter === s
//                   ? 'bg-primary text-primary-foreground'
//                   : 'bg-muted text-muted-foreground hover:text-foreground'
//               )}
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Receivables Table */}
//       <div className="bg-card rounded-xl border border-border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-border bg-muted/50">
//                 <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Invoice #</th>
//                 <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
//                 <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
//                 <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Invoice Total</th>
//                 <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Collected</th>
//                 <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Outstanding</th>
//                 <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
//                 <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredInvoices.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="text-center py-10 text-sm text-muted-foreground">
//                     No invoices found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredInvoices.map((inv) => {
//                   const collected = invoicePayments(inv).reduce((s, p) => s + p.amount, 0);
//                   const outstanding = Math.max(0, inv.total - collected);
//                   const isPaid = outstanding === 0;
//                   return (
//                     <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30">
//                       <td className="px-4 py-3 text-sm font-medium text-primary">{inv.number}</td>
//                       <td className="px-4 py-3 text-sm">{inv.date}</td>
//                       <td className="px-4 py-3 text-sm">{inv.customerName ?? 'Walk-in'}</td>
//                       <td className="px-4 py-3 text-sm font-semibold text-right">
//                         Rs. {inv.total.toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-right text-green-600">
//                         Rs. {collected.toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-right font-semibold text-destructive">
//                         {outstanding > 0 ? `Rs. ${outstanding.toLocaleString()}` : '—'}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         {isPaid ? (
//                           <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
//                             <CheckCircle2 className="h-3 w-3" /> Paid
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
//                             <Clock className="h-3 w-3" /> Outstanding
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center justify-end gap-1">
//                           <button
//                             onClick={() => setHistoryInvoice(inv)}
//                             className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
//                             title="Payment history"
//                           >
//                             <Eye className="h-3.5 w-3.5" />
//                           </button>
//                           {!isPaid && (
//                             <button
//                               onClick={() => openAddPayment(inv)}
//                               className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
//                               title="Add payment"
//                             >
//                               <Plus className="h-3.5 w-3.5" />
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Payment Modal */}
//       <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Payment Received">
//         {payInvoice && (
//           <div className="space-y-4">
//             <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
//               <p>
//                 <span className="text-muted-foreground">Invoice:</span>{' '}
//                 <span className="font-medium">{payInvoice.number}</span>
//               </p>
//               <p>
//                 <span className="text-muted-foreground">Customer:</span>{' '}
//                 {payInvoice.customerName ?? 'Walk-in'}
//               </p>
//               <p>
//                 <span className="text-muted-foreground">Outstanding:</span>{' '}
//                 <span className="font-semibold text-destructive">
//                   Rs. {computeOutstanding(payInvoice, payments).toLocaleString()}
//                 </span>
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground mb-1 block">
//                   Payment Date
//                 </label>
//                 <DatePicker value={payDate} onChange={setPayDate} className="w-full" />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground mb-1 block">
//                   Amount (Rs.)
//                 </label>
//                 <Input
//                   type="number"
//                   value={payAmount}
//                   onChange={(e) => setPayAmount(e.target.value)}
//                   placeholder="0.00"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-xs font-medium text-muted-foreground mb-1 block">
//                 Notes (optional)
//               </label>
//               <Input
//                 value={payNotes}
//                 onChange={(e) => setPayNotes(e.target.value)}
//                 placeholder="e.g. Bank transfer, cheque no..."
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <Button variant="outline" onClick={() => setAddOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddPayment} className="gap-2">
//                 <CreditCard className="h-4 w-4" /> Record Payment
//               </Button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Payment History Modal */}
//       <Modal
//         open={!!historyInvoice}
//         onClose={() => setHistoryInvoice(null)}
//         title={`Payment History — ${historyInvoice?.number}`}
//         size="lg"
//       >
//         {historyInvoice && (
//           <div className="space-y-3">
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <p>
//                 <span className="text-muted-foreground">Customer:</span>{' '}
//                 {historyInvoice.customerName ?? 'Walk-in'}
//               </p>
//               <p>
//                 <span className="text-muted-foreground">Invoice Total:</span>{' '}
//                 <span className="font-semibold">Rs. {historyInvoice.total.toLocaleString()}</span>
//               </p>
//             </div>
//             <div className="border rounded-lg overflow-hidden">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b bg-muted/50">
//                     <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Date</th>
//                     <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Amount</th>
//                     <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Notes</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {invoicePayments(historyInvoice).length === 0 ? (
//                     <tr>
//                       <td colSpan={3} className="text-center py-6 text-muted-foreground">
//                         No payments recorded yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     invoicePayments(historyInvoice).map((p) => (
//                       <tr key={p.id} className="border-b last:border-0">
//                         <td className="px-4 py-2">{p.date}</td>
//                         <td className="px-4 py-2 text-right font-medium text-green-600">
//                           Rs. {p.amount.toLocaleString()}
//                         </td>
//                         <td className="px-4 py-2 text-muted-foreground">{p.notes ?? '—'}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex justify-between pt-2 border-t text-sm">
//               <span className="text-muted-foreground">Outstanding</span>
//               <span className="font-bold text-destructive">
//                 Rs. {computeOutstanding(historyInvoice, payments).toLocaleString()}
//               </span>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

// export default function WrappedReceivablesPage() {
//   return (
//     <>
//       <Head title="Receivables" />
//       <ReceivablesPage />
//     </>
//   );
// }

// (WrappedReceivablesPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;

import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBar from '@/components/shared/SearchBar';
import NumberedPagination from '@/components/shared/NumberedPagination';
import Modal from '@/components/shared/Modal';
import { format } from 'date-fns';
import { Plus, CreditCard, CheckCircle2, Clock, Eye } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface InvoiceReceivable {
    id:             number;
    invoice_number: string;
    invoice_date:   string;
    customer:       string;
    customer_id:    number;
    grand_total:    number;
    collected:      number;
    outstanding:    number;
    status:         string;
}

interface SummaryData {
    total_invoiced:    number;
    total_collected:   number;
    total_outstanding: number;
}

function ReceivablesPage() {
    const { user } = useAuth();
    const [invoices, setInvoices]   = useState<InvoiceReceivable[]>([]);
    const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [tab,      setTab]       = useState<'all' | 'outstanding' | 'paid'>('outstanding');
    const [search,   setSearch]    = useState('');
    const [loading,  setLoading]   = useState(false);
    const [page,     setPage]      = useState(1);
    const [lastPage, setLastPage]  = useState(1);
    const [total,    setTotal]     = useState(0);
    const [summary,  setSummary]   = useState<SummaryData>({ total_invoiced: 0, total_collected: 0, total_outstanding: 0 });
    const [paymentMethods, setPaymentMethods] = useState<{ id: number; name: string }[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Selection for batch settlement
    const [selectedIds,    setSelectedIds]    = useState<Set<number>>(new Set());
    const [batchDate,      setBatchDate]      = useState(format(new Date(), 'yyyy-MM-dd'));
    const [batchMethodId,  setBatchMethodId]  = useState<string>('');
    const [batchRefNo,     setBatchRefNo]     = useState('');
    const [batchDepositId, setBatchDepositId] = useState<string>('');
    const [batchNotes,     setBatchNotes]     = useState('');
    const [batchLoading,   setBatchLoading]   = useState(false);
    const [depositAccounts, setDepositAccounts] = useState<{ id: number; name: string; type: string }[]>([]);

    // Single payment modal
    const [payOpen,   setPayOpen]   = useState(false);
    const [payTarget, setPayTarget] = useState<{ id: number; number: string; outstanding: number } | null>(null);
    const [payDate,   setPayDate]   = useState(format(new Date(), 'yyyy-MM-dd'));
    const [payAmount, setPayAmount] = useState('');
    const [payNotes,  setPayNotes]  = useState('');
    const [payDepositId, setPayDepositId] = useState<string>('');

    // Invoice detail modal
    const [invDetailOpen, setInvDetailOpen] = useState(false);
    const [invDetailData, setInvDetailData] = useState<any | null>(null);

    useEffect(() => {
        axios.get('/customers/all').then((res) => setCustomers(res.data)).catch(() => {});
        axios.get('/payment-methods/all').then((res) => setPaymentMethods(res.data)).catch(() => {});
        axios.get('/deposit-accounts/all').then((res) => setDepositAccounts(res.data)).catch(() => {});
    }, []);

    const fetchInvoices = async (pg: number, custId?: string, status?: string, q?: string) => {
        setLoading(true);
        try {
            const res = await axios.get('/receivables/invoices', {
                params: {
                    page: pg,
                    customer_id: custId || undefined,
                    status: status === 'all' ? undefined : status || undefined,
                    search: q || undefined,
                },
            });
            setInvoices(res.data.data);
            setLastPage(res.data.last_page);
            setTotal(res.data.total);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    const fetchSummary = async (custId?: string) => {
        try {
            const res = await axios.get('/receivables/summary', {
                params: { customer_id: custId || undefined },
            });
            setSummary(res.data);
        } catch (e) { console.log(e); }
    };

    useEffect(() => { fetchInvoices(page, selectedCustomer, tab, search); }, [page]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            setSelectedIds(new Set());
            fetchInvoices(1, selectedCustomer, tab, search);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, tab]);

    useEffect(() => {
        setPage(1);
        setSearch('');
        setTab('outstanding');
        setSelectedIds(new Set());
        fetchInvoices(1, selectedCustomer, 'outstanding', '');
        fetchSummary(selectedCustomer);
    }, [selectedCustomer]);

    const customerOptions = [
        { value: 'all', label: 'All Customers' },
        ...customers.map((c) => ({ value: String(c.id), label: c.name })),
    ];

    // Selection helpers
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const outstanding = invoices.filter((i) => i.outstanding > 0);
        if (selectedIds.size === outstanding.length && outstanding.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(outstanding.map((i) => i.id)));
        }
    };

    const selectedInvoices = invoices.filter((i) => selectedIds.has(i.id));
    const totalSelected = selectedInvoices.reduce((s, inv) => s + Number(inv.outstanding), 0);

    const handleBatchPayment = async () => {
        if (selectedIds.size === 0) return;
        if (!batchMethodId) { toast.error('Select a payment method.'); return; }
        if (!batchDepositId) { toast.error('Select a deposit account.'); return; }

        setBatchLoading(true);
        try {
            await axios.post('/receivables/batch-payment', {
                invoice_ids: Array.from(selectedIds),
                date: batchDate,
                payment_method_id: Number(batchMethodId),
                deposit_account_id: Number(batchDepositId),
                reference_no: batchRefNo || null,
                notes: batchNotes || null,
                user_id: user?.id,
            });
            toast.success('Batch settlement recorded!');
            setSelectedIds(new Set());
            setBatchRefNo('');
            setBatchNotes('');
            fetchInvoices(page, selectedCustomer, tab, search);
            fetchSummary(selectedCustomer);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to record batch payment.');
        } finally {
            setBatchLoading(false);
        }
    };

    // Single payment
    const openPay = (inv: InvoiceReceivable) => {
        setPayTarget({ id: inv.id, number: inv.invoice_number, outstanding: inv.outstanding });
        setPayAmount(String(inv.outstanding));
        setPayDate(format(new Date(), 'yyyy-MM-dd'));
        setPayNotes('');
        setPayDepositId('');
        setPayOpen(true);
    };

    const handleRecordPayment = async () => {
        if (!payTarget || !payAmount) return;
        setLoading(true);
        try {
            await axios.post('/receivables/payment', {
                reference_id:        payTarget.id,
                amount:              Number(payAmount),
                date:                payDate,
                notes:               payNotes || null,
                deposit_account_id:  payDepositId ? Number(payDepositId) : null,
                user_id:             user?.id,
            });
            toast.success('Payment recorded!');
            setPayOpen(false);
            fetchInvoices(page, selectedCustomer, tab, search);
            fetchSummary(selectedCustomer);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to record payment.');
        } finally {
            setLoading(false);
        }
    };

    const openInvoiceDetail = async (inv: InvoiceReceivable) => {
        try {
            const res = await axios.get(`/invoice/show/${inv.id}`);
            setInvDetailData(res.data.invoice);
            setInvDetailOpen(true);
        } catch (e) { console.log(e); }
    };

    const statusBadge = (status: string) => {
        if (status === 'paid')    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'partial') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Customer Selector */}
            <div className="bg-card rounded-xl border border-border p-4">
                <Combobox
                    options={customerOptions}
                    value={selectedCustomer}
                    onValueChange={(v) => setSelectedCustomer(v === 'all' ? '' : v)}
                    placeholder="Select customer..."
                    searchPlaceholder="Search customers..."
                    className="h-10 text-sm"
                />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Invoiced</p>
                    <p className="text-2xl font-bold text-primary">Rs. {Number(summary.total_invoiced).toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">Rs. {Number(summary.total_collected).toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                    <p className="text-2xl font-bold text-destructive">Rs. {Number(summary.total_outstanding).toLocaleString()}</p>
                </div>
            </div>

            {/* Tabs + Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(['all', 'outstanding', 'paid'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={cn('px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
                                tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="w-full sm:w-72">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search by invoice number..." />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 w-10">
                                    <input type="checkbox"
                                        checked={selectedIds.size > 0 && selectedIds.size === invoices.filter((i) => i.outstanding > 0).length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-border" />
                                </th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Invoice #</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Total</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Collected</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Outstanding</th>
                                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-10 text-sm text-muted-foreground">
                                    {loading ? 'Loading...' : 'No invoices found.'}
                                </td></tr>
                            ) : invoices.map((inv) => (
                                <tr key={inv.id} className={cn('border-b border-border last:border-0 hover:bg-muted/30',
                                    selectedIds.has(inv.id) && 'bg-primary/5')}>
                                    <td className="px-4 py-3">
                                        {inv.outstanding > 0 && (
                                            <input type="checkbox"
                                                checked={selectedIds.has(inv.id)}
                                                onChange={() => toggleSelect(inv.id)}
                                                className="rounded border-border" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-primary font-mono">{inv.invoice_number}</td>
                                    <td className="px-4 py-3 text-sm">{inv.invoice_date}</td>
                                    <td className="px-4 py-3 text-sm">{inv.customer}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-right">Rs. {Number(inv.grand_total).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">Rs. {Number(inv.collected).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-destructive">
                                        {inv.outstanding > 0 ? `Rs. ${Number(inv.outstanding).toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusBadge(inv.status)}`}>
                                            {inv.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openInvoiceDetail(inv)}
                                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="View details">
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                            {inv.outstanding > 0 && (
                                                <button onClick={() => openPay(inv)}
                                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Record single payment">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <NumberedPagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />

            {/* Batch Settlement Panel */}
            {selectedIds.size > 0 && (
                <div className="bg-card rounded-xl border-2 border-primary/30 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Batch Settlement — {selectedIds.size} invoice{selectedIds.size > 1 ? 's' : ''} selected
                        </h3>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Outstanding</p>
                            <p className="text-lg font-bold text-primary">Rs. {totalSelected.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t pt-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Received Date</label>
                            <DatePicker value={batchDate} onChange={setBatchDate} className="w-full" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
                            <Select value={batchMethodId} onValueChange={setBatchMethodId}>
                                <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference No</label>
                            <Input value={batchRefNo} onChange={(e) => setBatchRefNo(e.target.value)}
                                placeholder="Cheque / Ref #" className="h-9 text-xs" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Deposit To</label>
                            <Select value={batchDepositId} onValueChange={setBatchDepositId}>
                                <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {depositAccounts.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            {a.name} ({a.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleBatchPayment} disabled={batchLoading} className="gap-2 w-full h-9">
                                <CreditCard className="h-4 w-4" /> Settle
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Single Payment Modal */}
            <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment Received">
                {payTarget && (
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                            <p><span className="text-muted-foreground">Invoice:</span> <span className="font-medium">{payTarget.number}</span></p>
                            <p><span className="text-muted-foreground">Outstanding:</span> <span className="font-semibold text-destructive">Rs. {Number(payTarget.outstanding).toLocaleString()}</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Date</label>
                                <DatePicker value={payDate} onChange={setPayDate} className="w-full" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (Rs.)</label>
                                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Deposit To</label>
                            <Select value={payDepositId || 'none'} onValueChange={(v) => setPayDepositId(v === 'none' ? '' : v)}>
                                <SelectTrigger className="w-full h-9 text-sm">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Select account —</SelectItem>
                                    {depositAccounts.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            {a.name} ({a.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                            <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="e.g. Bank transfer..." />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
                            <Button onClick={handleRecordPayment} disabled={loading} className="gap-2">
                                <CreditCard className="h-4 w-4" /> Record Payment
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Invoice Detail Modal */}
            <Modal open={invDetailOpen} onClose={() => setInvDetailOpen(false)}
                title={invDetailData ? `Invoice — ${invDetailData.invoice_number}` : 'Invoice Details'} size="lg">
                {invDetailData && (() => {
                    const inv = invDetailData;
                    const vat = Number(inv.grand_total) - Number(inv.sub_total) + Number(inv.discount);
                    const collected = inv.receivables?.reduce((s: number, r: any) => s + Number(r.amount), 0) ?? 0;
                    const outstanding = Math.max(0, Number(inv.grand_total) - collected);
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg text-sm">
                                <div><span className="text-muted-foreground text-xs">Date:</span><span className="ml-2 font-medium">{inv.invoice_date}</span></div>
                                <div><span className="text-muted-foreground text-xs">Customer:</span><span className="ml-2 font-medium">{inv.customer?.name ?? 'Walk-in'}</span></div>
                                <div><span className="text-muted-foreground text-xs">Invoice #:</span><span className="ml-2 font-mono font-medium">{inv.invoice_number}</span></div>
                                <div>
                                    <span className="text-muted-foreground text-xs">Status:</span>
                                    <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(inv.status)}`}>{inv.status}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Items</p>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">#</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Item</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Batch</th>
                                                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Qty</th>
                                                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Unit Price</th>
                                                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inv.items?.map((item: any, i: number) => (
                                                <tr key={item.id} className="border-b last:border-0">
                                                    <td className="px-3 py-2">{i + 1}</td>
                                                    <td className="px-3 py-2 font-medium">{item.stock_batch?.product?.generic_name}</td>
                                                    <td className="px-3 py-2 font-mono text-xs">{item.stock_batch?.batch_number || '—'}</td>
                                                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right">Rs. {Number(item.unit_price).toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right font-semibold">Rs. {(item.quantity * Number(item.unit_price)).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-2 space-y-1 px-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-xs">Sub Total</span>
                                        <span>Rs. {Number(inv.sub_total).toLocaleString()}</span>
                                    </div>
                                    {Number(inv.discount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground text-xs">Discount</span>
                                            <span className="text-red-600">- Rs. {Number(inv.discount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {vat > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground text-xs">VAT</span>
                                            <span className="text-blue-600">+ Rs. {vat.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold border-t pt-1">
                                        <span className="text-muted-foreground text-xs">Grand Total</span>
                                        <span>Rs. {Number(inv.grand_total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Payment History</p>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                                                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Amount</th>
                                                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(!inv.receivables || inv.receivables.length === 0) ? (
                                                <tr><td colSpan={3} className="text-center py-4 text-muted-foreground text-xs">No payments recorded.</td></tr>
                                            ) : inv.receivables.map((r: any) => (
                                                <tr key={r.id} className="border-b last:border-0">
                                                    <td className="px-3 py-2">{r.dateTime}</td>
                                                    <td className="px-3 py-2 text-right font-medium text-green-600">Rs. {Number(r.amount).toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-muted-foreground">{r.note ?? '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center mt-2 px-3 text-sm pt-2 border-t">
                                    <span className="text-muted-foreground text-xs">Total Collected</span>
                                    <span className="font-semibold text-green-600">Rs. {collected.toLocaleString()}</span>
                                </div>
                                {outstanding > 0 && (
                                    <div className="flex justify-between items-center px-3 text-sm">
                                        <span className="text-muted-foreground text-xs">Outstanding</span>
                                        <span className="font-semibold text-destructive">Rs. {outstanding.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}

export default function WrappedReceivablesPage() {
    return (
        <>
            <Head title="Receivables" />
            <ReceivablesPage />
        </>
    );
}

(WrappedReceivablesPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;