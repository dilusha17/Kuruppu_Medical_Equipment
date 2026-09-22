<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Sales Report</title>
    <style>
        @page { margin: 15mm; size: A4 landscape; }
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
        .data-tbl { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
        .data-tbl thead { display: table-header-group; }
        .data-tbl tr { page-break-inside: avoid; }
        .data-tbl th, .data-tbl td { padding: 6px 7px; border-bottom: 1px solid #ddd; text-align: left; }
        .data-tbl th { font-weight: bold; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.5px; border-top: 1px solid #000; border-bottom: 1px solid #000; }
        .data-tbl td.r, .data-tbl th.r { text-align: right; }
        .data-tbl tfoot td { border-top: 2px solid #000; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; border-top: 1px solid #000; padding-top: 8px; font-size: 7pt; }
        .footer-table { width: 100%; }
    </style>
</head>
<body>
    <div class="report-header">
        <p class="company-name">{{ $company->name ?? '' }}</p>
        <h1 class="report-title">Sales Report</h1>
        <p class="report-subtitle">
            {{ \Carbon\Carbon::parse($dateFrom)->format('d M Y') }}
            &mdash;
            {{ \Carbon\Carbon::parse($dateTo)->format('d M Y') }}
            @if($entityName) | Entity: {{ $entityName }} @else | All Entities @endif
            @if($customerName) | Customer: {{ $customerName }} @endif
        </p>
    </div>

    <table class="summary-bar">
        <tr>
            <td><span class="lbl">Invoices</span><br><span class="val">{{ $totals['count'] }}</span></td>
            <td><span class="lbl">Total Sales</span><br><span class="val" style="color: #27ae60;">Rs. {{ number_format($totals['grand_total'], 2) }}</span></td>
            <td><span class="lbl">Total Collected</span><br><span class="val" style="color: #2980b9;">Rs. {{ number_format($totals['collected'], 2) }}</span></td>
            <td><span class="lbl">Total Outstanding</span><br><span class="val" style="color: #c0392b;">Rs. {{ number_format($totals['balance'], 2) }}</span></td>
        </tr>
    </table>

    <table class="data-tbl">
        <thead>
            <tr>
                <th style="width:3%">#</th>
                <th style="width:8%">Date</th>
                <th style="width:10%">Invoice #</th>
                <th style="width:16%">Customer</th>
                <th style="width:13%">Entity</th>
                <th class="r" style="width:9%">Sub Total</th>
                <th class="r" style="width:8%">Discount</th>
                <th class="r" style="width:8%">VAT</th>
                <th class="r" style="width:9%">Grand Total</th>
                <th class="r" style="width:8%">Credited</th>
                <th class="r" style="width:8%">Balance</th>
                <th style="width:8%">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
            <tr>
                <td>{{ $row['serial_no'] }}</td>
                <td>{{ $row['invoice_date'] }}</td>
                <td>{{ $row['invoice_number'] }}</td>
                <td>{{ $row['customer_name'] }}</td>
                <td>{{ $row['business_entity'] }}</td>
                <td class="r">{{ number_format($row['sub_total'], 2) }}</td>
                <td class="r">{{ number_format($row['discount'], 2) }}</td>
                <td class="r">{{ number_format($row['vat'], 2) }}</td>
                <td class="r">{{ number_format($row['grand_total'], 2) }}</td>
                <td class="r">{{ number_format($row['credited'], 2) }}</td>
                <td class="r">{{ number_format($row['balance'], 2) }}</td>
                <td>{{ strtoupper($row['status']) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5">TOTAL</td>
                <td class="r">{{ number_format($totals['sub_total'], 2) }}</td>
                <td class="r">{{ number_format($totals['discount'], 2) }}</td>
                <td class="r">{{ number_format($totals['vat'], 2) }}</td>
                <td class="r">{{ number_format($totals['grand_total'], 2) }}</td>
                <td class="r">{{ number_format($totals['credited'], 2) }}</td>
                <td class="r">{{ number_format($totals['balance'], 2) }}</td>
                <td></td>
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
