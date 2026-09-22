<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusinessEntity;
use App\Models\Customers;
use App\Models\Invoice;
use App\Models\Grn;
use App\Models\TaxInvoice;
use App\Models\Expense;
use App\Models\ExpensesCategory;
use App\Models\Suppliers;
use App\Models\Receivable;
use App\Models\Payable;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
            $daysOverdue = (int) Carbon::parse($inv->invoice_date)->diffInDays(Carbon::now());

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

        // Cash-basis figures: actual money received/paid in the date range, not invoiced/billed totals.
        $revenue   = Receivable::whereBetween('dateTime', [$from, $to])->sum('amount');
        $purchases = Payable::whereBetween('dateTime', [$from, $to])->sum('amount');
        $expenses  = Expense::whereBetween('date', [$from, $to])->sum('paid_amount');

        $categorySummary = Expense::whereBetween('date', [$from, $to])
            ->selectRaw('category_id, SUM(paid_amount) as total')
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
        $company = BusinessEntity::query()->first();

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
                'days_overdue'   => (int) Carbon::parse($inv->invoice_date)->diffInDays(Carbon::now()),
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
        $company = BusinessEntity::query()->first();

        // Cash-basis figures: actual money received/paid in the date range, not invoiced/billed totals.
        $revenue   = Receivable::whereBetween('dateTime', [$from, $to])->sum('amount');
        $purchases = Payable::whereBetween('dateTime', [$from, $to])->sum('amount');
        $expenses  = Expense::whereBetween('date', [$from, $to])->sum('paid_amount');

        $categorySummary = Expense::whereBetween('date', [$from, $to])
            ->selectRaw('category_id, SUM(paid_amount) as total')
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
        $company = BusinessEntity::query()->first();

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
        $company = BusinessEntity::query()->first();

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

    // ── CSV Export Methods ──────────────────────────────────────────

    public function outstandingCsv(Request $request): StreamedResponse
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
            return [
                'invoice_number' => $inv->invoice_number,
                'invoice_date'   => $inv->invoice_date,
                'customer'       => $inv->customer?->name ?? 'Walk-in Customer',
                'grand_total'    => $inv->grand_total,
                'collected'      => $collected,
                'outstanding'    => $outstanding,
                'days_overdue'   => (int) Carbon::parse($inv->invoice_date)->diffInDays(Carbon::now()),
            ];
        })->filter(fn($i) => $i['outstanding'] > 0)->values();

        $filename = 'outstanding-report-' . now()->format('Y-m-d') . '.csv';

        return new StreamedResponse(function () use ($data) {
            $h = fopen('php://output', 'w');
            fwrite($h, "\xEF\xBB\xBF");
            fputcsv($h, ['#', 'Invoice #', 'Date', 'Customer', 'Total', 'Collected', 'Outstanding', 'Days Overdue']);

            foreach ($data as $i => $row) {
                fputcsv($h, [
                    $i + 1,
                    $row['invoice_number'],
                    $row['invoice_date'],
                    $row['customer'],
                    number_format($row['grand_total'], 2, '.', ''),
                    number_format($row['collected'], 2, '.', ''),
                    number_format($row['outstanding'], 2, '.', ''),
                    $row['days_overdue'],
                ]);
            }
            fputcsv($h, ['', '', '', 'TOTAL',
                number_format($data->sum('grand_total'), 2, '.', ''),
                number_format($data->sum('collected'), 2, '.', ''),
                number_format($data->sum('outstanding'), 2, '.', ''),
                '',
            ]);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    public function profitLossCsv(Request $request): StreamedResponse
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        // Cash-basis figures: actual money received/paid in the date range, not invoiced/billed totals.
        $revenue   = Receivable::whereBetween('dateTime', [$from, $to])->sum('amount');
        $purchases = Payable::whereBetween('dateTime', [$from, $to])->sum('amount');
        $expenses  = Expense::whereBetween('date', [$from, $to])->sum('paid_amount');
        $profit    = $revenue - $purchases - $expenses;

        $categorySummary = Expense::whereBetween('date', [$from, $to])
            ->selectRaw('category_id, SUM(paid_amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn($e) => [
                'category' => $e->category?->name ?? 'Uncategorized',
                'total'    => $e->total,
            ]);

        $filename = 'profit-loss-report-' . $from . '-to-' . $to . '.csv';

        return new StreamedResponse(function () use ($revenue, $purchases, $expenses, $categorySummary, $profit, $from, $to) {
            $h = fopen('php://output', 'w');
            fwrite($h, "\xEF\xBB\xBF");
            fputcsv($h, ['Profit & Loss Statement']);
            fputcsv($h, [$from . ' to ' . $to]);
            fputcsv($h, []);
            fputcsv($h, ['Revenue (Collected)', number_format($revenue, 2, '.', '')]);
            fputcsv($h, ['Purchases (Paid)', number_format($purchases, 2, '.', '')]);
            fputcsv($h, ['Expenses', number_format($expenses, 2, '.', '')]);
            foreach ($categorySummary as $cat) {
                fputcsv($h, ['  ' . $cat['category'], number_format($cat['total'], 2, '.', '')]);
            }
            fputcsv($h, []);
            fputcsv($h, ['Net Profit / (Loss)', number_format($profit, 2, '.', '')]);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    public function expensesCsv(Request $request): StreamedResponse
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        $query = Expense::with('category:id,name')
            ->whereBetween('date', [$from, $to]);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $expenses    = $query->latest('date')->get();
        $totalAmount = $expenses->sum('amount');

        $filename = 'expenses-report-' . $from . '-to-' . $to . '.csv';

        return new StreamedResponse(function () use ($expenses, $totalAmount) {
            $h = fopen('php://output', 'w');
            fwrite($h, "\xEF\xBB\xBF");
            fputcsv($h, ['#', 'Expense #', 'Date', 'Category', 'Description', 'Amount']);

            foreach ($expenses as $i => $exp) {
                fputcsv($h, [
                    $i + 1,
                    $exp->expense_number,
                    $exp->date,
                    $exp->category?->name ?? 'Uncategorized',
                    $exp->description,
                    number_format($exp->amount, 2, '.', ''),
                ]);
            }
            fputcsv($h, ['', '', '', '', 'TOTAL', number_format($totalAmount, 2, '.', '')]);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    public function purchasesCsv(Request $request): StreamedResponse
    {
        $from = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $to   = $request->date_to   ?? Carbon::now()->endOfMonth()->toDateString();

        $query = Grn::with('supplier:id,name')
            ->whereBetween('received_date', [$from, $to]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $grns        = $query->latest('received_date')->get();
        $totalAmount = $grns->sum('total_amount');

        $filename = 'purchases-report-' . $from . '-to-' . $to . '.csv';

        return new StreamedResponse(function () use ($grns, $totalAmount) {
            $h = fopen('php://output', 'w');
            fwrite($h, "\xEF\xBB\xBF");
            fputcsv($h, ['#', 'GRN #', 'Date', 'Supplier', 'Tax Invoice No.', 'Amount', 'Status']);

            foreach ($grns as $i => $grn) {
                fputcsv($h, [
                    $i + 1,
                    $grn->grn_number,
                    // received_date is date-cast (Carbon instance), so format explicitly —
                    // letting fputcsv stringify it would fall back to Carbon's full datetime string.
                    $grn->received_date?->format('Y-m-d'),
                    $grn->supplier?->name ?? '—',
                    $grn->supplier_invoice_no ?: '—',
                    number_format($grn->total_amount, 2, '.', ''),
                    strtoupper($grn->payment_status ?? 'UNPAID'),
                ]);
            }
            fputcsv($h, ['', '', '', '', 'TOTAL', number_format($totalAmount, 2, '.', ''), '']);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    // ── Invoice Summary (Output Tax) ──────────────────────────────────

    public function invoiceSummary(Request $request)
    {
        $request->validate([
            'date_from'   => 'required|date',
            'date_to'     => 'required|date|after_or_equal:date_from',
            'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('is_vat', 1)],
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $query = $this->buildInvoiceSummaryQuery($from, $to, $request->customer_id);

        $totals = DB::query()->fromSub($query, 'combined')
            ->selectRaw('SUM(sub_total) AS sum_net, SUM(vat_amount) AS sum_vat')
            ->first();

        $records = $query->orderByDesc('vat_invoice_date')
            ->orderByDesc('vat_invoice_number')
            ->paginate(50);

        $page   = $records->currentPage();
        $perPage = $records->perPage();

        $records->getCollection()->transform(function ($row, $index) use ($page, $perPage) {
            return $this->mapInvoiceSummaryRow($row, ($page - 1) * $perPage, $index);
        });

        return response()->json([
            'records' => $records,
            'totals'  => [
                'sum_net' => round((float) $totals->sum_net, 2),
                'sum_vat' => round((float) $totals->sum_vat, 2),
            ],
        ]);
    }

    public function invoiceSummaryCsv(Request $request): StreamedResponse
    {
        $request->validate([
            'date_from'   => 'required|date',
            'date_to'     => 'required|date|after_or_equal:date_from',
            'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('is_vat', 1)],
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $rows = $this->buildInvoiceSummaryQuery($from, $to, $request->customer_id)
            ->orderBy('vat_invoice_date')
            ->orderBy('vat_invoice_number')
            ->get();

        $filename = 'invoice-summary-' . $request->date_from . '-to-' . $request->date_to . '.csv';

        return new StreamedResponse(function () use ($rows) {
            $h = fopen('php://output', 'w');
            fputcsv($h, ['#', 'Invoice Date', 'Tax Invoice No', "Purchaser's TIN",
                         'Name of the Purchaser', 'Value of Supply', 'VAT Amount']);

            $sumNet = $sumVat = 0.0;
            foreach ($rows as $i => $row) {
                $mapped = $this->mapInvoiceSummaryRow($row, 0, $i);
                $sumNet += (float) $row->sub_total;
                $sumVat += (float) $row->vat_amount;
                fputcsv($h, [
                    $mapped['serial_no'],
                    $mapped['invoice_date'],
                    $mapped['tax_invoice_no'],
                    $mapped['tin'],
                    $mapped['purchaser_name'],
                    number_format($row->sub_total, 2, '.', ''),
                    number_format($row->vat_amount, 2, '.', ''),
                ]);
            }
            fputcsv($h, ['', '', '', '', '', number_format($sumNet, 2, '.', ''), number_format($sumVat, 2, '.', '')]);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    private function buildInvoiceSummaryQuery(Carbon $from, Carbon $to, $customerId = null)
    {
        $query = TaxInvoice::query()
            ->with(['customer.vatDetail'])
            ->whereBetween('vat_invoice_date', [$from, $to]);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        return $query;
    }

    private function mapInvoiceSummaryRow($row, int $offset, int $index): array
    {
        $vatDetail = $row->customer?->vatDetail;
        $vatNumber = $vatDetail?->vat_number;
        $tin       = $vatNumber ? substr($vatNumber, 0, 9) : '';
        $name      = $vatDetail?->company_name ?: ($row->customer?->name ?? '—');

        return [
            'id'              => $row->id,
            'serial_no'       => $offset + $index + 1,
            'invoice_date'    => Carbon::parse($row->vat_invoice_date)->format('Y-m-d'),
            'tax_invoice_no'  => $row->vat_invoice_number,
            'tin'             => $tin,
            'purchaser_name'  => $name,
            'net_amount'      => round((float) $row->sub_total, 2),
            'vat_amount'      => round((float) $row->vat_amount, 2),
        ];
    }

    // ── Purchase Summary (Input Tax) ──────────────────────────────────

    public function purchaseSummary(Request $request)
    {
        $request->validate([
            'date_from'    => 'required|date',
            'date_to'      => 'required|date|after_or_equal:date_from',
            'supplier_id'  => ['nullable', 'integer', Rule::exists('suppliers', 'id')->where('is_vat', 1)],
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $query = $this->buildPurchaseSummaryQuery($from, $to, $request->supplier_id);

        $totals = DB::query()->fromSub($query->toBase(), 'combined')
            ->selectRaw('SUM(sub_total) AS sum_net, SUM(vat_amount) AS sum_vat')
            ->first();

        $records = $this->buildPurchaseSummaryQuery($from, $to, $request->supplier_id)
            ->orderBy('received_date')
            ->orderBy('grn_number')
            ->paginate(50);

        $page    = $records->currentPage();
        $perPage = $records->perPage();

        $records->getCollection()->transform(function ($row, $index) use ($page, $perPage) {
            return $this->mapPurchaseSummaryRow($row, ($page - 1) * $perPage, $index);
        });

        return response()->json([
            'records' => $records,
            'totals'  => [
                'sum_net' => round((float) $totals->sum_net, 2),
                'sum_vat' => round((float) $totals->sum_vat, 2),
            ],
        ]);
    }

    public function purchaseSummaryCsv(Request $request): StreamedResponse
    {
        $request->validate([
            'date_from'    => 'required|date',
            'date_to'      => 'required|date|after_or_equal:date_from',
            'supplier_id'  => ['nullable', 'integer', Rule::exists('suppliers', 'id')->where('is_vat', 1)],
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $rows = $this->buildPurchaseSummaryQuery($from, $to, $request->supplier_id)
            ->orderBy('received_date')
            ->orderBy('grn_number')
            ->get();

        $filename = 'purchase-summary-' . $request->date_from . '-to-' . $request->date_to . '.csv';

        return new StreamedResponse(function () use ($rows) {
            $h = fopen('php://output', 'w');
            fputcsv($h, ['#', 'Date', 'Tax Invoice No.', "Supplier's TIN",
                         'Name of the Supplier', 'Value of Purchase', 'VAT Amount']);

            $sumNet = $sumVat = 0.0;
            foreach ($rows as $i => $row) {
                $mapped = $this->mapPurchaseSummaryRow($row, 0, $i);
                $sumNet += (float) $row->sub_total;
                $sumVat += (float) $row->vat_amount;
                fputcsv($h, [
                    $mapped['serial_no'],
                    $mapped['date'],
                    $mapped['supplier_invoice_no'],
                    $mapped['tin'],
                    $mapped['supplier_name'],
                    number_format($row->sub_total, 2, '.', ''),
                    number_format($row->vat_amount, 2, '.', ''),
                ]);
            }
            fputcsv($h, ['', '', '', '', '', number_format($sumNet, 2, '.', ''), number_format($sumVat, 2, '.', '')]);
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    private function buildPurchaseSummaryQuery(Carbon $from, Carbon $to, $supplierId = null)
    {
        $query = Grn::query()
            ->with(['supplier.vatDetail'])
            ->where('is_vat', true)
            ->whereBetween('received_date', [$from, $to]);

        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }

        return $query;
    }

    private function mapPurchaseSummaryRow($row, int $offset, int $index): array
    {
        $vatDetail = $row->supplier?->vatDetail;
        $vatNumber = $vatDetail?->vat_number;
        $tin       = $vatNumber ? substr($vatNumber, 0, 9) : '';
        $name      = $vatDetail?->company_name ?: ($row->supplier?->name ?? '—');

        return [
            'id'                  => $row->id,
            'serial_no'           => $offset + $index + 1,
            'date'                => Carbon::parse($row->received_date)->format('Y-m-d'),
            'supplier_invoice_no' => $row->supplier_invoice_no ?: $row->grn_number,
            'tin'                 => $tin,
            'supplier_name'       => $name,
            'net_amount'          => round((float) $row->sub_total, 2),
            'vat_amount'          => round((float) $row->vat_amount, 2),
        ];
    }

    // ── Sales Report ───────────────────────────────────────────────────

    public function sales(Request $request)
    {
        $request->validate([
            'date_from'          => 'required|date',
            'date_to'            => 'required|date|after_or_equal:date_from',
            'business_entity_id' => 'nullable|integer|exists:business_entities,id',
            'customer_id'        => 'nullable|integer|exists:customers,id',
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $records = $this->buildSalesQuery($request, $from, $to)
            ->orderByDesc('invoice_date')
            ->orderByDesc('invoice_number')
            ->paginate(50);

        $page    = $records->currentPage();
        $perPage = $records->perPage();

        $records->getCollection()->transform(function ($row, $index) use ($page, $perPage) {
            return $this->mapSalesRow($row, ($page - 1) * $perPage, $index);
        });

        return response()->json([
            'records' => $records,
            'totals'  => $this->salesTotals($request, $from, $to),
        ]);
    }

    public function salesCsv(Request $request): StreamedResponse
    {
        $request->validate([
            'date_from'          => 'required|date',
            'date_to'            => 'required|date|after_or_equal:date_from',
            'business_entity_id' => 'nullable|integer|exists:business_entities,id',
            'customer_id'        => 'nullable|integer|exists:customers,id',
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $rows = $this->buildSalesQuery($request, $from, $to)
            ->orderBy('invoice_date')
            ->orderBy('invoice_number')
            ->get();

        $filename = 'sales-report-' . $request->date_from . '-to-' . $request->date_to . '.csv';
        $sumKeys  = ['sub_total', 'discount', 'vat', 'grand_total', 'credited', 'collected', 'balance'];

        return new StreamedResponse(function () use ($rows, $sumKeys) {
            $h = fopen('php://output', 'w');
            fwrite($h, "\xEF\xBB\xBF");
            fputcsv($h, ['#', 'Date', 'Invoice No', 'Customer', 'Business Entity', 'Sub Total',
                         'Discount', 'VAT', 'Grand Total', 'Credited', 'Collected', 'Balance', 'Status']);

            $sums = array_fill_keys($sumKeys, 0.0);
            foreach ($rows as $i => $row) {
                $mapped = $this->mapSalesRow($row, 0, $i);
                foreach ($sumKeys as $key) {
                    $sums[$key] += $mapped[$key];
                }
                fputcsv($h, [
                    $mapped['serial_no'],
                    $mapped['invoice_date'],
                    $mapped['invoice_number'],
                    $mapped['customer_name'],
                    $mapped['business_entity'],
                    number_format($mapped['sub_total'], 2, '.', ''),
                    number_format($mapped['discount'], 2, '.', ''),
                    number_format($mapped['vat'], 2, '.', ''),
                    number_format($mapped['grand_total'], 2, '.', ''),
                    number_format($mapped['credited'], 2, '.', ''),
                    number_format($mapped['collected'], 2, '.', ''),
                    number_format($mapped['balance'], 2, '.', ''),
                    ucfirst($mapped['status']),
                ]);
            }
            fputcsv($h, array_merge(['', '', '', '', ''], array_map(
                fn($key) => number_format($sums[$key], 2, '.', ''),
                $sumKeys
            ), ['']));
            fclose($h);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ]);
    }

    public function salesPdf(Request $request)
    {
        $request->validate([
            'date_from'          => 'required|date',
            'date_to'            => 'required|date|after_or_equal:date_from',
            'business_entity_id' => 'nullable|integer|exists:business_entities,id',
            'customer_id'        => 'nullable|integer|exists:customers,id',
        ]);

        $from = Carbon::parse($request->date_from)->startOfDay();
        $to   = Carbon::parse($request->date_to)->endOfDay();

        $rows = $this->buildSalesQuery($request, $from, $to)
            ->orderBy('invoice_date')
            ->orderBy('invoice_number')
            ->get()
            ->values()
            ->map(fn($row, $i) => $this->mapSalesRow($row, 0, $i));

        $company = $request->filled('business_entity_id')
            ? BusinessEntity::find($request->business_entity_id)
            : BusinessEntity::query()->first();

        $entityName = $request->filled('business_entity_id') ? $company?->name : null;
        $customerName = $request->filled('customer_id')
            ? Customers::find($request->customer_id)?->name
            : null;

        $pdf = Pdf::loadView('pdf.report-sales', [
            'rows'         => $rows,
            'totals'       => $this->salesTotals($request, $from, $to),
            'company'      => $company,
            'dateFrom'     => $request->date_from,
            'dateTo'       => $request->date_to,
            'entityName'   => $entityName,
            'customerName' => $customerName,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('Sales-Report.pdf');
    }

    private function buildSalesQuery(Request $request, Carbon $from, Carbon $to)
    {
        $query = Invoice::query()
            ->with(['customer.vatDetail', 'businessEntity'])
            ->withSum('receivables as collected_sum', 'amount')
            ->withSum('creditNotes as credited_sum', 'grand_total')
            ->whereBetween('invoice_date', [$from, $to]);

        if ($request->filled('business_entity_id')) {
            $query->where('business_entity_id', $request->business_entity_id);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        return $query;
    }

    private function salesTotals(Request $request, Carbon $from, Carbon $to): array
    {
        $rows = $this->buildSalesQuery($request, $from, $to)->get();

        $sumKeys = ['sub_total', 'discount', 'vat', 'grand_total', 'credited', 'collected', 'balance'];
        $sums    = array_fill_keys($sumKeys, 0.0);

        foreach ($rows as $row) {
            $mapped = $this->mapSalesRow($row, 0, 0);
            foreach ($sumKeys as $key) {
                $sums[$key] += $mapped[$key];
            }
        }

        $sums['count'] = $rows->count();

        return $sums;
    }

    private function mapSalesRow($row, int $offset, int $index): array
    {
        $vatDetail    = $row->customer?->vatDetail;
        $customerName = $vatDetail?->company_name ?: ($row->customer?->name ?? 'Walk-in Customer');

        $subTotal   = (float) $row->sub_total;
        $discount   = (float) $row->discount;
        $grandTotal = (float) $row->grand_total;
        $vat        = round($grandTotal - ($subTotal - $discount), 2);
        $credited   = round((float) ($row->credited_sum ?? 0), 2);
        $collected  = round((float) ($row->collected_sum ?? 0), 2);
        $balance    = max(0, round($grandTotal - $credited - $collected, 2));

        return [
            'id'              => $row->id,
            'serial_no'       => $offset + $index + 1,
            'invoice_date'    => Carbon::parse($row->invoice_date)->format('Y-m-d'),
            'invoice_number'  => $row->invoice_number,
            'customer_name'   => $customerName,
            'business_entity' => $row->businessEntity?->name ?? '—',
            'sub_total'       => round($subTotal, 2),
            'discount'        => round($discount, 2),
            'vat'             => $vat,
            'grand_total'     => round($grandTotal, 2),
            'credited'        => $credited,
            'collected'       => $collected,
            'balance'         => $balance,
            'status'          => $row->status,
        ];
    }
}
