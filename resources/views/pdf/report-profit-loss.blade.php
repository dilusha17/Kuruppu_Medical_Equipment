<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Profit & Loss Report</title>
    <style>
        @page { margin: 15mm; size: A4 portrait; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; line-height: 1.5; margin: 0; padding: 0; }
        .report-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .report-title { font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .report-subtitle { font-size: 10pt; color: #555; margin: 5px 0 0 0; }
        .company-name { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0 0 3px 0; }
        .statement { width: 60%; margin: 0 auto; }
        .statement-tbl { width: 100%; border-collapse: collapse; }
        .statement-tbl td { padding: 10px 12px; }
        .statement-tbl .lbl { font-weight: bold; font-size: 11pt; }
        .statement-tbl .amt { text-align: right; font-size: 11pt; }
        .statement-tbl .section-head { font-weight: bold; text-transform: uppercase; font-size: 9pt; letter-spacing: 1px; color: #555; border-bottom: 1px solid #000; padding-top: 20px; }
        .statement-tbl .sub-item { padding-left: 30px; font-size: 9pt; color: #555; }
        .statement-tbl .sub-item td { padding: 4px 12px; }
        .statement-tbl .grand-total { border-top: 3px double #000; }
        .statement-tbl .grand-total td { padding-top: 15px; font-size: 14pt; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; border-top: 1px solid #000; padding-top: 8px; font-size: 7pt; }
        .footer-table { width: 100%; }
    </style>
</head>
<body>
    <div class="report-header">
        <p class="company-name">{{ $company->name ?? '' }}</p>
        <h1 class="report-title">Profit & Loss Statement</h1>
        <p class="report-subtitle">
            {{ \Carbon\Carbon::parse($data['date_from'])->format('d M Y') }}
            &mdash;
            {{ \Carbon\Carbon::parse($data['date_to'])->format('d M Y') }}
        </p>
    </div>

    <div class="statement">
        <table class="statement-tbl">
            <tr>
                <td class="section-head" colspan="2">Revenue</td>
            </tr>
            <tr>
                <td class="lbl">Invoice Revenue</td>
                <td class="amt" style="color: #27ae60;">Rs. {{ number_format($data['revenue'], 2) }}</td>
            </tr>

            <tr>
                <td class="section-head" colspan="2">Less: Cost of Goods</td>
            </tr>
            <tr>
                <td class="lbl">Purchases (GRNs)</td>
                <td class="amt">Rs. {{ number_format($data['purchases'], 2) }}</td>
            </tr>

            <tr>
                <td class="section-head" colspan="2">Less: Operating Expenses</td>
            </tr>
            <tr>
                <td class="lbl">Total Expenses</td>
                <td class="amt">Rs. {{ number_format($data['expenses'], 2) }}</td>
            </tr>
            @foreach($data['expense_breakdown'] as $cat)
            <tr class="sub-item">
                <td>{{ $cat['category'] }}</td>
                <td class="amt">Rs. {{ number_format($cat['total'], 2) }}</td>
            </tr>
            @endforeach

            <tr class="grand-total">
                <td class="lbl">Net Profit / (Loss)</td>
                <td class="amt" style="color: {{ $data['profit'] >= 0 ? '#27ae60' : '#c0392b' }};">
                    Rs. {{ number_format($data['profit'], 2) }}
                </td>
            </tr>
        </table>
    </div>

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
