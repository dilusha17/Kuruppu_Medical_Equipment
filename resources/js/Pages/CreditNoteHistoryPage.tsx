import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useRef, useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import SearchBar from '@/components/shared/SearchBar';
import NumberedPagination from '@/components/shared/NumberedPagination';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Eye, Printer, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';

interface CreditNoteItem {
    id: number;
    quantity: number;
    unit_price: number;
    reason: 'shortage' | 'damage';
    restock_action: 'restocked' | 'written_off';
    stock_batch?: { batch_number: string; product?: { generic_name: string } };
}

interface CreditNoteRow {
    id: number;
    credit_note_number: string;
    credit_note_date: string;
    grand_total: number;
    invoice?: { invoice_number: string };
    customer?: { name: string };
    items: CreditNoteItem[];
}

const reasonBadge = (reason: string) =>
    reason === 'shortage'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

function CreditNoteHistoryPage() {
    const [rows, setRows] = useState<CreditNoteRow[]>([]);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [viewRow, setViewRow] = useState<CreditNoteRow | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchRows = async (pg: number, q?: string, date?: string) => {
        setLoading(true);
        try {
            const res = await axios.get('/credit-note/all', {
                params: { page: pg, search: q || undefined, date: date || undefined },
            });
            setRows(res.data.data);
            setLastPage(res.data.last_page);
            setTotal(res.data.total);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRows(page, search, dateFilter); }, [page]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchRows(1, search, dateFilter);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, dateFilter]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/credit-note/delete/${deleteId}`);
            toast.success('Credit note deleted.');
            fetchRows(page, search, dateFilter);
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to delete credit note.');
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-72">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search by CN # or invoice #..." />
                </div>
                <div className="w-full sm:w-48">
                    <DatePicker value={dateFilter} onChange={setDateFilter} className="w-full" />
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Credit Note #</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Against Invoice</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Reasons</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Total Credit</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
                                    {loading ? 'Loading...' : 'No credit notes found.'}
                                </td></tr>
                            ) : rows.map((row) => {
                                const reasons = Array.from(new Set(row.items.map((i) => i.reason)));
                                return (
                                    <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono font-medium text-primary">{row.credit_note_number}</td>
                                        <td className="px-4 py-3">{row.credit_note_date}</td>
                                        <td className="px-4 py-3 font-mono">{row.invoice?.invoice_number ?? '—'}</td>
                                        <td className="px-4 py-3">{row.customer?.name ?? 'Walk-in'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {reasons.map((r) => (
                                                    <span key={r} className={`text-xs px-2 py-0.5 rounded-full capitalize ${reasonBadge(r)}`}>{r}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-destructive">Rs. {Number(row.grand_total).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setViewRow(row)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="View details">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => window.open('/credit-note/print/' + row.id, '_blank')} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Print">
                                                    <Printer className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <NumberedPagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />

            <Modal open={!!viewRow} onClose={() => setViewRow(null)}
                title={viewRow ? `Credit Note — ${viewRow.credit_note_number}` : 'Credit Note'} size="lg">
                {viewRow && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><span className="text-muted-foreground">Against Invoice:</span> <span className="font-mono font-medium">{viewRow.invoice?.invoice_number ?? '—'}</span></p>
                            <p><span className="text-muted-foreground">Customer:</span> {viewRow.customer?.name ?? 'Walk-in'}</p>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Item</th>
                                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Batch</th>
                                        <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Qty</th>
                                        <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Amount</th>
                                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Reason</th>
                                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Stock Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewRow.items.map((it) => (
                                        <tr key={it.id} className="border-b last:border-0">
                                            <td className="px-3 py-2 font-medium">{it.stock_batch?.product?.generic_name ?? 'N/A'}</td>
                                            <td className="px-3 py-2 font-mono text-xs">{it.stock_batch?.batch_number ?? '—'}</td>
                                            <td className="px-3 py-2 text-right">{it.quantity}</td>
                                            <td className="px-3 py-2 text-right">Rs. {(it.quantity * Number(it.unit_price)).toLocaleString()}</td>
                                            <td className="px-3 py-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${reasonBadge(it.reason)}`}>{it.reason}</span>
                                            </td>
                                            <td className="px-3 py-2 text-xs capitalize">{it.restock_action.replace('_', ' ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t text-sm">
                            <span className="text-muted-foreground">Total Credit</span>
                            <span className="font-bold text-destructive">Rs. {Number(viewRow.grand_total).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
                title="Delete Credit Note" message="Are you sure you want to delete this credit note? This action cannot be undone." />
        </div>
    );
}

export default function WrappedCreditNoteHistoryPage() {
    return (
        <>
            <Head title="Credit Note History" />
            <CreditNoteHistoryPage />
        </>
    );
}

(WrappedCreditNoteHistoryPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
