<?php

namespace App\Http\Controllers;

use App\Models\BusinessEntity;
use App\Models\Customers;
use App\Models\Invoice;
use App\Models\InvoiceItems;
use App\Models\PaymentMethod;
use App\Models\Receivable;
use App\Models\StockBatches;
use App\Models\DepositAccount;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function nextNumber() {

        $last = Invoice::withTrashed()->latest()->first();
        $next = $last ? ($last->id + 1) : 1;
        return response()->json([
            'invoice_number' => 'INV-' . str_pad($next, 4, '0', STR_PAD_LEFT)
        ]);
    }

    public function formData() {

        try {

            $customers = Customers::all(['id', 'name', 'is_vat']);
            $payment_methods = PaymentMethod::all();

            // Get only needed columns; select on the base model, constrain relation columns
            $stock = StockBatches::with([
                    'product:id,generic_name,barcode_value,brand_id,category_id',
                    'product.brand:id,name',
                    'product.category:id,name',
                ])
                ->select('id', 'product_id', 'purchase_price', 'current_quantity', 'expiry_date', 'batch_number')
                ->where('current_quantity', '>', 0)
                ->get()
                ->map(function ($batch) {
                    return [
                        'stock_batch_id'   => $batch->id,
                        'product_id'       => $batch->product?->id,
                        'generic_name'     => $batch->product?->generic_name,
                        'barcode_value'    => $batch->product?->barcode_value,
                        'brand'            => $batch->product?->brand?->name,
                        'category'         => $batch->product?->category?->name,
                        'purchase_price'   => $batch->purchase_price,
                        'current_quantity' => $batch->current_quantity,
                        'expiry_date'      => $batch->expiry_date,
                        'batch_number'     => $batch->batch_number,
                    ];
                });

            // Include next invoice number so InvoicePage needs only one request on load
            $last       = Invoice::withTrashed()->latest()->first();
            $nextNum    = 'INV-' . str_pad(($last ? $last->id + 1 : 1), 4, '0', STR_PAD_LEFT);

            $businessEntities = BusinessEntity::query()
                ->get(['id', 'name', 'is_vat_registered', 'vat_no', 'address', 'phone', 'place_of_supply']);

            return response()->json([
                'customers'         => $customers,
                'payment_methods'   => $payment_methods,
                'stock'             => $stock,
                'next_number'       => $nextNum,
                'business_entities' => $businessEntities,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function searchStock(Request $request) {
        try {
            $searchTerm = $request->input('query');
            
            $stock = StockBatches::with([
                    'product:id,generic_name,barcode_value,brand_id,category_id',
                    'product.brand:id,name',
                    'product.category:id,name',
                ])
                ->select('id', 'product_id', 'purchase_price', 'current_quantity', 'expiry_date', 'batch_number')
                ->where('current_quantity', '>', 0)
                ->whereHas('product', function ($q) use ($searchTerm) {
                    $q->where('barcode_value', $searchTerm)
                      ->orWhere('generic_name', 'like', "%{$searchTerm}%");
                })
                ->get()
                ->map(function ($batch) {
                    return [
                        'stock_batch_id'   => $batch->id,
                        'product_id'       => $batch->product?->id,
                        'generic_name'     => $batch->product?->generic_name,
                        'barcode_value'    => $batch->product?->barcode_value,
                        'brand'            => $batch->product?->brand?->name,
                        'category'         => $batch->product?->category?->name,
                        'purchase_price'   => $batch->purchase_price,
                        'current_quantity' => $batch->current_quantity,
                        'expiry_date'      => $batch->expiry_date,
                        'batch_number'     => $batch->batch_number,
                    ];
                });

            return response()->json(['stock' => $stock]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function all(Request $request) {

        $query = Invoice::with([
                'customer:id,name,contact_no,address',
                'user:id,name',
                'businessEntity:id,name',
                'items:id,invoice_id,stock_batch_id,quantity,unit_price',
                'items.stockBatch:id,batch_number,product_id',
                'items.stockBatch.product:id,generic_name',
            ])
            ->withCount('creditNotes')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('invoice_date', $request->date);
        }

        if ($request->filled('business_entity_id')) {
            $query->where('business_entity_id', $request->business_entity_id);
        }

        return response()->json($query->paginate(50));
    }

    public function store(Request $request) {

        $validated = $request->validate([
            'business_entity_id' => 'nullable|exists:business_entities,id',
            'customer_id'        => 'required|exists:customers,id',
            'user_id'            => 'required|exists:users,id',
            'po_number'          => 'nullable|string|max:100',
            'invoice_date'       => 'required|date',
            'sub_total'          => 'required|numeric',
            'discount'           => 'required|numeric|min:0',
            'vat_percentage'     => 'sometimes|numeric|min:0',
            'grand_total'        => 'required|numeric',
            'paid_amount'        => 'required|numeric|min:0',
            'payment_method'     => 'required|exists:payment_methods,id',
            'deposit_account_id' => 'nullable|exists:deposit_accounts,id',
            'items'              => 'required|array|min:1',
            'items.*.stock_batch_id' => 'required|exists:stock_batches,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validated['paid_amount'] > 0 && empty($validated['deposit_account_id'])) {
            return response()->json(['message' => 'Please select a deposit account for the payment.'], 422);
        }

        // Payment status
        $status = 'unpaid';
        if ($validated['paid_amount'] >= $validated['grand_total']) {
            $status = 'paid';
        } elseif ($validated['paid_amount'] > 0) {
            $status = 'partial';
        }  
        
        $invoice = DB::transaction(function () use ($validated, $status) {

            $last   = Invoice::withTrashed()->latest()->first();
            $next   = $last ? ($last->id + 1) : 1;
            $invNum = 'INV-' . str_pad($next, 4, '0', STR_PAD_LEFT);  
            
            $invoice = Invoice::create([
                'invoice_number'    => $invNum,
                'business_entity_id'=> $validated['business_entity_id'] ?? null,
                'po_number'         => $validated['po_number'] ?? null,
                'customer_id'       => $validated['customer_id'],
                'user_id'        => $validated['user_id'],
                'invoice_date'   => $validated['invoice_date'],
                'sub_total'      => $validated['sub_total'],
                'discount'       => $validated['discount'],
                'vat_percentage' => $validated['vat_percentage'] ?? 0,
                'grand_total'    => $validated['grand_total'],
                'paid_amount'    => $validated['paid_amount'],
                'payment_method' => $validated['payment_method'],
                'status'         => $status,
            ]);

            // Create invoice items and update stock batches
            foreach ($validated['items'] as $item) {
                InvoiceItems::create([
                    'invoice_id'     => $invoice->id,
                    'stock_batch_id' => $item['stock_batch_id'],
                    'quantity'       => $item['quantity'],
                    'unit_price'     => $item['unit_price'],
                ]);

                $batch = StockBatches::findOrFail($item['stock_batch_id']);
                $newQty = $batch->current_quantity - $item['quantity'];
                if ($newQty < 0) {
                    throw new \Exception("Insufficient stock for: " . $batch->product?->generic_name);
                }
                $batch->update(['current_quantity' => $newQty]);                
            }

            // Record initial payment in receivable table
            if ($validated['paid_amount'] > 0) {
                $note = $status === 'paid'
                    ? $invNum . ' Full Paid'
                    : $invNum . ' First Payment';

                Receivable::create([
                    'invoice_id'         => $invoice->id,
                    'amount'             => $validated['paid_amount'],
                    'dateTime'           => $validated['invoice_date'],
                    'note'               => $note,
                    'payment_method_id'  => $validated['payment_method'],
                    'deposit_account_id' => $validated['deposit_account_id'] ?? null,
                ]);

                if (!empty($validated['deposit_account_id'])) {
                    DepositAccount::where('id', $validated['deposit_account_id'])
                        ->increment('current_balance', $validated['paid_amount']);
                }
            }

            return $invoice;
        });

        return response()->json(['message' => 'Invoice saved successfully', 'id' => $invoice->id], 201);
    }

    public function update(Request $request, $id) {

        $this->authorizeAnyRole([1, 2]);

        $invoice = Invoice::with('items')->findOrFail($id);

        if ($invoice->is_vat_invoice_issued) {
            return response()->json(['message' => 'This invoice cannot be edited because a tax invoice has already been issued for it.'], 422);
        }

        if ($invoice->creditNotes()->exists()) {
            return response()->json(['message' => 'This invoice cannot be edited because a credit note has been issued against it.'], 422);
        }

        $validated = $request->validate([
            'business_entity_id' => 'nullable|exists:business_entities,id',
            'customer_id'        => 'required|exists:customers,id',
            'po_number'          => 'nullable|string|max:100',
            'invoice_date'       => 'required|date',
            'sub_total'          => 'required|numeric',
            'discount'           => 'required|numeric|min:0',
            'vat_percentage'     => 'sometimes|numeric|min:0',
            'grand_total'        => 'required|numeric',
            'payment_method'     => 'sometimes|exists:payment_methods,id',
            'items'              => 'required|array|min:1',
            'items.*.stock_batch_id' => 'required|exists:stock_batches,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $collected = $invoice->receivables()->sum('amount');
        if ($validated['grand_total'] < $collected) {
            return response()->json([
                'message' => "New grand total cannot be less than the amount already received (Rs. {$collected})."
            ], 422);
        }

        DB::transaction(function () use ($invoice, $validated) {

            // Restore stock consumed by the invoice's current items before applying the new lines
            foreach ($invoice->items as $oldItem) {
                $batch = StockBatches::find($oldItem->stock_batch_id);
                if ($batch) {
                    $batch->update(['current_quantity' => $batch->current_quantity + $oldItem->quantity]);
                }
            }
            $invoice->items()->delete();

            foreach ($validated['items'] as $item) {
                InvoiceItems::create([
                    'invoice_id'     => $invoice->id,
                    'stock_batch_id' => $item['stock_batch_id'],
                    'quantity'       => $item['quantity'],
                    'unit_price'     => $item['unit_price'],
                ]);

                $batch = StockBatches::findOrFail($item['stock_batch_id']);
                $newQty = $batch->current_quantity - $item['quantity'];
                if ($newQty < 0) {
                    throw new \Exception("Insufficient stock for: " . $batch->product?->generic_name);
                }
                $batch->update(['current_quantity' => $newQty]);
            }

            $invoice->update([
                'business_entity_id' => $validated['business_entity_id'] ?? null,
                'po_number'          => $validated['po_number'] ?? null,
                'customer_id'        => $validated['customer_id'],
                'invoice_date'       => $validated['invoice_date'],
                'sub_total'          => $validated['sub_total'],
                'discount'           => $validated['discount'],
                'vat_percentage'     => $validated['vat_percentage'] ?? 0,
                'grand_total'        => $validated['grand_total'],
                'payment_method'     => $validated['payment_method'] ?? $invoice->payment_method,
            ]);

            // paid_amount and invoice_number are intentionally left untouched, and no
            // receivable rows are modified — the invoice number and cash history stay fixed.
            $invoice->syncPaymentStatus();
        });

        return response()->json(['message' => 'Invoice updated successfully', 'id' => $invoice->id]);
    }

    public function show($id)
    {
        $invoice = Invoice::with([
            'customer:id,name,contact_no,address',
            'user:id,name',
            'businessEntity:id,name',
            'items:id,invoice_id,stock_batch_id,quantity,unit_price',
            'items.stockBatch:id,batch_number,product_id',
            'items.stockBatch.product:id,generic_name',
            'receivables',
        ])->findOrFail($id);

        return response()->json([
            'invoice' => $invoice,
        ]);
    }

    public function printView($id)
    {
        $invoice = Invoice::with([
            'customer:id,name,contact_no,address',
            'user:id,name',
            'businessEntity',
            'items:id,invoice_id,stock_batch_id,quantity,unit_price',
            'items.stockBatch:id,batch_number,product_id',
            'items.stockBatch.product:id,generic_name',
            'receivables',
            'paymentMethod:id,name',
        ])->findOrFail($id);

        $entity = $invoice->businessEntity
            ?? BusinessEntity::query()->first();

        $company = (object) [
            'company_name'    => $entity?->name ?? '',
            'company_address' => $entity?->address ?? '',
            'company_phone'   => $entity?->phone ?? '',
            'company_vat_no'  => $entity?->vat_no ?? '',
        ];
        $logoPath = ($entity?->logo_path
            ? storage_path('app/public/' . $entity->logo_path)
            : null) ?? $this->resolveLogoPath();

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice'  => $invoice,
            'company'  => $company,
            'logoPath' => $logoPath,
        ])->setPaper([0, 0, 684, 792], 'portrait');

        return $pdf->stream('Invoice-' . $invoice->invoice_number . '.pdf');
    }

    private function resolveLogoPath(): ?string
    {
        $manifestPath = public_path('build/manifest.json');
        if (!file_exists($manifestPath)) {
            return null;
        }
        $manifest = json_decode(file_get_contents($manifestPath), true);
        $key      = 'resources/assets/logo.png';
        return isset($manifest[$key]) ? public_path('build/' . $manifest[$key]['file']) : null;
    }

    public function delete($id) {

        $invoice = Invoice::findOrFail($id);

        if ($invoice->is_vat_invoice_issued) {
            return response()->json(['message' => 'This invoice cannot be deleted because a tax invoice has already been issued for it.'], 422);
        }

        if ($invoice->creditNotes()->exists()) {
            return response()->json(['message' => 'This invoice cannot be deleted because a credit note has been issued against it.'], 422);
        }

        $invoice->items()->delete();
        $invoice->delete();
        return response()->json(['message' => 'Invoice deleted']);
    }
}
