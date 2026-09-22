import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBar from '@/components/shared/SearchBar';
import { format } from 'date-fns';
import { Undo2, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface InvoiceSearchResult {
    id: number;
    invoice_number: string;
    invoice_date: string;
    customer: string;
    grand_total: number;
}

interface SelectedInvoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    customer: string;
    grand_total: number;
    vat_percentage: number;
}

interface CreditItemRow {
    invoice_item_id: number;
    stock_batch_id: number;
    product_name: string;
    batch_number: string;
    invoiced_qty: number;
    unit_price: number;
    already_credited: number;
    creditable_qty: number;
    credit_qty: string;
    reason: 'shortage' | 'damage' | 'excess';
    restock_action: 'restock' | 'write_off';
}

function CreditNotePage() {
    const { user } = useAuth();
    const [creditNoteNum, setCreditNoteNum] = useState('');
    const [creditNoteDate, setCreditNoteDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [invoiceResults, setInvoiceResults] = useState<InvoiceSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [selectedInvoice, setSelectedInvoice] = useState<SelectedInvoice | null>(null);
    const [items, setItems] = useState<CreditItemRow[]>([]);

    const fetchNextNumber = async () => {
        try {
            const res = await axios.get('/credit-note/next-number');
            setCreditNoteNum(res.data.credit_note_number);
        } catch (e) { console.log(e); }
    };

    useEffect(() => { fetchNextNumber(); }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!invoiceSearch.trim()) { setInvoiceResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await axios.get('/credit-note/search-invoice', { params: { query: invoiceSearch } });
                setInvoiceResults(res.data);
            } catch (e) { console.log(e); }
            finally { setSearching(false); }
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [invoiceSearch]);

    const selectInvoice = async (inv: InvoiceSearchResult) => {
        try {
            const res = await axios.get(`/credit-note/invoice/${inv.id}`);
            setSelectedInvoice(res.data.invoice);
            setItems(res.data.items.map((i: any) => ({
                ...i,
                credit_qty: '',
                reason: 'shortage',
                restock_action: 'restock',
            })));
            setInvoiceSearch('');
            setInvoiceResults([]);
        } catch (e) { console.log(e); }
    };

    const clearInvoice = () => {
        setSelectedInvoice(null);
        setItems([]);
    };

    const updateItem = (invoiceItemId: number, patch: Partial<CreditItemRow>) => {
        setItems((prev) => prev.map((it) => it.invoice_item_id === invoiceItemId ? { ...it, ...patch } : it));
    };

    const includedItems = items.filter((it) => Number(it.credit_qty) > 0);
    const subTotal = includedItems.reduce((s, it) => s + Number(it.credit_qty) * it.unit_price, 0);
    const vatPct = selectedInvoice?.vat_percentage ?? 0;
    const vatAmount = subTotal * (vatPct / 100);
    const grandTotal = subTotal + vatAmount;

    const resetForm = () => {
        setSelectedInvoice(null);
        setItems([]);
        setNotes('');
        setCreditNoteDate(format(new Date(), 'yyyy-MM-dd'));
        fetchNextNumber();
    };

    const handleSubmit = async () => {
        if (!selectedInvoice) { toast.error('Select an invoice first.'); return; }
        if (includedItems.length === 0) { toast.error('Enter a credit quantity for at least one item.'); return; }
        for (const it of includedItems) {
            if (Number(it.credit_qty) > it.creditable_qty) {
                toast.error(`Credit qty for ${it.product_name} exceeds creditable amount.`);
                return;
            }
        }

        setSaving(true);
        try {
            const res = await axios.post('/credit-note/store', {
                invoice_id: selectedInvoice.id,
                credit_note_date: creditNoteDate,
                notes: notes || null,
                user_id: user?.id,
                items: includedItems.map((it) => ({
                    invoice_item_id: it.invoice_item_id,
                    quantity: Number(it.credit_qty),
                    reason: it.reason,
                    restock_action: it.reason === 'damage' ? it.restock_action : undefined,
                })),
            });
            toast.success('Credit note issued!');
            if (res.data.id) window.open(`/credit-note/print/${res.data.id}`, '_blank');
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to issue credit note.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 animate-fade-in max-w-5xl mx-auto">
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Credit Note No.</label>
                        <Input value={creditNoteNum} disabled className="bg-muted text-muted-foreground" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                        <DatePicker value={creditNoteDate} onChange={setCreditNoteDate} className="w-full" />
                    </div>
                </div>

                {!selectedInvoice ? (
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Find Invoice</label>
                        <SearchBar value={invoiceSearch} onChange={setInvoiceSearch} placeholder="Search by invoice number..." />
                        {invoiceSearch.trim() && (
                            <div className="mt-2 border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                                {searching ? (
                                    <div className="p-3 text-sm text-muted-foreground text-center">Searching...</div>
                                ) : invoiceResults.length === 0 ? (
                                    <div className="p-3 text-sm text-muted-foreground text-center">No invoices found.</div>
                                ) : invoiceResults.map((inv) => (
                                    <button
                                        key={inv.id}
                                        onClick={() => selectInvoice(inv)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 border-b border-border last:border-0 text-left"
                                    >
                                        <span className="font-medium font-mono text-primary">{inv.invoice_number}</span>
                                        <span className="text-muted-foreground">{inv.invoice_date}</span>
                                        <span>{inv.customer}</span>
                                        <span className="font-semibold">Rs. {Number(inv.grand_total).toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p><span className="text-muted-foreground">Invoice:</span> <span className="font-medium font-mono text-primary">{selectedInvoice.invoice_number}</span></p>
                            <p><span className="text-muted-foreground">Customer:</span> {selectedInvoice.customer}</p>
                            <p><span className="text-muted-foreground">Invoice Total:</span> <span className="font-semibold">Rs. {Number(selectedInvoice.grand_total).toLocaleString()}</span></p>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearInvoice} className="gap-1">
                            <X className="h-3.5 w-3.5" /> Change
                        </Button>
                    </div>
                )}
            </div>

            {selectedInvoice && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Product</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Batch</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2">Invoiced</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2">Creditable</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2 w-24">Credit Qty</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 w-36">Reason</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 w-36">Stock Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it) => (
                                    <tr key={it.invoice_item_id} className="border-b border-border last:border-0">
                                        <td className="px-3 py-2 font-medium">{it.product_name}</td>
                                        <td className="px-3 py-2 font-mono text-xs">{it.batch_number}</td>
                                        <td className="px-3 py-2 text-right">{it.invoiced_qty}</td>
                                        <td className="px-3 py-2 text-right">{it.creditable_qty}</td>
                                        <td className="px-3 py-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={it.creditable_qty}
                                                disabled={it.creditable_qty === 0}
                                                value={it.credit_qty}
                                                onChange={(e) => {
                                                    let v = e.target.value;
                                                    if (v !== '' && Number(v) > it.creditable_qty) v = String(it.creditable_qty);
                                                    updateItem(it.invoice_item_id, { credit_qty: v });
                                                }}
                                                className="h-8 text-xs text-right"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <Select
                                                value={it.reason}
                                                onValueChange={(v) => updateItem(it.invoice_item_id, { reason: v as 'shortage' | 'damage' | 'excess' })}
                                                disabled={it.creditable_qty === 0}
                                            >
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="shortage">Shortage</SelectItem>
                                                    <SelectItem value="excess">Excess</SelectItem>
                                                    <SelectItem value="damage">Damage</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-3 py-2">
                                            {it.reason === 'damage' ? (
                                                <Select
                                                    value={it.restock_action}
                                                    onValueChange={(v) => updateItem(it.invoice_item_id, { restock_action: v as 'restock' | 'write_off' })}
                                                >
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="restock">Restock</SelectItem>
                                                        <SelectItem value="write_off">Write Off</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : it.reason === 'excess' ? (
                                                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Auto-restocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Deducted from stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedInvoice && (
                <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Returned by driver on delivery..." />
                    </div>
                    <div className="max-w-sm ml-auto space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sub Total</span>
                            <span>Rs. {subTotal.toLocaleString()}</span>
                        </div>
                        {vatAmount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">VAT ({vatPct}%)</span>
                                <span>Rs. {vatAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-1 text-base">
                            <span>Total Credit</span>
                            <span className="text-destructive">Rs. {grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                            <Undo2 className="h-4 w-4" /> {saving ? 'Issuing...' : 'Issue Credit Note'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WrappedCreditNotePage() {
    return (
        <>
            <Head title="Credit Note" />
            <CreditNotePage />
        </>
    );
}

(WrappedCreditNotePage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
