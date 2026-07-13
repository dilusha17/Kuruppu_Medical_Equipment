<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Expenses Report</title>
    <style>
        @page { margin: 15mm; size: A4 portrait; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; line-height: 1.4; margin: 0; padding: 0; }
        .report-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .report-title { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .report-subtitle { font-size: 10pt; color: #555; margin: 5px 0 0 0; }
        .company-name { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0 0 3px 0; }
        .summary-bar { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .summary-bar td { padding: 8px 12px; border: 1px solid #ddd; }
        .summary-bar .lbl { font-size: 8pt; text-transform: uppercase; color: #777; }
        .summary-bar .val { font-size: 12pt; font-weight: bold; }
        .category-summary { width: 50%; margin-bottom: 15px; border-collapse: collapse; }
        .category-summary td { padding: 5px 8px; border-bottom: 1px solid #eee; }
        .category-summary .cat-name { font-weight: bold; }
        .data-tbl { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
        .data-tbl thead { display: table-header-group; }
        .data-tbl tr { page-break-inside: avoid; }
        .data-tbl th, .data-tbl td { padding: 7px 8px; border-bottom: 1px solid #ddd; text-align: left; }
        .data-tbl th { font-weight: bold; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.5px; border-top: 1px solid #000; border-bottom: 1px solid #000; }
        .data-tbl td.r, .data-tbl th.r { text-align: right; }
        .data-tbl tfoot td { border-top: 2px solid #000; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; border-top: 1px solid #000; padding-top: 8px; font-size: 7pt; }
        .footer-table { width: 100%; }
    </style>
</head>
<body>
    <div class="report-header">
        <p class="company-name">{{ $company->name ?? '' }}</p>
        <h1 class="report-title">Expenses Report</h1>
        <p class="report-subtitle">
            {{ \Carbon\Carbon::parse($dateFrom)->format('d M Y') }}
            &mdash;
            {{ \Carbon\Carbon::parse($dateTo)->format('d M Y') }}
            @if($categoryName) | Category: {{ $categoryName }} @endif
        </p>
    </div>

    <table class="summary-bar">
        <tr>
            <td><span class="lbl">Total Expenses</span><br><span class="val" style="color: #e67e22;">Rs. {{ number_format($totalAmount, 2) }}</span></td>
            <td><span class="lbl">Entries</span><br><span class="val">{{ $expenses->count() }}</span></td>
        </tr>
    </table>

    @if(count($categorySummary) > 0)
    <p style="font-weight: bold; font-size: 9pt; text-transform: uppercase; margin-bottom: 5px;">By Category</p>
    <table class="category-summary">
        @foreach($categorySummary as $cat)
        <tr>
            <td class="cat-name">{{ $cat['category'] }}</td>
            <td style="text-align: right;">Rs. {{ number_format($cat['total'], 2) }}</td>
        </tr>
        @endforeach
    </table>
    @endif

    <table class="data-tbl">
        <thead>
            <tr>
                <th style="width:5%">#</th>
                <th style="width:15%">Expense #</th>
                <th style="width:12%">Date</th>
                <th style="width:18%">Category</th>
                <th style="width:32%">Description</th>
                <th class="r" style="width:18%">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($expenses as $i => $exp)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $exp->expense_number }}</td>
                <td>{{ $exp->date }}</td>
                <td>{{ $exp->category?->name ?? '—' }}</td>
                <td>{{ $exp->description ?? '—' }}</td>
                <td class="r">{{ number_format($exp->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5">TOTAL</td>
                <td class="r">Rs. {{ number_format($totalAmount, 2) }}</td>
            </tr>
        </tfoot>
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
