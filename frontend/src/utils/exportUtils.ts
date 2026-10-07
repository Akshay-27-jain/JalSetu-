import type { MeterReading, Invoice } from '../types';

/**
 * Export Meter Readings to a CSV file and trigger browser download
 */
export function exportMeterReadingsToCsv(readings: MeterReading[], flatNumber: string) {
  if (!readings || readings.length === 0) {
    alert('No meter readings available to export.');
    return;
  }

  const headers = ['Log ID', 'Reading Date', 'Flat Number', 'Meter Serial', 'Meter Reading (kL)', 'Consumption (kL)', 'Source', 'Status'];
  const rows = readings.map((r) => [
    `LOG-${r.id}`,
    r.readingDate,
    r.flatNumber || flatNumber,
    r.meterSerialNumber || 'N/A',
    r.meterReadingKl,
    r.consumptionKl,
    r.source,
    r.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.map((cell) => `"${cell}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Water_Usage_Log_Flat_${flatNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and trigger download of printable Statement / Invoice
 */
export function printInvoiceStatement(invoice: Invoice) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Water Utility Invoice - ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 800; color: #0284c7; }
    .invoice-title { font-size: 20px; font-weight: bold; text-align: right; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .card { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .card-title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 5px; }
    .card-value { font-size: 15px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; font-weight: bold; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .text-right { text-align: right; }
    .total-row { font-weight: bold; font-size: 16px; background: #f0f9ff; color: #0284c7; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-paid { background: #dcfce7; color: #15803d; }
    .status-pending { background: #fef3c7; color: #b45309; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">💧 JalSetu Smart Water</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Smart Water Management & Metering System</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div style="font-size: 12px; font-family: monospace; margin-top: 4px;">#${invoice.invoiceNumber}</div>
      <div style="margin-top: 6px;">
        <span class="status-badge ${invoice.status === 'PAID' ? 'status-paid' : 'status-pending'}">
          ${invoice.status === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
        </span>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Billed To</div>
      <div class="card-value">Flat ${invoice.flatNumber}</div>
      <div style="font-size: 13px; color: #475569; margin-top: 2px;">${invoice.residentName || 'Resident'}</div>
      <div style="font-size: 12px; color: #64748b;">${invoice.residentEmail || ''}</div>
      <div style="font-size: 12px; color: #0284c7; margin-top: 4px; font-weight: bold;">Meter No: ${invoice.meterSerialNumber || 'WM-' + invoice.flatNumber}</div>
    </div>
    <div class="card">
      <div class="card-title">Invoice Details</div>
      <div style="font-size: 13px;"><strong>Billing Month:</strong> ${invoice.billingMonth}</div>
      <div style="font-size: 13px;"><strong>Meter Serial No:</strong> <span style="font-family: monospace; color: #0284c7; font-weight: bold;">${invoice.meterSerialNumber || 'WM-' + invoice.flatNumber}</span></div>
      <div style="font-size: 13px;"><strong>Due Date:</strong> ${invoice.dueDate}</div>
      <div style="font-size: 13px;"><strong>Meter Dial:</strong> ${invoice.meterReadingStartKl} → ${invoice.meterReadingEndKl} kL</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Usage (kL)</th>
        <th>Rate</th>
        <th class="text-right">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${
        invoice.slabBreakdown && invoice.slabBreakdown.length > 0
          ? invoice.slabBreakdown
              .map(
                (s) => `
        <tr>
          <td>${s.slabName}</td>
          <td>${s.volumeBilledKl} kL</td>
          <td>₹${s.ratePerKl}/kL</td>
          <td class="text-right">₹${Number(s.amount ?? 0).toFixed(2)}</td>
        </tr>`
              )
              .join('')
          : `<tr><td>Metered Water Usage</td><td>${invoice.consumptionKl} kL</td><td>Tiered</td><td class="text-right">₹${Number(invoice.meteredCharge ?? 0).toFixed(2)}</td></tr>`
      }
      <tr>
        <td>Base Connection & Maintenance Fee</td>
        <td>Fixed</td>
        <td>-</td>
        <td class="text-right">₹${Number(invoice.baseCharge ?? 0).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Shared Water & Tanker Apportionment</td>
        <td>Apportioned</td>
        <td>-</td>
        <td class="text-right">₹${Number(invoice.sharedCharge ?? 0).toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3">TOTAL AMOUNT</td>
        <td class="text-right">₹${invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  ${
    invoice.status === 'PAID'
      ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 20px;">
          <strong>Payment Confirmation:</strong> Paid via ${invoice.paymentMethod || 'Razorpay'}. Transaction ID: <code>${invoice.razorpayPaymentId || 'N/A'}</code> on ${invoice.paidAt || invoice.dueDate}.
        </div>`
      : ''
  }

  <div class="footer">
    This is a computer-generated invoice from JalSetu Smart Water Management System. No physical signature is required.
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
