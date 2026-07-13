<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Cash Flow Report</title>
    <style>
        @page { margin: 12mm; size: A4 landscape; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 8pt; color: #000; line-height: 1.4; margin: 0; padding: 0; }
        .report-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .report-title { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .report-subtitle { font-size: 10pt; color: #555; margin: 5px 0 0 0; }
        .company-name { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0 0 3px 0; }
        .summary-bar { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .summary-bar td { padding: 8px 10px; border: 1px solid #ddd; }
        .summary-bar .lbl { font-size: 7pt; text-transform: uppercase; color: #777; }
        .summary-bar .val { font-size: 11pt; font-weight: bold; }
        .totals-bar { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .totals-bar td { padding: 10px 12px; border: 2px solid #333; text-align: center; }
        .section-title { font-size: 10pt; font-weight: bold; text-transform: uppercase; margin: 15px 0 8px 0; padding-bottom: 3px; border-bottom: 1px solid #999; }
        .data-tbl { width: 100%; border-collapse: collapse; margin-bottom: 15px; page-break-inside: auto; }
        .data-tbl thead { display: table-header-group; }
        .data-tbl tr { page-break-inside: avoid; }
        .data-tbl th, .data-tbl td { padding: 4px 6px; border-bottom: 1px solid #ddd; text-align: left; }
        .data-tbl th { font-weight: bold; text-transform: uppercase; font-size: 7pt; letter-spacing: 0.5px; border-top: 1px solid #000; border-bottom: 1px solid #000; }
        .data-tbl td.r, .data-tbl th.r { text-align: right; }
        .data-tbl tfoot td { border-top: 2px solid #000; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; border-top: 1px solid #000; padding-top: 8px; font-size: 7pt; }
        .footer-table { width: 100%; }
        .in { color: #2e7d32; }
        .out { color: #c62828; }
    </style>
</head>
<body>
    <div class="report-header">
        <p class="company-name">{{ $company->name ?? '' }}</p>
        <h1 class="report-title">Cash Flow Report</h1>
        <p class="report-subtitle">
            {{ \Carbon\Carbon::parse($dateFrom)->format('d M Y') }}
            &mdash;
            {{ \Carbon\Carbon::parse($dateTo)->format('d M Y') }}
            @if($accountName) | Account: {{ $accountName }} @endif
        </p>
    </div>

    {{-- Grand Totals --}}
    <table class="totals-bar">
        <tr>
            <td>
                <span class="lbl" style="font-size:7pt;text-transform:uppercase;color:#777;">Total Inflow</span><br>
                <span class="val in" style="font-size:14pt;font-weight:bold;">Rs. {{ number_format($totalInflow, 2) }}</span>
            </td>
            <td>
                <span class="lbl" style="font-size:7pt;text-transform:uppercase;color:#777;">Total Outflow</span><br>
                <span class="val out" style="font-size:14pt;font-weight:bold;">Rs. {{ number_format($totalOutflow, 2) }}</span>
            </td>
            <td>
                <span class="lbl" style="font-size:7pt;text-transform:uppercase;color:#777;">Net Cash Flow</span><br>
                <span style="font-size:14pt;font-weight:bold;color:{{ $netFlow >= 0 ? '#2e7d32' : '#c62828' }};">Rs. {{ number_format($netFlow, 2) }}</span>
            </td>
        </tr>
    </table>

    {{-- Account Summary --}}
    @if(count($accountSummaries) > 0)
    <table class="summary-bar">
        <tr>
            @foreach($accountSummaries as $acc)
            <td>
                <span class="lbl">{{ $acc['name'] }} ({{ ucfirst($acc['type']) }})</span><br>
                <span style="font-size:8pt;">In: <span class="in">Rs. {{ number_format($acc['inflow'], 2) }}</span></span><br>
                <span style="font-size:8pt;">Out: <span class="out">Rs. {{ number_format($acc['outflow'], 2) }}</span></span><br>
                <span class="val" style="color:{{ $acc['balance'] >= 0 ? '#2e7d32' : '#c62828' }};">Rs. {{ number_format($acc['balance'], 2) }}</span>
            </td>
            @endforeach
        </tr>
    </table>
    @endif

    {{-- Inflow Table --}}
    <p class="section-title in">Inflow — Payments Received</p>
    <table class="data-tbl">
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th style="width:12%">Date</th>
                <th style="width:14%">Invoice #</th>
                <th style="width:20%">Customer</th>
                <th style="width:16%">Deposit Account</th>
                <th style="width:16%">Reference</th>
                <th class="r" style="width:18%">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($inflows as $i => $r)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($r->dateTime)->format('d M Y') }}</td>
                <td>{{ $r->invoice?->invoice_number ?? '—' }}</td>
                <td>{{ $r->invoice?->customer?->name ?? 'Walk-in' }}</td>
                <td>{{ $r->depositAccount?->name ?? 'Unassigned' }}</td>
                <td>{{ $r->reference_no ?? '—' }}</td>
                <td class="r in">{{ number_format($r->amount, 2) }}</td>
            </tr>
            @empty
            <tr><td colspan="7" style="text-align:center;padding:10px;color:#999;">No inflow records.</td></tr>
            @endforelse
        </tbody>
        @if($inflows->count() > 0)
        <tfoot>
            <tr>
                <td colspan="6">TOTAL INFLOW</td>
                <td class="r in">Rs. {{ number_format($totalInflow, 2) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    {{-- Outflow: Expenses --}}
    <p class="section-title out">Outflow — Expenses</p>
    <table class="data-tbl">
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th style="width:12%">Date</th>
                <th style="width:14%">Expense #</th>
                <th style="width:20%">Description</th>
                <th style="width:14%">Category</th>
                <th style="width:16%">Paid From</th>
                <th class="r" style="width:20%">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expOutflows as $i => $e)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($e->date)->format('d M Y') }}</td>
                <td>{{ $e->expense_number }}</td>
                <td>{{ $e->description }}</td>
                <td>{{ $e->category?->name ?? '—' }}</td>
                <td>{{ $e->depositAccount?->name ?? 'Unassigned' }}</td>
                <td class="r out">{{ number_format($e->amount, 2) }}</td>
            </tr>
            @empty
            <tr><td colspan="7" style="text-align:center;padding:10px;color:#999;">No expense records.</td></tr>
            @endforelse
        </tbody>
        @if($expOutflows->count() > 0)
        <tfoot>
            <tr>
                <td colspan="6">TOTAL EXPENSES</td>
                <td class="r out">Rs. {{ number_format($expOutflows->sum('amount'), 2) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    {{-- Outflow: GRN Payments --}}
    <p class="section-title out">Outflow — Supplier Payments (GRN)</p>
    <table class="data-tbl">
        <thead>
            <tr>
                <th style="width:4%">#</th>
                <th style="width:12%">Date</th>
                <th style="width:14%">GRN #</th>
                <th style="width:22%">Supplier</th>
                <th style="width:16%">Paid From</th>
                <th style="width:14%">Note</th>
                <th class="r" style="width:18%">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payOutflows as $i => $p)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($p->dateTime)->format('d M Y') }}</td>
                <td>{{ $p->grn?->grn_number ?? '—' }}</td>
                <td>{{ $p->grn?->supplier?->name ?? '—' }}</td>
                <td>{{ $p->depositAccount?->name ?? 'Unassigned' }}</td>
                <td>{{ $p->note ?? '—' }}</td>
                <td class="r out">{{ number_format($p->amount, 2) }}</td>
            </tr>
            @empty
            <tr><td colspan="7" style="text-align:center;padding:10px;color:#999;">No supplier payment records.</td></tr>
            @endforelse
        </tbody>
        @if($payOutflows->count() > 0)
        <tfoot>
            <tr>
                <td colspan="6">TOTAL SUPPLIER PAYMENTS</td>
                <td class="r out">Rs. {{ number_format($payOutflows->sum('amount'), 2) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div class="footer">
        <table class="footer-table">
            <tr>
                <td style="text-align: left;">POWERED BY: DE CREATIONS&reg; | decreations.lk | 0703004483</td>
                <td style="text-align: right;">Generated: {{ \Carbon\Carbon::now()->format('d M Y H:i') }}</td>
            </tr>
        </table>
    </div>
</body>
</html>
