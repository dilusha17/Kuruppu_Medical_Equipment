import { Head, router } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useRef, useState } from 'react';
import SearchBar from '@/components/shared/SearchBar';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Printer, Eye, Trash2, FileOutput, Pencil } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';
import NumberedPagination from '@/components/shared/NumberedPagination';
import { useAuth } from '@/contexts/AuthContext';

interface QuotationItem {
    id:         number;
    quantity:   number;
    unit_price: number;
    product:    { generic_name: string } | null;
}

interface Quotation {
    id:               number;
    quotation_number: string;
    quotation_date:   string;
    customer:         { id: number; name: string } | null;
    user:             { name: string } | null;
    business_entity:  { id: number; name: string } | null;
    sub_total:        number;
    discount:         number;
    grand_total:      number;
    vat_percentage:   number;
    status:           string;
    notes:            string | null;
    invoice_id:       number | null;
    items:            QuotationItem[];
}

function QuotationHistoryPage() {
    const { user } = useAuth();
    const canEdit = user?.role === 'owner' || user?.role === 'admin';
    const [quotations,  setQuotations]  = useState<Quotation[]>([]);
    const [search,      setSearch]      = useState('');
    const [dateFilter,  setDateFilter]  = useState('');
    const [viewQtn,     setViewQtn]     = useState<Quotation | null>(null);
    const [deleteId,    setDeleteId]    = useState<number | null>(null);
    const [page,        setPage]        = useState(1);
    const [lastPage,    setLastPage]    = useState(1);
    const [total,       setTotal]       = useState(0);
    const [loading,     setLoading]     = useState(false);
    const [businessEntities, setBusinessEntities] = useState<{ id: number; name: string }[]>([]);
    const [entityFilter, setEntityFilter] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Issue Invoice dialog
    const [issueQtn,        setIssueQtn]        = useState<Quotation | null>(null);
    const [paymentMethods,  setPaymentMethods]  = useState<{ id: number; name: string }[]>([]);
    const [issuePayMethod,  setIssuePayMethod]  = useState<string>('');
    const [issuePaidAmount, setIssuePaidAmount]  = useState('');
    const [issueDepositId,  setIssueDepositId]  = useState<string>('');
    const [depositAccounts, setDepositAccounts] = useState<{ id: number; name: string; type: string }[]>([]);
    const [issuing,         setIssuing]         = useState(false);

    useEffect(() => {
        axios.get('/business-entities/all').then((res) => setBusinessEntities(res.data)).catch(() => {});
        axios.get('/payment-methods/all').then((res) => setPaymentMethods(res.data)).catch(() => {});
        axios.get('/deposit-accounts/all').then((res) => setDepositAccounts(res.data)).catch(() => {});
    }, []);

    const fetchQuotations = async (pg: number, s: string, d: string, entityId?: string) => {
        setLoading(true);
        try {
            const res = await axios.get('/quotation/all', {
                params: {
                    page: pg,
                    search: s || undefined,
                    date: d || undefined,
                    business_entity_id: entityId && entityId !== 'all' ? entityId : undefined,
                },
            });
            setQuotations(res.data.data);
            setLastPage(res.data.last_page);
            setTotal(res.data.total);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchQuotations(page, search, dateFilter, entityFilter); }, [page]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchQuotations(1, search, dateFilter, entityFilter);
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, dateFilter, entityFilter]);

    const handleDelete = async () => {
        try {
            await axios.delete(`/quotation/delete/${deleteId}`);
            setQuotations((prev) => prev.filter((q) => q.id !== deleteId));
            setDeleteId(null);
            setTotal((t) => t - 1);
            toast.success('Quotation deleted.');
        } catch (e) {
            toast.error('Failed to delete quotation.');
        }
    };

    const openIssueInvoice = (qtn: Quotation) => {
        setIssueQtn(qtn);
        setIssuePayMethod('');
        setIssuePaidAmount('');
        setIssueDepositId('');
    };

    const handleIssueInvoice = async () => {
        if (!issueQtn || !issuePayMethod) {
            toast.error('Please select a payment method.');
            return;
        }
        if (Number(issuePaidAmount || 0) > 0 && !issueDepositId) {
            toast.error('Please select a deposit account for the payment.');
            return;
        }

        setIssuing(true);
        const toastId = toast.loading('Creating invoice from quotation...');

        try {
            const res = await axios.post('/quotation/issue-invoice', {
                quotation_id:        issueQtn.id,
                payment_method:      Number(issuePayMethod),
                paid_amount:         Number(issuePaidAmount || 0),
                deposit_account_id:  issueDepositId ? Number(issueDepositId) : null,
            });

            toast.success('Invoice created successfully!', { id: toastId });

            if (res.data.invoice_id) {
                window.open(`/invoice/print/${res.data.invoice_id}`, '_blank');
            }

            setIssueQtn(null);
            fetchQuotations(page, search, dateFilter, entityFilter);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to create invoice.';
            toast.error(msg, { id: toastId });
        } finally {
            setIssuing(false);
        }
    };

    const statusColor = (status: string) => {
        if (status === 'invoiced') return 'bg-green-500/10 text-green-600';
        if (status === 'accepted') return 'bg-blue-500/10 text-blue-600';
        if (status === 'rejected') return 'bg-destructive/10 text-destructive';
        if (status === 'sent')     return 'bg-yellow-500/10 text-yellow-600';
        return 'bg-muted text-muted-foreground';
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-72">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search quotations..." />
                </div>
                <DatePicker value={dateFilter} onChange={setDateFilter}
                    placeholder="Filter by date" className="w-full sm:w-44" />
                {businessEntities.length > 0 && (
                    <Select value={entityFilter} onValueChange={setEntityFilter}>
                        <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                            <SelectValue placeholder="All companies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {businessEntities.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)}>
                                    {e.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Quotation #</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Customer</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Company</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Created By</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Total</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.map((qtn) => (
                                <tr key={qtn.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 text-sm font-medium text-primary font-mono">
                                        {qtn.quotation_number}
                                    </td>
                                    <td className="px-4 py-3 text-sm">{qtn.quotation_date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {qtn.customer?.name || 'Walk-in Customer'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                                        {qtn.business_entity?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                        {qtn.user?.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-right">
                                        Rs. {Number(qtn.grand_total).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor(qtn.status)}`}>
                                            {qtn.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setViewQtn(qtn)}
                                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                                                title="View">
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => window.open('/quotation/print/' + qtn.id, '_blank')}
                                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                                                title="Print">
                                                <Printer className="h-3.5 w-3.5" />
                                            </button>
                                            {qtn.status !== 'invoiced' && (
                                                <button onClick={() => openIssueInvoice(qtn)}
                                                    className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-600"
                                                    title="Issue Invoice">
                                                    <FileOutput className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {canEdit && qtn.status !== 'invoiced' && (
                                                <button onClick={() => router.visit(`/quotation/edit/${qtn.id}`)}
                                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                                                    title="Edit quotation">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button onClick={() => setDeleteId(qtn.id)}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                                                title="Delete">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quotations.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        {loading ? 'Loading...' : 'No quotations found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <NumberedPagination
                currentPage={page}
                lastPage={lastPage}
                total={total}
                onPageChange={setPage}
            />

            {/* View Dialog */}
            <Dialog open={!!viewQtn} onOpenChange={(open) => !open && setViewQtn(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-mono">{viewQtn?.quotation_number}</DialogTitle>
                    </DialogHeader>
                    {viewQtn && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">{viewQtn.quotation_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customer</span>
                                    <span className="font-medium">
                                        {viewQtn.customer?.name || 'Walk-in Customer'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created By</span>
                                    <span className="font-medium">{viewQtn.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor(viewQtn.status)}`}>
                                        {viewQtn.status}
                                    </span>
                                </div>
                            </div>

                            {viewQtn.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                                        <p className="text-sm">{viewQtn.notes}</p>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Items
                                </p>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 text-xs text-muted-foreground">#</th>
                                            <th className="text-left py-2 text-xs text-muted-foreground">Product</th>
                                            <th className="text-right py-2 text-xs text-muted-foreground">Qty</th>
                                            <th className="text-right py-2 text-xs text-muted-foreground">Price</th>
                                            <th className="text-right py-2 text-xs text-muted-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewQtn.items.map((item, i) => (
                                            <tr key={i} className="border-b border-border last:border-0">
                                                <td className="py-2 text-muted-foreground">{i + 1}</td>
                                                <td className="py-2 font-medium">
                                                    {item.product?.generic_name}
                                                </td>
                                                <td className="py-2 text-right">{item.quantity}</td>
                                                <td className="py-2 text-right">
                                                    Rs. {Number(item.unit_price).toLocaleString()}
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    Rs. {(item.quantity * item.unit_price).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Separator />

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sub Total</span>
                                    <span>Rs. {Number(viewQtn.sub_total).toLocaleString()}</span>
                                </div>
                                {Number(viewQtn.discount) > 0 && (
                                    <div className="flex justify-between text-destructive">
                                        <span>Discount</span>
                                        <span>- Rs. {Number(viewQtn.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                {(() => {
                                    const vat = Number(viewQtn.grand_total) - Number(viewQtn.sub_total) + Number(viewQtn.discount);
                                    return vat > 0 ? (
                                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                            <span>VAT</span>
                                            <span>+ Rs. {vat.toLocaleString()}</span>
                                        </div>
                                    ) : null;
                                })()}
                                <div className="flex justify-between font-semibold text-base pt-1 border-t border-border">
                                    <span>Grand Total</span>
                                    <span className="text-primary">
                                        Rs. {Number(viewQtn.grand_total).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Issue Invoice Dialog */}
            <Dialog open={!!issueQtn} onOpenChange={(open) => !open && setIssueQtn(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Issue Invoice from Quotation</DialogTitle>
                    </DialogHeader>
                    {issueQtn && (
                        <div className="space-y-4 py-2">
                            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                                <p className="text-sm font-semibold font-mono">{issueQtn.quotation_number}</p>
                                <p className="text-xs text-muted-foreground">
                                    {issueQtn.customer?.name} - {issueQtn.quotation_date}
                                </p>
                                <p className="text-sm font-bold text-primary">
                                    Total: Rs. {Number(issueQtn.grand_total).toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={issuePayMethod} onValueChange={setIssuePayMethod}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Paid Amount (Rs.)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={issuePaidAmount}
                                    onChange={(e) => setIssuePaidAmount(e.target.value)}
                                    className="text-right text-base font-semibold"
                                    min={0}
                                />
                            </div>

                            {Number(issuePaidAmount || 0) > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Deposit To</label>
                                    <Select value={issueDepositId} onValueChange={setIssueDepositId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select deposit account" />
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
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIssueQtn(null)}>Cancel</Button>
                        <Button onClick={handleIssueInvoice} disabled={issuing} className="gap-2">
                            <FileOutput className="h-4 w-4" />
                            {issuing ? 'Creating...' : 'Issue Invoice'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
        </div>
    );
}

export default function WrappedQuotationHistoryPage() {
    return (
        <>
            <Head title="Quotation History" />
            <QuotationHistoryPage />
        </>
    );
}

(WrappedQuotationHistoryPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
