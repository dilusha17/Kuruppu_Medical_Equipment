import { Head } from '@inertiajs/react';
import AppShell from '@/AppShell';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import SearchBar from '@/components/shared/SearchBar';
import { ShoppingCart, Plus, Minus, Trash2, Printer, Barcode, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';

interface ProductItem {
    product_id:    number;
    generic_name:  string;
    barcode_value: string;
    brand:         string | null;
    category:      string | null;
}

interface CartItem {
    product_id: number;
    name:       string;
    brand:      string | null;
    qty:        number;
    price:      number;
}

interface Customer {
    id:     number;
    name:   string;
    is_vat: number;
}

const WALK_IN_ID = 1;

function QuotationPage() {
    const { user } = useAuth();

    const [quotationNum,   setQuotationNum]   = useState('QTN-0001');
    const [poNumber,       setPoNumber]       = useState('');
    const [quotationDate,  setQuotationDate]  = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [discount,       setDiscount]       = useState('');
    const [barcodeInput,   setBarcodeInput]   = useState('');
    const [productSearch,  setProductSearch]  = useState('');
    const [cart,           setCart]           = useState<CartItem[]>([]);
    const [customers,      setCustomers]      = useState<Customer[]>([]);
    const [products,       setProducts]       = useState<ProductItem[]>([]);
    const [saving,         setSaving]         = useState(false);
    const [vatRate,        setVatRate]        = useState(0);
    const [notes,          setNotes]          = useState('');
    const [businessEntities, setBusinessEntities] = useState<{ id: number; name: string; is_vat_registered: number; vat_no: string | null }[]>([]);
    const [businessEntityId, setBusinessEntityId] = useState<string>('');

    const [priceModalOpen,  setPriceModalOpen]  = useState(false);
    const [pendingItem,     setPendingItem]     = useState<ProductItem | null>(null);
    const [unitPriceInput,  setUnitPriceInput]  = useState('');
    const [qtyInput,        setQtyInput]        = useState('1');
    const qtyInputRef   = useRef<HTMLInputElement>(null);
    const priceInputRef = useRef<HTMLInputElement>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const subTotal        = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const discountedTotal = Math.max(0, subTotal - Number(discount || 0));
    const vatAmount       = Math.round(discountedTotal * vatRate / 100);
    const grandTotal      = discountedTotal + vatAmount;

    useEffect(() => {
        fetchFormData();
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!quotationDate) return;
        const selectedEntity = businessEntities.find((e) => String(e.id) === businessEntityId);
        if (selectedEntity && !selectedEntity.is_vat_registered) {
            setVatRate(0);
            return;
        }
        axios.get('/vat/by-date', { params: { date: quotationDate } })
            .then((res) => setVatRate(res.data ? Number(res.data.vat_percentage) : 0))
            .catch(() => setVatRate(0));
    }, [quotationDate, businessEntityId, businessEntities]);

    const fetchFormData = async () => {
        try {
            const res = await axios.get('/quotation/form-data');
            setCustomers(res.data.customers);
            setProducts(res.data.products);
            if (res.data.next_number) setQuotationNum(res.data.next_number);
            if (Array.isArray(res.data.business_entities)) {
                setBusinessEntities(res.data.business_entities);
            }
        } catch (e: any) {
            console.log('Form data error:', e.response?.data);
        }
    };

    const customerOptions = customers.map((c) => ({
        value: String(c.id),
        label: c.id === WALK_IN_ID ? 'Walk-in Customer' : c.name,
    }));

    const filteredProducts = products.filter((p) =>
        p.generic_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode_value?.includes(productSearch) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const openPriceModal = (p: ProductItem) => {
        setPendingItem(p);
        setUnitPriceInput('');
        setQtyInput('1');
        setPriceModalOpen(true);
        setTimeout(() => { qtyInputRef.current?.focus(); qtyInputRef.current?.select(); }, 50);
    };

    const addToCart = (p: ProductItem, unitPrice: number, qty: number) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.product_id === p.product_id);
            if (existing) {
                return prev.map((c) => c.product_id === p.product_id
                    ? { ...c, qty: c.qty + qty } : c);
            }
            return [...prev, {
                product_id: p.product_id,
                name:       p.generic_name,
                brand:      p.brand,
                qty,
                price:      unitPrice,
            }];
        });
    };

    const confirmPriceAndAdd = () => {
        const price = Number(unitPriceInput);
        const qty   = parseInt(qtyInput, 10);
        if (!pendingItem) return;
        if (!unitPriceInput || isNaN(price) || price <= 0) {
            toast.error('Please enter a valid unit selling price.');
            return;
        }
        if (!qtyInput || isNaN(qty) || qty <= 0) {
            toast.error('Please enter a valid quantity.');
            return;
        }
        addToCart(pendingItem, price, qty);
        setPriceModalOpen(false);
        setPendingItem(null);
        setUnitPriceInput('');
        setQtyInput('1');
    };

    const updateQty = (product_id: number, delta: number) => {
        setCart((prev) => prev.map((c) => {
            if (c.product_id !== product_id) return c;
            return { ...c, qty: Math.max(1, c.qty + delta) };
        }));
    };

    const setItemQty = (product_id: number, value: number) => {
        if (isNaN(value)) return;
        setCart((prev) => prev.map((c) => {
            if (c.product_id !== product_id) return c;
            return { ...c, qty: Math.max(1, value) };
        }));
    };

    const removeFromCart = (product_id: number) => {
        setCart((prev) => prev.filter((c) => c.product_id !== product_id));
    };

    const handleBarcode = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && barcodeInput.trim()) {
            const found = products.find((p) => p.barcode_value === barcodeInput.trim());
            if (found) {
                openPriceModal(found);
            } else {
                toast.error('Product not found for this barcode.');
            }
            setBarcodeInput('');
        }
    };

    const handleSave = async (printAfterSave = false) => {
        if (!selectedCustomer) { toast.error('Please select a customer.'); return; }
        if (cart.length === 0) { toast.error('Please add at least one product.'); return; }

        setSaving(true);
        const toastId = toast.loading(printAfterSave ? 'Saving & preparing print...' : 'Saving quotation...');

        try {
            const res = await axios.post('/quotation/store', {
                business_entity_id: businessEntityId ? Number(businessEntityId) : null,
                customer_id:    Number(selectedCustomer),
                user_id:        user?.id,
                po_number:      poNumber || null,
                quotation_date: quotationDate,
                sub_total:      subTotal,
                discount:       Number(discount || 0),
                vat_percentage: vatRate,
                grand_total:    grandTotal,
                notes:          notes || null,
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    quantity:   i.qty,
                    unit_price: i.price,
                })),
            });

            toast.success('Quotation saved successfully!', { id: toastId });

            if (printAfterSave && res.data.id) {
                window.open(`/quotation/print/${res.data.id}`, '_blank');
            }

            setCart([]);
            setSelectedCustomer('');
            setBusinessEntityId('');
            setPoNumber('');
            setDiscount('');
            setNotes('');
            await fetchFormData();

        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to save quotation.';
            toast.error(msg, { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)] animate-fade-in">

            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                    <div className="flex gap-3">
                        <div className="relative w-3/5">
                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input ref={inputRef} value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onKeyDown={handleBarcode}
                                placeholder="Scan barcode or enter code..."
                                className="pl-9 h-10" />
                        </div>
                        <div className="w-2/5">
                            <SearchBar value={productSearch} onChange={setProductSearch}
                                placeholder="Search products..." />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                        {filteredProducts.map((p) => (
                            <button key={p.product_id} onClick={() => openPriceModal(p)}
                                className="bg-card border border-border rounded-lg p-3 text-left hover:border-primary hover:shadow-md transition-all group">
                                <p className="text-xs font-semibold truncate group-hover:text-primary">
                                    {p.generic_name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                                <p className="text-[10px] text-muted-foreground">{p.category}</p>
                            </button>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-4 text-center py-12 text-muted-foreground text-sm">
                                No products found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Cart & Summary */}
            <div className="w-full lg:w-[600px] flex flex-col bg-card rounded-xl border border-border">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                            <ShoppingCart className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold font-mono">{quotationNum}</span>
                        </div>
                        <Input
                            value={poNumber}
                            onChange={(e) => setPoNumber(e.target.value)}
                            placeholder="PO No:"
                            className="h-8 w-32 text-xs px-2"
                        />
                        <DatePicker value={quotationDate} onChange={setQuotationDate}
                            className="h-8 text-xs px-2" />
                    </div>
                    {businessEntities.length > 0 && (
                        <Combobox
                            options={businessEntities.map((e) => ({ value: String(e.id), label: e.name }))}
                            value={businessEntityId}
                            onValueChange={setBusinessEntityId}
                            placeholder="Select company..."
                            searchPlaceholder="Search companies..."
                            className="mt-3 h-9 text-sm"
                        />
                    )}
                    <Combobox options={customerOptions} value={selectedCustomer}
                        onValueChange={setSelectedCustomer}
                        placeholder="Select customer..."
                        searchPlaceholder="Search customers..."
                        className="mt-3 h-9 text-sm" />
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <ShoppingCart className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-sm">No items added</p>
                            <p className="text-xs">Click products to add to quotation</p>
                        </div>
                    ) : cart.map((item) => (
                        <div key={item.product_id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    Rs. {Number(item.price).toLocaleString()} each
                                </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => updateQty(item.product_id, -1)}
                                    className="h-6 w-6 rounded bg-background border border-border flex items-center justify-center hover:bg-accent">
                                    <Minus className="h-3 w-3" />
                                </button>
                                <input
                                    type="number"
                                    value={item.qty}
                                    min={1}
                                    onChange={(e) => setItemQty(item.product_id, parseInt(e.target.value, 10))}
                                    className="w-16 h-6 text-center text-xs font-semibold bg-background border border-input rounded px-1
                                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => updateQty(item.product_id, 1)}
                                    className="h-6 w-6 rounded bg-background border border-border flex items-center justify-center hover:bg-accent">
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                            <span className="text-xs font-bold w-28 text-right">
                                Rs. {(item.qty * item.price).toLocaleString()}
                            </span>
                            <button onClick={() => removeFromCart(item.product_id)}
                                className="text-destructive hover:bg-destructive/10 rounded p-1">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="border-t border-border px-4 pt-3 pb-4 space-y-2">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-muted-foreground">
                                Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})
                            </span>
                            <span className="text-sm font-semibold">Rs. {subTotal.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-muted-foreground">Discount</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Rs.</span>
                                <input type="number" placeholder="0" value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-20 text-right bg-transparent border-0 border-b border-dashed
                                               border-muted-foreground/40 focus:outline-none focus:border-primary
                                               text-sm font-semibold text-destructive pb-px
                                               [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                                               [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                        </div>

                        {vatRate > 0 && (
                            <div className="flex items-center justify-between py-1">
                                <span className="text-xs text-muted-foreground">VAT ({vatRate.toFixed(2)}%)</span>
                                <span className="text-sm text-muted-foreground">+ Rs. {vatAmount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-primary/10 rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-bold text-primary">Rs. {grandTotal.toLocaleString()}</span>
                    </div>

                    {/* Notes */}
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes (optional)..."
                        rows={2}
                        className="resize-none text-xs"
                    />

                    <div className="flex gap-2 pt-1">
                        <Button onClick={() => handleSave(false)} disabled={cart.length === 0 || saving}
                            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button onClick={() => handleSave(true)} disabled={cart.length === 0 || saving}
                            className="flex-1 gap-2">
                            <Printer className="h-4 w-4" /> Save & Print
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Unit Selling Price Modal */}
        <Dialog open={priceModalOpen} onOpenChange={(open) => { if (!open) { setPriceModalOpen(false); setPendingItem(null); setUnitPriceInput(''); } }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Set Unit Selling Price</DialogTitle>
                </DialogHeader>
                {pendingItem && (
                    <div className="space-y-3 pt-1 pb-2">
                        <div className="bg-muted/50 rounded-lg px-3 py-2 space-y-0.5">
                            <p className="text-sm font-semibold">{pendingItem.generic_name}</p>
                            {pendingItem.brand && <p className="text-xs text-muted-foreground">{pendingItem.brand}</p>}
                            {pendingItem.category && <p className="text-xs text-muted-foreground">{pendingItem.category}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Quantity</label>
                            <Input
                                ref={qtyInputRef}
                                type="number"
                                placeholder="1"
                                value={qtyInput}
                                onChange={(e) => setQtyInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && priceInputRef.current?.focus()}
                                className="text-right text-sm font-semibold h-9"
                                min={1}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Unit Selling Price (Rs.)</label>
                            <Input
                                ref={priceInputRef}
                                type="number"
                                placeholder="Enter selling price..."
                                value={unitPriceInput}
                                onChange={(e) => setUnitPriceInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && confirmPriceAndAdd()}
                                className="text-right text-sm font-semibold h-9"
                                min={0}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => { setPriceModalOpen(false); setPendingItem(null); setUnitPriceInput(''); }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmPriceAndAdd} className="gap-2">
                        <ShoppingCart className="h-4 w-4" /> Add to Quotation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}

export default function WrappedQuotationPage() {
    return (
        <>
            <Head title="Quotation" />
            <QuotationPage />
        </>
    );
}

(WrappedQuotationPage as any).layout = (page: React.ReactNode) => <AppShell>{page}</AppShell>;
