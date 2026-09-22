<?php

namespace App\Http\Controllers;

use App\Models\Grn;
use App\Models\Grn_items;
use App\Models\StockBatches;
use App\Models\Product;
use App\Models\Suppliers;
use App\Models\Payable;
use App\Models\PaymentMethod;
use App\Models\DepositAccount;
use App\Models\BusinessEntity;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class GrnController extends Controller
{

    public function nextNumber()
    {

        $last = Grn::withTrashed()->latest()->first();
        $next = $last ? ($last->id + 1) : 1;
        return response()->json([
            'grn_number' => 'GRN-' . str_pad($next, 4, '0', STR_PAD_LEFT)
        ]);
    }

    // public function formData()
    // {
    //     try {
    //         $suppliers = Suppliers::all(['id', 'name']);
    //         $products = Product::with(['brand', 'category'])
    //             ->withSum('stockBatches', 'current_quantity')
    //             ->get();
    //         return response()->json([
    //             'suppliers' => $suppliers,
    //             'products' => $products
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => $e->getMessage(),
    //             'line'  => $e->getLine(),
    //             'file'  => $e->getFile(),
    //         ], 500);
    //     }
    // }

    public function formData() {

        try {
            $suppliers  = \App\Models\Suppliers::all(['id', 'name', 'is_vat']);

            // Only load columns the GRN product-search panel actually uses
            $products   = Product::with(['brand:id,name'])
                ->select('id', 'generic_name', 'barcode_value', 'sku', 'brand_id')
                ->get();

            $categories     = \App\Models\Categories::all(['id', 'name']);
            $brands         = \App\Models\Brands::all(['id', 'name']);
            $unitTypes      = \App\Models\UnitTypes::all(['id', 'name']);
            $paymentMethods = PaymentMethod::orderBy('name')->get(['id', 'name']);
            $depositAccounts = DepositAccount::where('status', true)->orderBy('name')->get(['id', 'name', 'type']);
            $businessEntities = BusinessEntity::orderBy('name')->get(['id', 'name', 'is_vat_registered', 'vat_no']);

            // Include next GRN number so GRNPage needs only one request on load
            $last       = Grn::withTrashed()->latest()->first();
            $nextNum    = 'GRN-' . str_pad(($last ? $last->id + 1 : 1), 4, '0', STR_PAD_LEFT);

            return response()->json([
                'suppliers'         => $suppliers,
                'products'          => $products,
                'categories'        => $categories,
                'brands'            => $brands,
                'unit_types'        => $unitTypes,
                'payment_methods'   => $paymentMethods,
                'deposit_accounts'  => $depositAccounts,
                'business_entities' => $businessEntities,
                'next_number'       => $nextNum,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function all(Request $request)
    {
        $query = Grn::with([
                'supplier:id,name',
                'user:id,name',
                'items:id,grn_id,product_id,quantity,unit_price,batch_number,expiry_date,mfd_date',
                'items.product:id,generic_name',
            ])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('grn_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('received_date', $request->date);
        }

        return response()->json($query->paginate(50));
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'supplier_id'            => 'required|exists:suppliers,id',
            'business_entity_id'     => 'nullable|exists:business_entities,id',
            'supplier_invoice_no'    => 'nullable|string',
            'received_date'          => 'required|date',
            'sub_total'              => 'required|numeric',
            'discount'               => 'required|numeric|min:0',
            'total_amount'           => 'required|numeric',
            'paid_amount'            => 'required|numeric|min:0',
            'payment_method_id'      => 'nullable|exists:payment_methods,id',
            'deposit_account_id'     => 'nullable|exists:deposit_accounts,id',
            'is_vat'                 => 'sometimes|boolean',
            'vat_amount'             => 'sometimes|numeric|min:0',
            'vat_percentage'         => 'sometimes|numeric|min:0',
            'notes'                  => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|exists:products,id',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.unit_price'     => 'required|numeric|min:0',
            'items.*.batch_number'   => 'nullable|string',
            'items.*.expiry_date'    => 'nullable|date',
            'items.*.mfd_date'       => 'nullable|date',
        ]);

        // Calculate payment status
        $status = 'unpaid';
        if ($validated['paid_amount'] >= $validated['total_amount']) {
            $status = 'paid';
        } elseif ($validated['paid_amount'] > 0) {
            $status = 'partial';
        }

        $grn = DB::transaction(function () use ($validated, $status) {

            $last   = Grn::withTrashed()->latest()->first();
            $next   = $last ? ($last->id + 1) : 1;
            $grnNum = 'GRN-' . str_pad($next, 4, '0', STR_PAD_LEFT);

            $userId = Auth::id();

            $grn = Grn::create([
                'grn_number'          => $grnNum,
                'supplier_id'         => $validated['supplier_id'],
                'business_entity_id'  => $validated['business_entity_id'] ?? null,
                'user_id'             => $userId,
                'supplier_invoice_no' => $validated['supplier_invoice_no'] ?? null,
                'received_date'       => $validated['received_date'],
                'sub_total'           => $validated['sub_total'],
                'discount'            => $validated['discount'],
                'total_amount'        => $validated['total_amount'],
                'paid_amount'         => $validated['paid_amount'],
                'payment_method_id'   => $validated['payment_method_id'] ?? null,
                'deposit_account_id'  => $validated['deposit_account_id'] ?? null,
                'is_vat'              => $validated['is_vat'] ?? false,
                'vat_amount'          => $validated['vat_amount'] ?? 0,
                'vat_percentage'      => $validated['vat_percentage'] ?? 0,
                'payment_status'      => $status,
                'notes'               => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {

                Grn_items::create([
                    'grn_id'        => $grn->id,
                    'product_id'    => $item['product_id'],
                    'quantity'      => $item['quantity'],
                    'unit_price'    => $item['unit_price'],
                    'batch_number'  => $item['batch_number'] ?? null,
                    'expiry_date'   => $item['expiry_date'] ?? null,
                    'mfd_date'      => $item['mfd_date'] ?? null,
                ]);

                StockBatches::create([
                    'product_id'       => $item['product_id'],
                    'grn_id'           => $grn->id,
                    'user_id'          => $userId,
                    'batch_number'     => $item['batch_number'] ?? null,
                    'mfd'              => $item['mfd_date'] ?? null,
                    'expiry_date'      => $item['expiry_date'] ?? null,
                    'purchase_price'   => $item['unit_price'],
                    'initial_quantity' => $item['quantity'],
                    'current_quantity' => $item['quantity'],
                ]);
            }

            // Record initial payment in payables table
            if ($validated['paid_amount'] > 0) {
                $note = $status === 'paid'
                    ? $grn->grn_number . ' Full Paid'
                    : $grn->grn_number . ' First Payment';

                Payable::create([
                    'grns_id'            => $grn->id,
                    'amount'             => $validated['paid_amount'],
                    'dateTime'           => $validated['received_date'],
                    'note'               => $note,
                    'deposit_account_id' => $validated['deposit_account_id'] ?? null,
                ]);
            }

            return $grn;
        });

        return response()->json(['message' => 'GRN saved successfully', 'id' => $grn->id], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAnyRole([1, 2]);

        $grn = Grn::with('items')->findOrFail($id);

        $validated = $request->validate([
            'supplier_id'            => 'required|exists:suppliers,id',
            'business_entity_id'     => 'nullable|exists:business_entities,id',
            'supplier_invoice_no'    => 'nullable|string',
            'received_date'          => 'required|date',
            'sub_total'              => 'required|numeric',
            'discount'               => 'required|numeric|min:0',
            'total_amount'           => 'required|numeric',
            'payment_method_id'      => 'nullable|exists:payment_methods,id',
            'deposit_account_id'     => 'nullable|exists:deposit_accounts,id',
            'is_vat'                 => 'sometimes|boolean',
            'vat_amount'             => 'sometimes|numeric|min:0',
            'vat_percentage'         => 'sometimes|numeric|min:0',
            'notes'                  => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|exists:products,id',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.unit_price'     => 'required|numeric|min:0',
            'items.*.batch_number'   => 'nullable|string',
            'items.*.expiry_date'    => 'nullable|date',
            'items.*.mfd_date'       => 'nullable|date',
        ]);

        // Payable table is the source of truth for cash actually paid, with a
        // fallback to paid_amount for older GRNs that predate that table.
        $payablesSum = $grn->payables()->sum('amount');
        $totalPaid   = $payablesSum > 0 ? $payablesSum : (float) $grn->paid_amount;

        if ($validated['total_amount'] < $totalPaid) {
            return response()->json([
                'message' => "New total cannot be less than the amount already paid (Rs. {$totalPaid})."
            ], 422);
        }

        try {
            DB::transaction(function () use ($grn, $validated, $totalPaid) {

                // Existing batches for this GRN, one per product in practice
                $batchesByProduct = StockBatches::where('grn_id', $grn->id)->get()->keyBy('product_id');
                $matchedProductIds = [];

                foreach ($validated['items'] as $item) {
                    $batch = $batchesByProduct->get($item['product_id']);

                    if ($batch) {
                        $consumed = $batch->initial_quantity - $batch->current_quantity;
                        if ($item['quantity'] < $consumed) {
                            throw new \Exception("Cannot reduce quantity for " . ($batch->product?->generic_name ?? 'a product') . " below what has already been sold or used ({$consumed}).");
                        }
                        $batch->update([
                            'batch_number'     => $item['batch_number'] ?? null,
                            'mfd'              => $item['mfd_date'] ?? null,
                            'expiry_date'      => $item['expiry_date'] ?? null,
                            'purchase_price'   => $item['unit_price'],
                            'initial_quantity' => $item['quantity'],
                            'current_quantity' => $item['quantity'] - $consumed,
                        ]);
                    } else {
                        StockBatches::create([
                            'product_id'       => $item['product_id'],
                            'grn_id'           => $grn->id,
                            'user_id'          => Auth::id(),
                            'batch_number'     => $item['batch_number'] ?? null,
                            'mfd'              => $item['mfd_date'] ?? null,
                            'expiry_date'      => $item['expiry_date'] ?? null,
                            'purchase_price'   => $item['unit_price'],
                            'initial_quantity' => $item['quantity'],
                            'current_quantity' => $item['quantity'],
                        ]);
                    }

                    $matchedProductIds[] = $item['product_id'];
                }

                // A batch for a product no longer on the GRN can only be removed if untouched
                foreach ($batchesByProduct as $productId => $batch) {
                    if (in_array($productId, $matchedProductIds, true)) continue;

                    $consumed = $batch->initial_quantity - $batch->current_quantity;
                    $hasReferences = $batch->invoiceItems()->exists()
                        || $batch->inventoryAdjustments()->exists()
                        || \App\Models\CreditNoteItem::where('stock_batch_id', $batch->id)->exists();

                    if ($consumed > 0 || $hasReferences) {
                        throw new \Exception("Cannot remove " . ($batch->product?->generic_name ?? 'a product') . " from this GRN because its stock has already been used.");
                    }

                    $batch->delete();
                }

                $grn->items()->delete();
                foreach ($validated['items'] as $item) {
                    Grn_items::create([
                        'grn_id'       => $grn->id,
                        'product_id'   => $item['product_id'],
                        'quantity'     => $item['quantity'],
                        'unit_price'   => $item['unit_price'],
                        'batch_number' => $item['batch_number'] ?? null,
                        'expiry_date'  => $item['expiry_date'] ?? null,
                        'mfd_date'     => $item['mfd_date'] ?? null,
                    ]);
                }

                $newStatus = $totalPaid >= $validated['total_amount']
                    ? 'paid'
                    : ($totalPaid > 0 ? 'partial' : 'unpaid');

                $grn->update([
                    'supplier_id'         => $validated['supplier_id'],
                    'business_entity_id'  => $validated['business_entity_id'] ?? null,
                    'supplier_invoice_no' => $validated['supplier_invoice_no'] ?? null,
                    'received_date'       => $validated['received_date'],
                    'sub_total'           => $validated['sub_total'],
                    'discount'            => $validated['discount'],
                    'total_amount'        => $validated['total_amount'],
                    'payment_method_id'   => $validated['payment_method_id'] ?? null,
                    'deposit_account_id'  => $validated['deposit_account_id'] ?? null,
                    'is_vat'              => $validated['is_vat'] ?? false,
                    'vat_amount'          => $validated['vat_amount'] ?? 0,
                    'vat_percentage'      => $validated['vat_percentage'] ?? 0,
                    'payment_status'      => $newStatus,
                    'notes'               => $validated['notes'] ?? null,
                ]);
                // paid_amount and payable rows are intentionally left untouched.
            });
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'GRN updated successfully', 'id' => $grn->id]);
    }

    public function show($id)
    {
        $grn = Grn::with([
            'supplier:id,name,contact_no,address',
            'user:id,name',
            'items:id,grn_id,product_id,quantity,unit_price,batch_number,expiry_date,mfd_date',
            'items.product:id,generic_name',
            'payables',
        ])->findOrFail($id);

        // Map payables to the PaymentRecord shape the front-end expects
        $payments = $grn->payables->map(fn ($p) => [
            'id'     => $p->id,
            'amount' => $p->amount,
            'date'   => $p->dateTime?->format('Y-m-d'),
            'notes'  => $p->note,
            'user'   => null,
        ]);

        return response()->json([
            'grn'      => $grn,
            'payments' => $payments,
        ]);
    }

    public function printView($id)
    {
        $grn = Grn::with([
            'supplier:id,name,contact_no,address',
            'user:id,name',
            'items:id,grn_id,product_id,quantity,unit_price,batch_number,expiry_date',
            'items.product:id,generic_name',
            'payables',
            'paymentMethod:id,name',
            'depositAccount:id,name,type',
        ])->findOrFail($id);

        $entity   = BusinessEntity::query()->first();
        $company  = (object) [
            'company_name'    => $entity?->name ?? '',
            'company_address' => $entity?->address ?? '',
            'company_phone'   => $entity?->phone ?? '',
            'company_vat_no'  => $entity?->vat_no ?? '',
        ];
        $logoPath = ($entity?->logo_path
            ? storage_path('app/public/' . $entity->logo_path)
            : null) ?? $this->resolveLogoPath();

        $pdf = Pdf::loadView('pdf.grn', [
            'grn'      => $grn,
            'company'  => $company,
            'logoPath' => $logoPath,
        ])->setPaper([0, 0, 684, 792], 'portrait');

        return $pdf->stream('GRN-' . $grn->grn_number . '.pdf');
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

    public function delete($id)
    {

        $grn = Grn::findOrFail($id);
        $grn->items()->delete();
        $grn->delete();
        return response()->json(['message' => 'GRN deleted']);
    }
}
