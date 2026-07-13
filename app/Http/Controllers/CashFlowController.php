<?php

namespace App\Http\Controllers;

use App\Models\BusinessEntity;
use App\Models\DepositAccount;
use App\Models\Expense;
use App\Models\Payable;
use App\Models\Receivable;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CashFlowController extends Controller
{
    public function data(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        $accounts = DepositAccount::where('is_active', true)->get();

        // --- Inflows (receivables) ---
        $inQuery = Receivable::with([
                'invoice:id,invoice_number,customer_id',
                'invoice.customer:id,name',
                'depositAccount:id,name,type',
            ])
            ->whereBetween('dateTime', [$from, $to]);

        if ($request->filled('deposit_account_id')) {
            $inQuery->where('deposit_account_id', $request->deposit_account_id);
        }

        $inflows = $inQuery->orderBy('dateTime', 'desc')->get()->map(function ($r) {
            return [
                'id'              => 'R-' . $r->id,
                'date'            => $r->dateTime,
                'type'            => 'inflow',
                'description'     => $r->invoice?->invoice_number ?? 'Payment Received',
                'party'           => $r->invoice?->customer?->name ?? 'Walk-in',
                'deposit_account' => $r->depositAccount?->name ?? 'Unassigned',
                'account_type'    => $r->depositAccount?->type ?? null,
                'account_id'      => $r->deposit_account_id,
                'reference_no'    => $r->reference_no ?? null,
                'amount'          => $r->amount,
            ];
        });

        // --- Outflows: Expenses ---
        $expQuery = Expense::with(['category:id,name', 'depositAccount:id,name,type'])
            ->whereBetween('date', [$from, $to]);

        if ($request->filled('deposit_account_id')) {
            $expQuery->where('deposit_account_id', $request->deposit_account_id);
        }

        $expOutflows = $expQuery->orderBy('date', 'desc')->get()->map(function ($e) {
            return [
                'id'              => 'E-' . $e->id,
                'date'            => $e->date,
                'type'            => 'outflow',
                'description'     => $e->expense_number . ' — ' . $e->description,
                'party'           => $e->category?->name ?? 'Expense',
                'deposit_account' => $e->depositAccount?->name ?? 'Unassigned',
                'account_type'    => $e->depositAccount?->type ?? null,
                'account_id'      => $e->deposit_account_id,
                'reference_no'    => null,
                'amount'          => $e->amount,
            ];
        });

        // --- Outflows: GRN Payments ---
        $payQuery = Payable::with(['grn:id,grn_number,supplier_id', 'grn.supplier:id,name', 'depositAccount:id,name,type'])
            ->whereBetween('dateTime', [$from, $to]);

        if ($request->filled('deposit_account_id')) {
            $payQuery->where('deposit_account_id', $request->deposit_account_id);
        }

        $payOutflows = $payQuery->orderBy('dateTime', 'desc')->get()->map(function ($p) {
            return [
                'id'              => 'P-' . $p->id,
                'date'            => $p->dateTime,
                'type'            => 'outflow',
                'description'     => $p->grn?->grn_number ?? 'GRN Payment',
                'party'           => $p->grn?->supplier?->name ?? 'Supplier',
                'deposit_account' => $p->depositAccount?->name ?? 'Unassigned',
                'account_type'    => $p->depositAccount?->type ?? null,
                'account_id'      => $p->deposit_account_id,
                'reference_no'    => null,
                'amount'          => $p->amount,
            ];
        });

        // Merge and sort by date desc
        $allTransactions = $inflows->concat($expOutflows)->concat($payOutflows)
            ->sortByDesc('date')->values();

        // Account summaries
        $accountSummaries = [];
        foreach ($accounts as $acc) {
            $totalIn = Receivable::where('deposit_account_id', $acc->id)
                ->whereBetween('dateTime', [$from, $to])->sum('amount');
            $totalExpOut = Expense::where('deposit_account_id', $acc->id)
                ->whereBetween('date', [$from, $to])->sum('amount');
            $totalPayOut = Payable::where('deposit_account_id', $acc->id)
                ->whereBetween('dateTime', [$from, $to])->sum('amount');

            $accountSummaries[] = [
                'id'        => $acc->id,
                'name'      => $acc->name,
                'type'      => $acc->type,
                'bank_name' => $acc->bank_name,
                'inflow'    => $totalIn,
                'outflow'   => $totalExpOut + $totalPayOut,
                'balance'   => $totalIn - ($totalExpOut + $totalPayOut),
            ];
        }

        $totalInflow  = $inflows->sum('amount');
        $totalOutflow = $expOutflows->sum('amount') + $payOutflows->sum('amount');

        return response()->json([
            'transactions'     => $allTransactions,
            'account_summaries' => $accountSummaries,
            'total_inflow'     => $totalInflow,
            'total_outflow'    => $totalOutflow,
            'net_flow'         => $totalInflow - $totalOutflow,
        ]);
    }

    public function pdf(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();
        $company = BusinessEntity::where('is_active', true)->first();
        $accounts = DepositAccount::where('is_active', true)->get();

        // Inflows
        $inQuery = Receivable::with([
                'invoice:id,invoice_number,customer_id',
                'invoice.customer:id,name',
                'depositAccount:id,name,type',
            ])
            ->whereBetween('dateTime', [$from, $to]);

        if ($request->filled('deposit_account_id')) {
            $inQuery->where('deposit_account_id', $request->deposit_account_id);
        }

        $inflows = $inQuery->orderBy('dateTime', 'desc')->get();

        // Outflows: Expenses
        $expQuery = Expense::with(['category:id,name', 'depositAccount:id,name,type'])
            ->whereBetween('date', [$from, $to]);

        if ($request->filled('deposit_account_id')) {
            $expQuery->where('deposit_account_id', $request->deposit_account_id);
        }

        $expOutflows = $expQuery->orderBy('date', 'desc')->get();

        // Outflows: GRN Payments
        $payQuery = Payable::with(['grn:id,grn_number,supplier_id', 'grn.supplier:id,name', 'depositAccount:id,name,type'])
            ->whereBetween('dateTime', [$from, $to]);

        if ($request->filled('deposit_account_id')) {
            $payQuery->where('deposit_account_id', $request->deposit_account_id);
        }

        $payOutflows = $payQuery->orderBy('dateTime', 'desc')->get();

        // Account summaries
        $accountSummaries = [];
        foreach ($accounts as $acc) {
            $totalIn = Receivable::where('deposit_account_id', $acc->id)
                ->whereBetween('dateTime', [$from, $to])->sum('amount');
            $totalExpOut = Expense::where('deposit_account_id', $acc->id)
                ->whereBetween('date', [$from, $to])->sum('amount');
            $totalPayOut = Payable::where('deposit_account_id', $acc->id)
                ->whereBetween('dateTime', [$from, $to])->sum('amount');

            $accountSummaries[] = [
                'name'    => $acc->name,
                'type'    => $acc->type,
                'inflow'  => $totalIn,
                'outflow' => $totalExpOut + $totalPayOut,
                'balance' => $totalIn - ($totalExpOut + $totalPayOut),
            ];
        }

        $totalInflow  = $inflows->sum('amount');
        $totalOutflow = $expOutflows->sum('amount') + $payOutflows->sum('amount');

        $accountName = null;
        if ($request->filled('deposit_account_id')) {
            $accountName = DepositAccount::find($request->deposit_account_id)?->name;
        }

        $pdf = Pdf::loadView('pdf.report-cashflow', [
            'inflows'          => $inflows,
            'expOutflows'      => $expOutflows,
            'payOutflows'      => $payOutflows,
            'accountSummaries' => $accountSummaries,
            'totalInflow'      => $totalInflow,
            'totalOutflow'     => $totalOutflow,
            'netFlow'          => $totalInflow - $totalOutflow,
            'company'          => $company,
            'dateFrom'         => $from,
            'dateTo'           => $to,
            'accountName'      => $accountName,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('Cash-Flow-Report.pdf');
    }
}
