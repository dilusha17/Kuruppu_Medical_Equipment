<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Receivable;
use Illuminate\Support\Facades\DB;

class ReceivableController extends Controller
{
    public function invoices(Request $request)
    {
        $query = Invoice::with(['customer', 'receivables', 'creditNotes'])->latest();

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'outstanding') {
                $query->whereIn('status', ['unpaid', 'partial']);
            } elseif ($request->status === 'paid') {
                $query->where('status', 'paid');
            }
        }

        if ($request->filled('search')) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }

        $paginated = $query->paginate(50);

        $paginated->getCollection()->transform(function ($inv) {
            $collected = $inv->receivables->sum('amount');
            $credited  = $inv->creditNotes->sum('grand_total');
            return [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'customer'       => $inv->customer?->name ?? 'Walk-in Customer',
                'customer_id'    => $inv->customer_id,
                'grand_total'    => $inv->grand_total,
                'collected'      => $collected,
                'credited'       => $credited,
                'outstanding'    => max(0, $inv->grand_total - $collected - $credited),
                'status'         => $inv->status,
            ];
        });

        return response()->json($paginated);
    }

    public function customerSummary(Request $request)
    {
        $query = Invoice::query();

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $invoices = $query->with(['receivables', 'creditNotes'])->get();
        $totalInvoiced  = $invoices->sum('grand_total');
        $totalCollected = $invoices->sum(fn($i) => $i->receivables->sum('amount'));
        $totalCredited  = $invoices->sum(fn($i) => $i->creditNotes->sum('grand_total'));

        return response()->json([
            'total_invoiced'    => $totalInvoiced,
            'total_collected'   => $totalCollected,
            'total_outstanding' => max(0, $totalInvoiced - $totalCollected - $totalCredited),
        ]);
    }

    public function paymentHistory($id)
    {
        $records = Receivable::where('invoice_id', $id)
            ->orderByDesc('dateTime')
            ->get(['id', 'amount', 'dateTime', 'note']);

        return response()->json($records);
    }

    public function recordPayment(Request $request)
    {
        $validated = $request->validate([
            'reference_id'       => 'required|exists:invoices,id',
            'amount'             => 'required|numeric|min:0.01',
            'date'               => 'required|date',
            'notes'              => 'nullable|string',
            'user_id'            => 'required|exists:users,id',
            'deposit_account_id' => 'nullable|exists:deposit_accounts,id',
        ]);

        $invoice = Invoice::findOrFail($validated['reference_id']);

        $collected   = $invoice->receivables()->sum('amount');
        $outstanding = $invoice->grand_total - $collected;

        if ($validated['amount'] > $outstanding) {
            return response()->json([
                'message' => "Payment exceeds outstanding amount of Rs. {$outstanding}"
            ], 422);
        }

        $receivable = Receivable::create([
            'invoice_id'         => $validated['reference_id'],
            'amount'             => $validated['amount'],
            'dateTime'           => $validated['date'],
            'note'               => $validated['notes'] ?? 'Additional Payment',
            'deposit_account_id' => $validated['deposit_account_id'] ?? null,
        ]);

        $newCollected = $collected + $validated['amount'];
        $newStatus    = $newCollected >= $invoice->grand_total ? 'paid' : 'partial';
        $invoice->update(['status' => $newStatus]);

        return response()->json($receivable, 201);
    }

    public function batchPayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_ids'        => 'required|array|min:1',
            'invoice_ids.*'      => 'required|exists:invoices,id',
            'date'               => 'required|date',
            'payment_method_id'  => 'required|exists:payment_methods,id',
            'deposit_account_id' => 'required|exists:deposit_accounts,id',
            'reference_no'       => 'nullable|string|max:100',
            'notes'              => 'nullable|string',
            'user_id'            => 'required|exists:users,id',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['invoice_ids'] as $invoiceId) {
                $invoice     = Invoice::findOrFail($invoiceId);
                $collected   = $invoice->receivables()->sum('amount');
                $outstanding = max(0, $invoice->grand_total - $collected);

                if ($outstanding <= 0) continue;

                Receivable::create([
                    'invoice_id'         => $invoiceId,
                    'amount'             => $outstanding,
                    'dateTime'           => $validated['date'],
                    'note'               => $validated['notes'] ?? 'Batch Settlement',
                    'payment_method_id'  => $validated['payment_method_id'],
                    'deposit_account_id' => $validated['deposit_account_id'],
                    'reference_no'       => $validated['reference_no'] ?? null,
                ]);

                $invoice->update(['status' => 'paid']);
            }
        });

        return response()->json(['message' => 'Batch settlement recorded successfully.'], 201);
    }
}
