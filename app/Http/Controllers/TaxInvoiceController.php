<?php

namespace App\Http\Controllers;

use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\BusinessEntity;
use App\Models\Invoice;
use App\Models\TaxInvoice;
use Barryvdh\DomPDF\Facade\Pdf;

class TaxInvoiceController extends Controller
{
    public function generatePdf(Request $request)
    {
        try {
            $invoiceId = $request->input('invoice_id');
            $invoice   = Invoice::with(['customer', 'items.stockBatch.product', 'paymentMethod'])->findOrFail($invoiceId);

            if ($invoice->is_vat_invoice_issued) {
                return response()->json(['message' => 'VAT Invoice already issued for this regular invoice.'], 400);
            }

            $customer    = $invoice->customer;
            $customerVat = DB::table('customers_vat_details')->where('customer_id', $customer->id)->first();

            $vatInvoiceNumber = $this->generateTaxInvoiceNumber(
                $request->input('from_date'),
                $invoice->invoice_date,
                $customerVat->nick_name ?? null
            );

            if (TaxInvoice::where('vat_invoice_number', $vatInvoiceNumber)->exists()) {
                return response()->json([
                    'message' => 'Generated tax invoice number already exists. Please retry.'
                ], 409);
            }

            $vatSetting    = DB::table('vat_percentage')
                ->where('from_date', '<=', $invoice->invoice_date)
                ->orderBy('from_date', 'desc')
                ->first();
            $vatPercentage = $vatSetting ? $vatSetting->vat_percentage : 18;

            $subTotal   = $invoice->sub_total;
            $vatAmount   = ($subTotal * $vatPercentage) / 100;
            $totalAmount = $subTotal + $vatAmount;

            $vatInvoice = TaxInvoice::create([
                'invoice_id'         => $invoice->id,
                'customer_id'        => $customer->id,
                'vat_invoice_number' => $vatInvoiceNumber,
                'vat_invoice_date'   => now()->toDateString(),
                'sub_total'          => $subTotal,
                'vat_percentage'     => $vatPercentage,
                'vat_amount'         => $vatAmount,
                'total_amount'       => $totalAmount,
            ]);

            $invoice->update(['is_vat_invoice_issued' => true]);

            return Pdf::loadView('pdf.tax-invoice', $this->buildViewData(
                $invoice, $vatInvoice, $customer, $customerVat,
                $totalAmount, $vatPercentage, $vatAmount, $subTotal
            ))->setPaper([0, 0, 684, 792], 'portrait')
                ->setOptions(['isPhpEnabled' => true])
                ->stream('TaxInvoice-' . $vatInvoiceNumber . '.pdf');
        } catch (QueryException $e) {
            // Unique constraint race: two requests generated the same number concurrently.
            if ((int) $e->getCode() === 23000) {
                return response()->json([
                    'message' => 'Generated tax invoice number already exists. Please retry.'
                ], 409);
            }
            return response()->json(['message' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function viewHistoryPdf(Request $request)
    {
        try {
            $id         = $request->input('id');
            $vatInvoice = TaxInvoice::with(['customer', 'invoice.items.stockBatch.product', 'invoice.paymentMethod'])->findOrFail($id);
            $invoice    = $vatInvoice->invoice;
            $customer   = $vatInvoice->customer;
            $customerVat = DB::table('customers_vat_details')->where('customer_id', $customer->id)->first();

            return Pdf::loadView('pdf.tax-invoice-history', $this->buildViewData(
                $invoice,
                $vatInvoice,
                $customer,
                $customerVat,
                $vatInvoice->total_amount,
                $vatInvoice->vat_percentage,
                $vatInvoice->vat_amount,
                $vatInvoice->sub_total
            ))->setPaper([0, 0, 684, 792], 'portrait')
                ->setOptions(['isPhpEnabled' => true])
                ->stream('TaxInvoice-' . $vatInvoice->vat_invoice_number . '.pdf');
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Format: {YY}{MON}_{NICK}_{SEQ} e.g. 26JUL_TAX_00014
     *
     * YY   - 2-digit year from $fromDate, falling back to $invoiceDate when $fromDate is empty.
     * MON  - 3-letter month abbreviation of $invoiceDate specifically (never $fromDate).
     * NICK - customer's nickname, or the literal "TAX" when the customer has none set.
     * SEQ  - 5-digit running counter, global across all clients: reset to 1 when the last
     *        generated number's year prefix differs from the current one, otherwise +1.
     */
    private function generateTaxInvoiceNumber(?string $fromDate, string $invoiceDate, ?string $nickName): string
    {
        $yearPrefix  = date('y', strtotime($fromDate ?: $invoiceDate));
        $monthPrefix = strtoupper(date('M', strtotime($invoiceDate)));
        $nick        = $nickName !== null && $nickName !== '' ? strtoupper($nickName) : 'TAX01';

        $lastInvoice = TaxInvoice::orderBy('id', 'desc')->first();
        $nextSeq     = 1;
        if ($lastInvoice) {
            $lastYearPrefix = substr($lastInvoice->vat_invoice_number, 0, 2);
            if ($lastYearPrefix === $yearPrefix) {
                $lastSeq = (int) substr($lastInvoice->vat_invoice_number, -5);
                $nextSeq = $lastSeq + 1;
            }
        }

        return sprintf('%s%s_%s_%05d', $yearPrefix, $monthPrefix, $nick, $nextSeq);
    }

    private function buildViewData($invoice, $vatInvoice, $customer, $customerVat, $totalAmount, $vatPercentage, $vatAmount, $subTotal): array
    {
        $entity = $invoice->businessEntity
            ?? BusinessEntity::query()->first();

        $records = $invoice->items->map(function ($item) use ($invoice) {
            $product       = $item->stockBatch?->product;
            $amountExclVat = $item->quantity * $item->unit_price;
            return [
                'refNo'         => $invoice->invoice_number,
                'invoiceItem'   => $product?->generic_name ?? 'N/A',
                'quantity'      => $item->quantity,
                'unitPrice'     => $item->unit_price,
                'amountExclVat' => $amountExclVat,
            ];
        })->toArray();

        return [
            'taxInvoiceNumber' => $vatInvoice->vat_invoice_number,
            'printedDateTime'  => $vatInvoice->vat_invoice_date,
            'companyVatNo'     => substr($entity?->vat_no ?? '', 0, 9),
            'companyName'      => $entity?->name ?? '',
            'companyAddress'   => $entity?->address ?? '',
            'companyPhone'     => $entity?->phone ?? '',
            'placeOfSupply'    => $entity?->place_of_supply ?? '',
            'clientVatNo'      => substr($customerVat?->vat_number ?? '', 0, 9),
            'clientName'       => $customerVat?->company_name ?? $customer->name,
            'clientAddress'    => $customerVat?->company_address ?? $customer->address ?? '',
            'clientPhone'      => $customerVat?->company_contact ?? $customer->contact_no ?? '',
            'poNumber'         => $invoice->po_number ?? null,
            'records'          => $records,
            'subtotal'         => $subTotal,
            'vatPercentage'    => $vatPercentage,
            'vatAmount'        => $vatAmount,
            'grandTotal'       => $totalAmount,
            'totalInWords'     => $this->convertNumberToWords((int) $totalAmount) . ' Rupees Only',
            'paymentMode'      => $invoice->paymentMethod?->name ?? 'N/A',
        ];
    }

    public function convertNumberToWords($number)
    {
        $ones  = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        $tens  = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        $teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if ($number == 0) {
            return 'Zero';
        }

        $words = '';

        if ($number >= 1000000000) {
            $words .= $this->convertNumberToWords(floor($number / 1000000000)) . ' Billion ';
            $number %= 1000000000;
        }
        if ($number >= 1000000) {
            $words .= $this->convertNumberToWords(floor($number / 1000000)) . ' Million ';
            $number %= 1000000;
        }
        if ($number >= 1000) {
            $words .= $this->convertNumberToWords(floor($number / 1000)) . ' Thousand ';
            $number %= 1000;
        }
        if ($number >= 100) {
            $words .= $ones[floor($number / 100)] . ' Hundred ';
            $number %= 100;
        }
        if ($number >= 20) {
            $tensDigit = floor($number / 10);
            $onesDigit = $number % 10;
            $words .= $tens[$tensDigit];
            if ($onesDigit > 0) {
                $words .= ' ' . $ones[$onesDigit];
            }
        } elseif ($number >= 10) {
            $words .= $teens[$number - 10];
        } elseif ($number > 0) {
            $words .= $ones[$number];
        }

        return trim($words);
    }
}
