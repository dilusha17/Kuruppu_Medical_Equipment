<?php

namespace App\Http\Controllers;

use App\Models\BusinessEntity;
use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use App\Models\Invoice;
use App\Models\InvoiceItems;
use App\Models\StockBatches;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreditNoteController extends Controller
{
    public function nextNumber() {

        $last = CreditNote::withTrashed()->latest()->first();
        $next = $last ? ($last->id + 1) : 1;
        return response()->json([
            'credit_note_number' => 'CN-' . str_pad($next, 4, '0', STR_PAD_LEFT)
        ]);
    }

    public function searchInvoice(Request $request) {

        $query = trim((string) $request->input('query'));
        if ($query === '') {
            return response()->json([]);
        }

        $invoices = Invoice::with('customer:id,name')
            ->where('invoice_number', 'like', "%{$query}%")
            ->latest()
            ->limit(20)
            ->get(['id', 'invoice_number', 'invoice_date', 'customer_id', 'grand_total'])
            ->map(fn ($inv) => [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'customer'       => $inv->customer?->name ?? 'Walk-in Customer',
                'grand_total'    => $inv->grand_total,
            ]);

        return response()->json($invoices);
    }

    // Returns invoice + items annotated with how much of each item is still creditable
    public function invoiceItems($id) {

        $invoice = Invoice::with([
            'customer:id,name,contact_no,address',
            'items.stockBatch:id,batch_number,product_id',
            'items.stockBatch.product:id,generic_name',
        ])->findOrFail($id);

        $items = $invoice->items->map(function ($item) {
            $alreadyCredited = CreditNoteItem::where('invoice_item_id', $item->id)->sum('quantity');
            return [
                'invoice_item_id'    => $item->id,
                'stock_batch_id'     => $item->stock_batch_id,
                'product_name'       => $item->stockBatch?->product?->generic_name ?? 'N/A',
                'batch_number'       => $item->stockBatch?->batch_number ?? 'N/A',
                'invoiced_qty'       => $item->quantity,
                'unit_price'         => $item->unit_price,
                'already_credited'   => $alreadyCredited,
                'creditable_qty'     => max(0, $item->quantity - $alreadyCredited),
            ];
        });

        return response()->json([
            'invoice' => [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'invoice_date'   => $invoice->invoice_date,
                'customer_id'    => $invoice->customer_id,
                'customer'       => $invoice->customer?->name ?? 'Walk-in Customer',
                'grand_total'    => $invoice->grand_total,
                'vat_percentage' => $invoice->vat_percentage,
                'business_entity_id' => $invoice->business_entity_id,
            ],
            'items' => $items,
        ]);
    }

    public function all(Request $request) {

        $query = CreditNote::with([
                'invoice:id,invoice_number',
                'customer:id,name',
                'items.stockBatch:id,batch_number,product_id',
                'items.stockBatch.product:id,generic_name',
            ])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('credit_note_number', 'like', "%{$search}%")
                  ->orWhereHas('invoice', fn ($q) => $q->where('invoice_number', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('credit_note_date', $request->date);
        }

        return response()->json($query->paginate(50));
    }

    public function show($id) {

        $creditNote = CreditNote::with([
            'invoice:id,invoice_number,invoice_date,grand_total',
            'customer:id,name,contact_no,address',
            'businessEntity:id,name',
            'user:id,name',
            'items.stockBatch:id,batch_number,product_id',
            'items.stockBatch.product:id,generic_name',
        ])->findOrFail($id);

        return response()->json(['credit_note' => $creditNote]);
    }

    public function store(Request $request) {

        $validated = $request->validate([
            'invoice_id'                    => 'required|exists:invoices,id',
            'credit_note_date'               => 'required|date',
            'notes'                           => 'nullable|string',
            'user_id'                         => 'required|exists:users,id',
            'items'                           => 'required|array|min:1',
            'items.*.invoice_item_id'        => 'required|exists:invoice_items,id',
            'items.*.quantity'                => 'required|integer|min:1',
            'items.*.reason'                  => 'required|in:shortage,damage',
            'items.*.restock_action'          => 'required_if:items.*.reason,damage|nullable|in:restock,write_off',
        ]);

        $creditNote = DB::transaction(function () use ($validated) {

            $invoice = Invoice::findOrFail($validated['invoice_id']);

            $last   = CreditNote::withTrashed()->latest()->first();
            $next   = $last ? ($last->id + 1) : 1;
            $cnNumber = 'CN-' . str_pad($next, 4, '0', STR_PAD_LEFT);

            $creditNote = CreditNote::create([
                'credit_note_number'  => $cnNumber,
                'invoice_id'          => $invoice->id,
                'customer_id'         => $invoice->customer_id,
                'business_entity_id'  => $invoice->business_entity_id,
                'user_id'             => $validated['user_id'],
                'credit_note_date'    => $validated['credit_note_date'],
                'notes'               => $validated['notes'] ?? null,
                'sub_total'           => 0,
                'vat_percentage'      => $invoice->vat_percentage,
                'vat_amount'          => 0,
                'grand_total'         => 0,
            ]);

            $subTotal = 0;

            foreach ($validated['items'] as $row) {
                $invoiceItem = InvoiceItems::findOrFail($row['invoice_item_id']);
                if ($invoiceItem->invoice_id !== $invoice->id) {
                    throw new \Exception('Invoice item does not belong to the selected invoice.');
                }

                $alreadyCredited = CreditNoteItem::where('invoice_item_id', $invoiceItem->id)->sum('quantity');
                $creditableQty   = $invoiceItem->quantity - $alreadyCredited;

                if ($row['quantity'] > $creditableQty) {
                    throw new \Exception("Credit quantity exceeds creditable amount for: " . $invoiceItem->stockBatch?->product?->generic_name);
                }

                $reason        = $row['reason'];
                $restockAction = $reason === 'shortage' ? 'restock' : ($row['restock_action'] ?? 'write_off');
                $shouldRestock = $restockAction === 'restock';

                CreditNoteItem::create([
                    'credit_note_id'   => $creditNote->id,
                    'invoice_item_id'  => $invoiceItem->id,
                    'stock_batch_id'   => $invoiceItem->stock_batch_id,
                    'quantity'         => $row['quantity'],
                    'unit_price'       => $invoiceItem->unit_price,
                    'reason'           => $reason,
                    'restock_action'   => $shouldRestock ? 'restocked' : 'written_off',
                ]);

                if ($shouldRestock) {
                    $batch = StockBatches::findOrFail($invoiceItem->stock_batch_id);
                    $batch->update(['current_quantity' => $batch->current_quantity + $row['quantity']]);
                }

                $subTotal += $row['quantity'] * $invoiceItem->unit_price;
            }

            $vatAmount  = $subTotal * ($invoice->vat_percentage / 100);
            $grandTotal = $subTotal + $vatAmount;

            $creditNote->update([
                'sub_total'   => $subTotal,
                'vat_amount'  => $vatAmount,
                'grand_total' => $grandTotal,
            ]);

            // Recompute invoice status now that a credit note has been issued against it
            $collected   = $invoice->receivables()->sum('amount');
            $credited    = $invoice->creditNotes()->sum('grand_total');
            $outstanding = $invoice->grand_total - $collected - $credited;

            if ($outstanding <= 0) {
                $invoice->update(['status' => 'paid']);
            } elseif ($collected + $credited > 0) {
                $invoice->update(['status' => 'partial']);
            }

            return $creditNote;
        });

        return response()->json(['message' => 'Credit note issued successfully', 'id' => $creditNote->id], 201);
    }

    public function printView($id) {

        $creditNote = CreditNote::with([
            'invoice:id,invoice_number,invoice_date',
            'customer:id,name,contact_no,address',
            'businessEntity',
            'user:id,name',
            'items.stockBatch:id,batch_number,product_id',
            'items.stockBatch.product:id,generic_name',
        ])->findOrFail($id);

        $entity = $creditNote->businessEntity
            ?? BusinessEntity::query()->first();

        $company = (object) [
            'company_name'    => $entity?->name ?? '',
            'company_address' => $entity?->address ?? '',
            'company_phone'   => $entity?->phone ?? '',
        ];

        $pdf = Pdf::loadView('pdf.credit-note', [
            'creditNote' => $creditNote,
            'company'    => $company,
        ])->setPaper([0, 0, 684, 792], 'portrait');

        return $pdf->stream('CreditNote-' . $creditNote->credit_note_number . '.pdf');
    }

    public function delete($id) {

        $creditNote = CreditNote::findOrFail($id);
        $creditNote->items()->delete();
        $creditNote->delete();
        return response()->json(['message' => 'Credit note deleted']);
    }
}
