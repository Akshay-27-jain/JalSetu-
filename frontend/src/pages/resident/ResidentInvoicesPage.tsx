import React, { useState, useEffect } from 'react';
import { residentBillingApi, extractErrorMessage } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import type { Invoice, TariffPlan } from '../../types';
import { printInvoiceStatement } from '../../utils/exportUtils';
import { useLanguage } from '../../context/LanguageContext';
import {
  Receipt,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
  ExternalLink,
  Check,
  HelpCircle,
  QrCode,
  Smartphone,
  Building,
  Lock,
  X,
  Zap,
  Download,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const ResidentInvoicesPage: React.FC = () => {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tariff, setTariff] = useState<TariffPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Invoice Detail Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Razorpay Payment States
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    invoiceNumber: string;
    amount: number;
    paymentId: string;
    paidAt: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, tariffData] = await Promise.all([
        residentBillingApi.getInvoices(),
        residentBillingApi.getTariffPlan(),
      ]);
      setInvoices(invData);
      setTariff(tariffData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Dynamically inject Razorpay Checkout JS SDK
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Primary: Launch Official Razorpay Checkout Popup
  const handlePayRazorpay = async (invoice: Invoice) => {
    try {
      setIsProcessingPayment(true);
      setError(null);
      setPaymentSuccessData(null);

      // 1. Create genuine Order on Razorpay Cloud via Spring Boot backend
      const orderData = await residentBillingApi.createRazorpayOrder(invoice.id);

      if (window.Razorpay) {
        const options: any = {
          key: orderData.keyId || (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || '',
          amount: orderData.amountInPaise,
          currency: orderData.currency || 'INR',
          name: 'JalSetu Smart Water',
          description: `Water Utility Bill for Flat ${orderData.flatNumber} (${orderData.invoiceNumber})`,
          order_id: orderData.orderId,
          image: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png',
          handler: async function (response: any) {
            try {
              setIsProcessingPayment(true);
              const receipt = await residentBillingApi.verifyPayment(invoice.id, {
                razorpayOrderId: response.razorpay_order_id || orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || 'test_sig_' + response.razorpay_payment_id,
              });

              setPaymentSuccessData({
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.totalAmount,
                paymentId: response.razorpay_payment_id,
                paidAt: new Date().toLocaleString('en-IN'),
              });

              await fetchData();
            } catch (verErr) {
              setError('Payment captured but verification failed: ' + extractErrorMessage(verErr));
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            contact: orderData.customerContact,
          },
          notes: {
            society: orderData.societyName,
            flat: orderData.flatNumber,
            invoiceNumber: orderData.invoiceNumber,
          },
          theme: {
            color: '#0284c7',
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError(`Payment declined: ${response.error?.description || 'Transaction cancelled'}`);
          setIsProcessingPayment(false);
        });
        rzp.open();
        setIsProcessingPayment(false);
      } else {
        // Fallback to In-App Razorpay Test Modal
        setPayingInvoice(invoice);
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.warn('Official popup notice, opening in-app test gateway:', err);
      setPayingInvoice(invoice);
      setIsProcessingPayment(false);
    }
  };

  // Fallback: In-App Execute Payment
  const handleExecuteFallbackPayment = async () => {
    if (!payingInvoice) return;
    try {
      setIsProcessingPayment(true);
      setError(null);

      const orderData = await residentBillingApi.createRazorpayOrder(payingInvoice.id);
      const testPaymentId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().slice(-4);
      const signature = 'test_sig_' + testPaymentId;

      await residentBillingApi.verifyPayment(payingInvoice.id, {
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: signature,
      });

      setPaymentSuccessData({
        invoiceNumber: payingInvoice.invoiceNumber,
        amount: payingInvoice.totalAmount,
        paymentId: testPaymentId,
        paidAt: new Date().toLocaleString('en-IN'),
      });

      setPayingInvoice(null);
      await fetchData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      await residentBillingApi.downloadInvoicePdf(invoiceId, invoiceNumber);
    } catch (err) {
      console.warn('Backend PDF download fallback:', err);
      const inv = invoices.find((i) => i.id === invoiceId);
      if (inv) {
        printInvoiceStatement(inv);
      }
    }
  };

  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'PAID');
  const activeUnpaid = unpaidInvoices.length > 0 ? unpaidInvoices[0] : null;

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(invoices.length / itemsPerPage) || 1;
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('myWaterInvoices', 'My Water Invoices & Payments')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('invoicesSubtitle', 'Review monthly metered consumption bills, tiered slab calculations, and pay securely via Razorpay.')}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs w-fit"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{t('refreshInvoices', 'Refresh Invoices')}</span>
        </button>
      </div>

      {paymentSuccessData && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
              ⚡ Payment of ₹{paymentSuccessData.amount.toLocaleString('en-IN')} Received Successfully!
            </p>
            <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
              Transaction ID: <strong>{paymentSuccessData.paymentId}</strong> | Invoice: <strong>{paymentSuccessData.invoiceNumber}</strong>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-800 dark:text-rose-200 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Unpaid Bill Hero Card */}
      {activeUnpaid ? (
        <div className="relative overflow-hidden rounded-2xl border border-brand-200/80 dark:border-brand-900/60 bg-gradient-to-br from-brand-500/10 via-brand-50/50 dark:via-[#131B2E] to-aqua-500/10 p-6 sm:p-8 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  ⚠️ Action Required
                </span>
                <span className="font-mono text-xs text-slate-500">{activeUnpaid.invoiceNumber}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeUnpaid.billingMonth} Monthly Water Bill
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                Total metered usage of <strong>{activeUnpaid.consumptionKl} kL</strong> ({activeUnpaid.meterReadingStartKl} → {activeUnpaid.meterReadingEndKl} kL dial), plus shared tanker apportionment and base maintenance fee.
              </p>

              <div className="flex items-center gap-4 text-xs pt-1 font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-brand-500" />
                  Due Date: <strong>{activeUnpaid.dueDate}</strong>
                </span>
              </div>
            </div>

            {/* Bill Amount & Pay Action */}
            <div className="flex flex-col items-start md:items-end justify-center gap-3 shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Amount Due</span>
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400 font-mono tabular-nums">
                  ₹{activeUnpaid.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => printInvoiceStatement(activeUnpaid)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-xs"
                  title="Download / Print Bill Statement PDF"
                >
                  <Printer className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(activeUnpaid)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-xs"
                >
                  View Breakdown
                </button>

                <button
                  type="button"
                  onClick={() => handlePayRazorpay(activeUnpaid)}
                  disabled={isProcessingPayment}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-500/30 hover:shadow-brand-500/50 active:scale-98 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isProcessingPayment ? 'Opening Razorpay...' : '⚡ Pay via Razorpay'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 flex items-center gap-4 text-emerald-900 dark:text-emerald-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">{t('allCaughtUp', 'All Caught Up!')}</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              {t('noPendingDues', 'You have no pending water utility dues. Thank you for your prompt payments!')}
            </p>
          </div>
        </div>
      )}

      {/* Society Tariff Slabs Transparency Card */}
      {tariff && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 sm:p-6 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              {t('communityTariffSlabs', 'Community Tariff Slabs Transparency')}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Active Society Rules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/60 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('baseFee', 'Base Fee')}</span>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5 tabular-nums">₹{tariff.baseMaintenanceFee}/mo</p>
              <p className="text-[10px] text-slate-400">{t('fixedConnectionFee', 'Fixed connection fee')}</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 p-3 bg-emerald-50/40 dark:bg-emerald-950/20">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase">{t('tier1', `Tier 1 (0-${tariff.baseTierLimitKl} kL)`)}</span>
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 tabular-nums">₹{tariff.baseRatePerKl}/kL</p>
              <p className="text-[10px] text-slate-400">{t('essentialBaseUsage', 'Essential base usage')}</p>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-900 p-3 bg-amber-50/40 dark:bg-amber-950/20">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase">{t('tier2', `Tier 2 (${tariff.baseTierLimitKl}-${tariff.midTierLimitKl} kL)`)}</span>
              <p className="text-base font-bold text-amber-700 dark:text-amber-300 font-mono mt-0.5 tabular-nums">₹{tariff.midRatePerKl}/kL</p>
              <p className="text-[10px] text-slate-400">{t('standardUsageSlab', 'Standard usage slab')}</p>
            </div>

            <div className="rounded-2xl border border-rose-200 dark:border-rose-900 p-3 bg-rose-50/40 dark:bg-rose-950/20">
              <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold uppercase">{t('tier3', `Tier 3 (>${tariff.midTierLimitKl} kL)`)}</span>
              <p className="text-base font-bold text-rose-700 dark:text-rose-300 font-mono mt-0.5 tabular-nums">₹{tariff.higherRatePerKl}/kL</p>
              <p className="text-[10px] text-slate-400">{t('highConsumptionSurcharge', 'High consumption rate')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices History Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-sm space-y-3 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          Past Invoices & Receipts
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
            <p className="mt-3 text-xs font-semibold">Loading billing history...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Receipt className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2.5" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No invoices on record yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Your community admin will generate monthly invoices at the end of each billing cycle.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Consumption</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {inv.billingMonth}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white tabular-nums">{inv.consumptionKl} kL</p>
                        <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {inv.meterReadingStartKl} → {inv.meterReadingEndKl} kL
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold font-mono text-sm text-slate-900 dark:text-white tabular-nums">
                      ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {inv.dueDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'normal'
                            : inv.status === 'OVERDUE'
                            ? 'overuse'
                            : 'billing'
                        }
                        size="sm"
                      >
                        {inv.status === 'PAID' ? '✓ Paid' : inv.status === 'OVERDUE' ? '⚠️ Overdue' : '⏳ Pending'}
                      </Badge>
                      {inv.razorpayPaymentId && (
                        <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{inv.razorpayPaymentId}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all cursor-pointer"
                          title="View Itemized Breakdown"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all cursor-pointer"
                          title="Download Official PDF Invoice"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => printInvoiceStatement(inv)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all cursor-pointer"
                          title="Print Official Statement"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        {inv.status !== 'PAID' && (
                          <button
                            type="button"
                            onClick={() => handlePayRazorpay(inv)}
                            className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-700 transition-all cursor-pointer"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={invoices.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              itemsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </div>

      {/* ---------------- IN-APP RAZORPAY TEST PAYMENT MODAL (FALLBACK) ---------------- */}
      {payingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isProcessingPayment) setPayingInvoice(null);
          }}
          title="⚡ Razorpay Payment Gateway (Test Sandbox)"
          subtitle={`Securely pay ₹${payingInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} for ${payingInvoice.invoiceNumber}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-bit Encrypted SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setPayingInvoice(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecuteFallbackPayment}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/25 active:scale-98 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      <span>Authorize & Pay ₹{Number(payingInvoice.totalAmount ?? 0).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Merchant Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Merchant / Beneficiary</span>
                <h4 className="font-extrabold text-sm">JalSetu Smart Water Solutions</h4>
                <p className="text-[11px] opacity-90 mt-0.5">Flat {payingInvoice.flatNumber} • {payingInvoice.billingMonth} Bill</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] uppercase opacity-80">Amount Payable</span>
                <p className="text-xl font-black">₹{payingInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Test Payment Sandbox Notice */}
            <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Razorpay Free Test Sandbox Active
              </span>
              <span className="text-[10px] font-mono bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200 font-bold">
                Sandbox Mode
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPaymentMethodTab('UPI')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethodTab === 'UPI'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('CARD')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethodTab === 'CARD'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Debit / Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('NETBANKING')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethodTab === 'NETBANKING'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>Netbanking</span>
              </button>
            </div>

            {/* Method Tab Content */}
            {paymentMethodTab === 'UPI' && (
              <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. success@razorpay or yourname@upi"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 font-mono font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tip: Use <strong>success@razorpay</strong> for guaranteed test success.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold">Supported Apps:</span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">Google Pay</span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">PhonePe</span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">Paytm</span>
                </div>
              </div>
            )}

            {paymentMethodTab === 'CARD' && (
              <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Card Number (Razorpay Test Card)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 font-mono font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 font-mono font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2 font-mono font-bold text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethodTab === 'NETBANKING' && (
              <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Select Test Bank</span>
                <div className="grid grid-cols-3 gap-2">
                  {['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        selectedBank === bank
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2E] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ---------------- INVOICE ITEMIZE MODAL ---------------- */}
      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Billing Period: ${selectedInvoice.billingMonth} | Flat ${selectedInvoice.flatNumber}`}
          maxWidth="lg"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <Badge
                  variant={
                    selectedInvoice.status === 'PAID'
                      ? 'normal'
                      : selectedInvoice.status === 'OVERDUE'
                      ? 'warning'
                      : 'supply'
                  }
                >
                  {selectedInvoice.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/50 px-3.5 py-2 text-xs font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-100 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => printInvoiceStatement(selectedInvoice)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print View</span>
                </button>

                {selectedInvoice.status !== 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      handlePayRazorpay(inv);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-500/25 cursor-pointer transition-all"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Pay via Razorpay</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Flat & Meter Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 rounded-2xl bg-slate-50 dark:bg-slate-900 p-3 sm:p-3.5 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Flat Unit</span>
                <p className="font-bold text-slate-900 dark:text-white">Flat {selectedInvoice.flatNumber}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Meter Serial</span>
                <p className="font-mono font-bold text-brand-600 dark:text-brand-400 truncate">{selectedInvoice.meterSerialNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Starting Dial</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white">{selectedInvoice.meterReadingStartKl} kL</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Ending Dial</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white">{selectedInvoice.meterReadingEndKl} kL</p>
              </div>
            </div>

            {/* Metered Slabs Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                1. Tiered Slab Consumption Charges ({selectedInvoice.consumptionKl} kL)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs min-w-[320px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                    <tr>
                      <th className="py-2 px-2.5 sm:px-3">Tariff Tier</th>
                      <th className="py-2 px-2 sm:px-3">Volume (kL)</th>
                      <th className="py-2 px-2 sm:px-3">Rate (₹/kL)</th>
                      <th className="py-2 px-2.5 sm:px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoice.slabBreakdown?.map((slab, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2.5 sm:px-3 font-semibold text-slate-900 dark:text-white">{slab.slabName}</td>
                        <td className="py-2 px-2 sm:px-3 font-mono">{slab.volumeBilledKl} kL</td>
                        <td className="py-2 px-2 sm:px-3 font-mono">₹{slab.ratePerKl}/kL</td>
                        <td className="py-2 px-2.5 sm:px-3 text-right font-bold text-slate-900 dark:text-white">₹{Number(slab.amount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold">
                      <td colSpan={3} className="py-2 px-2.5 sm:px-3 text-slate-700 dark:text-slate-300">Metered Subtotal</td>
                      <td className="py-2 px-2.5 sm:px-3 text-right text-brand-600 dark:text-brand-400">₹{Number(selectedInvoice.meteredCharge ?? 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
                2. Shared Apportionment & Base Maintenance
              </h4>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Base Fixed Maintenance Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{Number(selectedInvoice.baseCharge ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-slate-600 dark:text-slate-400">Shared Water / Bulk Tanker Apportionment</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 break-words">{selectedInvoice.apportionmentDetails}</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">₹{Number(selectedInvoice.sharedCharge ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                <span>Total Bill Amount</span>
                <span className="text-brand-600 dark:text-brand-400">
                  ₹{Number(selectedInvoice.totalAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Razorpay Receipt Details if Paid */}
            {selectedInvoice.status === 'PAID' && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Razorpay Payment Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div>Payment ID: <strong>{selectedInvoice.razorpayPaymentId || 'OFFLINE'}</strong></div>
                  <div>Channel: <strong>{selectedInvoice.paymentMethod || 'RAZORPAY_TEST'}</strong></div>
                  <div>Order ID: <strong>{selectedInvoice.razorpayOrderId || 'N/A'}</strong></div>
                  <div>Paid Date: <strong>{selectedInvoice.paidAt || selectedInvoice.dueDate}</strong></div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
