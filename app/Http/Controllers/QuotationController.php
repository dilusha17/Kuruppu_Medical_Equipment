<?php

namespace App\Http\Controllers;

use App\Models\BusinessEntity;
use App\Models\Customers;
use App\Models\Invoice;
use App\Models\InvoiceItems;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Receivable;
use App\Models\StockBatches;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
{
    public function nextNumber()
    {
        $last = Quotation::withTrashed()->latest()->first();
        $next = $last ? ($last->id + 1) : 1;
        return response()->json([
            'quotation_number' => 'QTN-' . str_pad($next, 4, '0', STR_PAD_LEFT)
        ]);
    }

    public function formData()
    {
        try {
            $customers = Customers::all(['id', 'name', 'is_vat']);
            $paymentMethods = PaymentMethod::all();

            $products = Product::with(['brand:id,name', 'category:id,name'])
                ->select('id', 'generic_name', 'barcode_value', 'brand_id', 'category_id')
                ->get()
                ->map(function ($product) {
                    return [
                        'product_id'    => $product->id,
                        'generic_name'  => $product->generic_name,
                        'barcode_value' => $product->barcode_value,
                        'brand'         => $product->brand?->name,
                        'category'      => $product->category?->name,
                    ];
                });

            $last    = Quotation::withTrashed()->latest()->first();
            $nextNum = 'QTN-' . str_pad(($last ? $last->id + 1 : 1), 4, '0', STR_PAD_LEFT);

            $businessEntities = BusinessEntity::query()
                ->get(['id', 'name', 'is_vat_registered', 'vat_no', 'address', 'phone', 'place_of_supply']);

            return response()->json([
                'customers'         => $customers,
                'payment_methods'   => $paymentMethods,
                'products'          => $products,
                'next_number'       => $nextNum,
                'business_entities' => $businessEntities,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_entity_id' => 'nullable|exists:business_entities,id',
            'customer_id'        => 'required|exists:customers,id',
            'user_id'            => 'required|exists:users,id',
            'po_number'          => 'nullable|string|max:100',
            'quotation_date'     => 'required|date',
            'sub_total'          => 'required|numeric',
            'discount'           => 'required|numeric|min:0',
            'vat_percentage'     => 'sometimes|numeric|min:0',
            'grand_total'        => 'required|numeric',
            'notes'              => 'nullable|string',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $quotation = DB::transaction(function () use ($validated) {
            $last   = Quotation::withTrashed()->latest()->first();
            $next   = $last ? ($last->id + 1) : 1;
            $qtnNum = 'QTN-' . str_pad($next, 4, '0', STR_PAD_LEFT);

            $quotation = Quotation::create([
                'quotation_number'   => $qtnNum,
                'business_entity_id' => $validated['business_entity_id'] ?? null,
                'po_number'          => $validated['po_number'] ?? null,
                'customer_id'        => $validated['customer_id'],
                'user_id'            => $validated['user_id'],
                'quotation_date'     => $validated['quotation_date'],
                'sub_total'          => $validated['sub_total'],
                'discount'           => $validated['discount'],
                'vat_percentage'     => $validated['vat_percentage'] ?? 0,
                'grand_total'        => $validated['grand_total'],
                'notes'              => $validated['notes'] ?? null,
                'status'             => 'draft',
            ]);

            foreach ($validated['items'] as $item) {
                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id'   => $item['product_id'],
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $item['unit_price'],
                ]);
            }

            return $quotation;
        });

        return response()->json(['message' => 'Quotation saved successfully', 'id' => $quotation->id], 201);
    }

    public function all(Request $request)
    {
        $query = Quotation::with([
                'customer:id,name,contact_no,address',
                'user:id,name',
                'businessEntity:id,name',
                'items:id,quotation_id,product_id,quantity,unit_price',
                'items.product:id,generic_name',
            ])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('quotation_date', $request->date);
        }

        if ($request->filled('business_entity_id')) {
            $query->where('business_entity_id', $request->business_entity_id);
        }

        return response()->json($query->paginate(50));
    }

    public function show($id)
    {
        $quotation = Quotation::with([
            'customer:id,name,contact_no,address',
            'user:id,name',
            'businessEntity:id,name',
            'items:id,quotation_id,product_id,quantity,unit_price',
            'items.product:id,generic_name',
        ])->findOrFail($id);

        return response()->json(['quotation' => $quotation]);
    }

    public function printView($id)
    {
        $quotation = Quotation::with([
            'customer:id,name,contact_no,address',
            'user:id,name',
            'businessEntity',
            'items:id,quotation_id,product_id,quantity,unit_price',
            'items.product:id,generic_name',
        ])->findOrFail($id);

        $entity = $quotation->businessEntity
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

        $pdf = Pdf::loadView('pdf.quotation', [
            'quotation' => $quotation,
            'company'   => $company,
            'logoPath'  => $logoPath,
        ])->setPaper([0, 0, 684, 792], 'portrait');

        return $pdf->stream('Quotation-' . $quotation->quotation_number . '.pdf');
    }

    public function issueInvoice(Request $request)
    {
        $validated = $request->validate([
            'quotation_id'   => 'required|exists:quotations,id',
            'payment_method' => 'required|exists:payment_methods,id',
            'paid_amount'    => 'required|numeric|min:0',
        ]);

        $quotation = Quotation::with('items.product')->findOrFail($validated['quotation_id']);

        if ($quotation->status === 'invoiced') {
            return response()->json(['message' => 'This quotation has already been invoiced.'], 400);
        }

        $invoice = DB::transaction(function () use ($quotation, $validated) {
            $lastInv = Invoice::withTrashed()->latest()->first();
            $nextInv = $lastInv ? ($lastInv->id + 1) : 1;
            $invNum  = 'INV-' . str_pad($nextInv, 4, '0', STR_PAD_LEFT);

            $status = 'unpaid';
            if ($validated['paid_amount'] >= $quotation->grand_total) {
                $status = 'paid';
            } elseif ($validated['paid_amount'] > 0) {
                $status = 'partial';
            }

            $invoice = Invoice::create([
                'invoice_number'     => $invNum,
                'business_entity_id' => $quotation->business_entity_id,
                'po_number'          => $quotation->po_number,
                'customer_id'        => $quotation->customer_id,
                'user_id'            => $quotation->user_id,
                'invoice_date'       => now()->toDateString(),
                'sub_total'          => $quotation->sub_total,
                'discount'           => $quotation->discount,
                'vat_percentage'     => $quotation->vat_percentage,
                'grand_total'        => $quotation->grand_total,
                'paid_amount'        => $validated['paid_amount'],
                'payment_method'     => $validated['payment_method'],
                'status'             => $status,
            ]);

            foreach ($quotation->items as $item) {
                $batch = StockBatches::where('product_id', $item->product_id)
                    ->where('current_quantity', '>=', $item->quantity)
                    ->orderBy('expiry_date', 'asc')
                    ->first();

                if (!$batch) {
                    throw new \Exception("Insufficient stock for: " . $item->product?->generic_name);
                }

                InvoiceItems::create([
                    'invoice_id'     => $invoice->id,
                    'stock_batch_id' => $batch->id,
                    'quantity'       => $item->quantity,
                    'unit_price'     => $item->unit_price,
                ]);

                $batch->update(['current_quantity' => $batch->current_quantity - $item->quantity]);
            }

            if ($validated['paid_amount'] > 0) {
                $note = $status === 'paid'
                    ? $invNum . ' Full Paid'
                    : $invNum . ' First Payment';

                Receivable::create([
                    'invoice_id' => $invoice->id,
                    'amount'     => $validated['paid_amount'],
                    'dateTime'   => now()->toDateString(),
                    'note'       => $note,
                ]);
            }

            $quotation->update([
                'status'     => 'invoiced',
                'invoice_id' => $invoice->id,
            ]);

            return $invoice;
        });

        return response()->json([
            'message'    => 'Invoice created from quotation successfully',
            'invoice_id' => $invoice->id,
        ], 201);
    }

    public function delete($id)
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->items()->delete();
        $quotation->delete();
        return response()->json(['message' => 'Quotation deleted']);
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
}
