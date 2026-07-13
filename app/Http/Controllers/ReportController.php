<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusinessEntity;
use App\Models\Customers;
use App\Models\Invoice;
use App\Models\Grn;
use App\Models\Expense;
use App\Models\ExpensesCategory;
use App\Models\Suppliers;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function outstanding(Request $request)
    {
        $period = (int) ($request->period ?? 30);
        $cutoff = Carbon::now()->subDays($period);

        $query = Invoice::with('customer')
            ->whereIn('status', ['unpaid', 'partial'])
            ->where('invoice_date', '<=', $cutoff);

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $invoices = $query->latest('invoice_date')->get();

        $data = $invoices->map(function ($inv) {
            $collected   = $inv->receivables()->sum('amount');
            $outstanding = max(0, $inv->grand_total - $collected);
            $daysOverdue = Carbon::parse($inv->invoice_date)->diffInDays(Carbon::now());

            return [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'customer'       => $inv->customer?->name ?? 'Walk-in Customer',
                'grand_total'    => $inv->grand_total,
                'collected'      => $collected,
                'outstanding'    => $outstanding,
                'days_overdue'   => $daysOverdue,
            ];
        })->filter(fn($i) => $i['outstanding'] > 0)->values();

        return response()->json([
            'invoices'          => $data,
            'total_outstanding' => $data->sum('outstanding'),
            'total_invoiced'    => $data->sum('grand_total'),
            'count'             => $data->count(),
        ]);
    }

    public function profitLoss(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        $revenue   = Invoice::whereBetween('invoice_date', [$from, $to])->sum('grand_total');
        $purchases = Grn::whereBetween('received_date', [$from, $to])->sum('total_amount');
        $expenses  = Expense::whereBetween('date', [$from, $to])->sum('amount');

        $categorySummary = Expense::whereBetween('date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn($e) => [
                'category' => $e->category?->name ?? 'Uncategorized',
                'total'    => $e->total,
            ]);

        return response()->json([
            'revenue'           => $revenue,
            'purchases'         => $purchases,
            'expenses'          => $expenses,
            'profit'            => $revenue - $purchases - $expenses,
            'expense_breakdown' => $categorySummary,
            'date_from'         => $from,
            'date_to'           => $to,
        ]);
    }

    public function expenses(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        $query = Expense::with('category:id,name', 'user:id,name')
            ->whereBetween('date', [$from, $to]);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $expenses = $query->latest('date')->paginate(50);

        $totalAmount = Expense::whereBetween('date', [$from, $to])
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->category_id))
            ->sum('amount');

        $categorySummary = Expense::whereBetween('date', [$from, $to])
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->category_id))
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn($e) => [
                'category' => $e->category?->name ?? 'Uncategorized',
                'total'    => $e->total,
            ]);

        return response()->json([
            'expenses'         => $expenses,
            'total_amount'     => $totalAmount,
            'category_summary' => $categorySummary,
        ]);
    }

    public function purchases(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        $query = Grn::with('supplier:id,name')
            ->whereBetween('received_date', [$from, $to]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $grns = $query->latest('received_date')->paginate(50);

        $totalAmount = Grn::whereBetween('received_date', [$from, $to])
            ->when($request->filled('supplier_id'), fn($q) => $q->where('supplier_id', $request->supplier_id))
            ->sum('total_amount');

        return response()->json([
            'grns'         => $grns,
            'total_amount' => $totalAmount,
        ]);
    }

    // ── PDF Methods ─────────────────────────────────────────────────

    public function outstandingPdf(Request $request)
    {
        $period  = (int) ($request->period ?? 30);
        $cutoff  = Carbon::now()->subDays($period);
        $company = BusinessEntity::where('is_active', true)->first();

        $query = Invoice::with('customer')
            ->whereIn('status', ['unpaid', 'partial'])
            ->where('invoice_date', '<=', $cutoff);

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $invoices = $query->latest('invoice_date')->get();

        $data = $invoices->map(function ($inv) {
            $collected   = $inv->receivables()->sum('amount');
            $outstanding = max(0, $inv->grand_total - $collected);
            return [
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'customer'       => $inv->customer?->name ?? 'Walk-in Customer',
                'grand_total'    => $inv->grand_total,
                'collected'      => $collected,
                'outstanding'    => $outstanding,
                'days_overdue'   => Carbon::parse($inv->invoice_date)->diffInDays(Carbon::now()),
            ];
        })->filter(fn($i) => $i['outstanding'] > 0)->values();

        $reportData = [
            'invoices'          => $data->toArray(),
            'total_outstanding' => $data->sum('outstanding'),
            'total_invoiced'    => $data->sum('grand_total'),
            'count'             => $data->count(),
        ];

        $customerName = $request->filled('customer_id')
            ? Customers::find($request->customer_id)?->name
            : null;

        $pdf = Pdf::loadView('pdf.report-outstanding', [
            'data'     => $reportData,
            'company'  => $company,
            'period'   => $period,
            'customer' => $customerName,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Outstanding-Report.pdf');
    }

    public function profitLossPdf(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();
        $company = BusinessEntity::where('is_active', true)->first();

        $revenue   = Invoice::whereBetween('invoice_date', [$from, $to])->sum('grand_total');
        $purchases = Grn::whereBetween('received_date', [$from, $to])->sum('total_amount');
        $expenses  = Expense::whereBetween('date', [$from, $to])->sum('amount');

        $categorySummary = Expense::whereBetween('date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn($e) => [
                'category' => $e->category?->name ?? 'Uncategorized',
                'total'    => $e->total,
            ]);

        $data = [
            'revenue'           => $revenue,
            'purchases'         => $purchases,
            'expenses'          => $expenses,
            'profit'            => $revenue - $purchases - $expenses,
            'expense_breakdown' => $categorySummary,
            'date_from'         => $from,
            'date_to'           => $to,
        ];

        $pdf = Pdf::loadView('pdf.report-profit-loss', [
            'data'    => $data,
            'company' => $company,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Profit-Loss-Report.pdf');
    }

    public function expensesPdf(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();
        $company = BusinessEntity::where('is_active', true)->first();

        $query = Expense::with('category:id,name')
            ->whereBetween('date', [$from, $to]);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $expenses = $query->latest('date')->get();

        $totalAmount = $expenses->sum('amount');

        $categorySummary = $expenses->groupBy(fn($e) => $e->category?->name ?? 'Uncategorized')
            ->map(fn($group, $name) => ['category' => $name, 'total' => $group->sum('amount')])
            ->values()
            ->toArray();

        $categoryName = $request->filled('category_id')
            ? ExpensesCategory::find($request->category_id)?->name
            : null;

        $pdf = Pdf::loadView('pdf.report-expenses', [
            'expenses'        => $expenses,
            'totalAmount'     => $totalAmount,
            'categorySummary' => $categorySummary,
            'company'         => $company,
            'dateFrom'        => $from,
            'dateTo'          => $to,
            'categoryName'    => $categoryName,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Expenses-Report.pdf');
    }

    public function purchasesPdf(Request $request)
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();
        $company = BusinessEntity::where('is_active', true)->first();

        $query = Grn::with('supplier:id,name')
            ->whereBetween('received_date', [$from, $to]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $grns = $query->latest('received_date')->get();
        $totalAmount = $grns->sum('total_amount');

        $supplierName = $request->filled('supplier_id')
            ? Suppliers::find($request->supplier_id)?->name
            : null;

        $pdf = Pdf::loadView('pdf.report-purchases', [
            'grns'         => $grns,
            'totalAmount'  => $totalAmount,
            'company'      => $company,
            'dateFrom'     => $from,
            'dateTo'       => $to,
            'supplierName' => $supplierName,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('Purchases-Report.pdf');
    }
}
