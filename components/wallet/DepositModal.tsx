'use client';

import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  UploadCloud,
  QrCode,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Camera,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { PaymentMethodType } from '@/types/api-football';
import { useWallet } from '@/context/WalletContext';
import { useTelegram } from '@/hooks/useTelegram';

interface PaymentMethodDetails {
  method: PaymentMethodType;
  shortLabel: string;
  accountName: string;
  accountNumber: string;
}

const PAYMENT_METHODS: PaymentMethodDetails[] = [
  {
    method: 'Telebirr',
    shortLabel: 'Telebirr',
    accountName: 'VoltBet PLC',
    accountNumber: '+251 911 248 900 (ID: 884920)',
  },
  {
    method: 'Commercial Bank of Ethiopia (CBE Birr)',
    shortLabel: 'CBE Birr',
    accountName: 'VoltBet Sports PLC',
    accountNumber: '1000482910482',
  },
  {
    method: 'Bank Transfer',
    shortLabel: 'Bank Transfer',
    accountName: 'VoltBet Escrow (Awash / Abyssinia)',
    accountNumber: '01320948102900',
  },
  {
    method: 'USDT (TRC-20)',
    shortLabel: 'USDT (TRC-20)',
    accountName: 'VoltBet TRON Vault',
    accountNumber: 'TVoLt98xK2pLmN4qR7sW1yZ3bC6vB8nM2Q',
  },
];

const AMOUNT_PRESETS = [500, 1000, 5000, 15000, 50000];

export function DepositFormPanel() {
  const { balance, userProfile, submitDeposit, submitWithdrawal } = useWallet();
  const { hapticImpact } = useTelegram();

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodDetails>(
    PAYMENT_METHODS[0]
  );
  const [amount, setAmount] = useState<number>(5000);
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [destinationAccount, setDestinationAccount] = useState<string>(
    userProfile.phone
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCopy = (text: string, label: string) => {
    hapticImpact('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const simulateFileProcessing = (name: string, dataUrl: string) => {
    setFileError(null);
    setSuccessNotice(null);
    setIsUploading(true);
    setUploadProgress(20);

    setTimeout(() => setUploadProgress(70), 150);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setFileName(name);
      setPreviewUrl(dataUrl);
    }, 350);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        simulateFileProcessing(file.name, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateSampleReceipt = () => {
    hapticImpact('medium');
    simulateFileProcessing(
      `${selectedMethod.shortLabel.toLowerCase().replace(/\s+/g, '_')}_receipt_${amount}etb.jpg`,
      '/assets/aistudio/Gemini_Generated_Image_z2jjacz2jjacz2jj_1f18e757.jpeg'
    );
    if (!referenceCode) {
      setReferenceCode(`TX-${Math.floor(100000 + Math.random() * 899999)}ET`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    setSuccessNotice(null);

    if (amount <= 0) {
      setFileError('Enter an amount greater than 0 ETB.');
      return;
    }

    if (mode === 'withdraw') {
      const res = submitWithdrawal({
        method: selectedMethod.method,
        amount,
        destinationAccount: destinationAccount || userProfile.phone,
      });
      if (!res.success) {
        setFileError(res.error || 'Withdrawal failed.');
      } else if (res.tx) {
        setSuccessNotice(
          `Withdrawal ${res.tx.id} (${amount.toLocaleString()} ETB) processed to ${selectedMethod.shortLabel}!`
        );
      }
      return;
    }

    if (!previewUrl) {
      setFileError('Upload a screenshot or click "Use Sample Receipt".');
      return;
    }

    const created = submitDeposit({
      method: selectedMethod.method,
      amount,
      referenceCode:
        referenceCode || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      screenshotFileName: fileName || 'payment_receipt.jpg',
      screenshotPreviewUrl: previewUrl,
    });

    setSuccessNotice(
      `Deposit ${created.id} submitted as PENDING. Approve it in the table below.`
    );
    setReferenceCode('');
  };

  return (
    <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 space-y-4">
      {/* Deposit vs Withdraw Segmented Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A344B]">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0B0E14] border border-[#2A344B] w-full sm:w-72">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setFileError(null);
              setSuccessNotice(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'deposit'
                ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Deposit ETB</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setFileError(null);
              setSuccessNotice(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'withdraw'
                ? 'bg-[#00E676] text-[#0B0E14] font-bold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw ETB</span>
          </button>
        </div>

        <span className="text-xs font-mono tabular-nums text-[#94A3B8]">
          Available: <strong className="text-white">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB</strong>
        </span>
      </div>

      {/* Payment Rail Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PAYMENT_METHODS.map((pm) => {
          const active = pm.method === selectedMethod.method;
          return (
            <button
              key={pm.method}
              type="button"
              onClick={() => {
                hapticImpact('light');
                setSelectedMethod(pm);
                setSuccessNotice(null);
              }}
              className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                active
                  ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold'
                  : 'bg-[#121721] border-[#2A344B] text-white hover:border-[#00E676]/40'
              }`}
            >
              <span className="truncate">{pm.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Merchant Details & QR (Only shown in Deposit mode) */}
      {mode === 'deposit' && (
        <div className="rounded-xl bg-[#121721] border border-[#2A344B] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0B0E14] border border-[#2A344B] px-3 py-2">
              <div className="min-w-0">
                <span className="block text-[10px] text-[#94A3B8]">Merchant</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {selectedMethod.accountName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.accountName, 'name')}
                className="px-2.5 py-1 rounded-md bg-[#1E2638] text-xs font-medium text-white inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedField === 'name' ? (
                  <Check className="w-3.5 h-3.5 text-[#00E676]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0B0E14] border border-[#2A344B] px-3 py-2">
              <div className="min-w-0">
                <span className="block text-[10px] text-[#94A3B8]">
                  Account / Address
                </span>
                <span className="font-mono tabular-nums text-xs font-bold text-[#00E676] truncate block">
                  {selectedMethod.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.accountNumber, 'number')}
                className="px-2.5 py-1 rounded-md bg-[#1E2638] text-xs font-medium text-white inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedField === 'number' ? (
                  <Check className="w-3.5 h-3.5 text-[#00E676]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
                )}
              </button>
            </div>
          </div>

          <div className="w-24 h-24 rounded-xl bg-white p-1.5 flex flex-col items-center justify-center shrink-0 self-center sm:self-auto">
            <QrCode className="w-16 h-16 text-[#0B0E14]" strokeWidth={1.5} />
            <span className="text-[8px] font-mono font-bold text-[#0B0E14]">
              SCAN QR
            </span>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-2">
          <div className="relative">
            <input
              type="number"
              min={50}
              step="any"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-11 px-3.5 pr-16 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono tabular-nums text-sm font-bold text-white"
              placeholder="Amount in ETB"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#00E676]">
              ETB
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`px-3 py-1.5 rounded-lg border font-mono tabular-nums text-xs font-semibold transition-colors cursor-pointer ${
                  amount === preset
                    ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                    : 'bg-[#121721] border-[#2A344B] text-[#94A3B8] hover:text-white'
                }`}
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {mode === 'withdraw' ? (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#94A3B8]">
              Destination {selectedMethod.shortLabel} Account / Phone
            </label>
            <input
              type="text"
              value={destinationAccount}
              onChange={(e) => setDestinationAccount(e.target.value)}
              placeholder="+251 911 248 900 or Account Number"
              className="w-full h-11 px-3.5 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono text-xs text-white"
            />
          </div>
        ) : (
          <>
            {/* Screenshot Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8]">
                  Payment Receipt Screenshot
                </span>
                <button
                  type="button"
                  onClick={handleSimulateSampleReceipt}
                  className="text-xs font-semibold text-[#00E676] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Use Sample Receipt</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-dashed border-[#2A344B] hover:border-[#00E676]/60 bg-[#121721] p-3.5 text-center cursor-pointer transition-colors"
              >
                {isUploading ? (
                  <div className="py-2 space-y-1.5">
                    <p className="text-xs font-semibold text-white">
                      Uploading... {uploadProgress}%
                    </p>
                    <div className="w-48 mx-auto h-1.5 rounded-full bg-[#0B0E14] overflow-hidden">
                      <div
                        className="h-full bg-[#00E676]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : previewUrl ? (
                  <div className="flex items-center gap-3 text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-[#00E676]/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#00E676]">
                        <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Receipt Attached</span>
                      </div>
                      <p className="text-xs text-white truncate">{fileName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 space-y-1">
                    <UploadCloud className="w-6 h-6 text-[#00E676] mx-auto" />
                    <p className="text-xs font-semibold text-white">
                      Upload Receipt Screenshot
                    </p>
                  </div>
                )}
              </div>
            </div>

            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="Transaction Reference Code (Optional)"
              className="w-full h-10 px-3.5 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono text-xs text-white"
            />
          </>
        )}

        {fileError && (
          <div className="rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 p-2.5 flex items-center gap-2 text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {successNotice && (
          <div className="rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 p-2.5 flex items-center gap-2 text-xs text-[#00E676]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full min-h-[46px] rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>
            {mode === 'deposit'
              ? `Submit Deposit · ${amount.toLocaleString()} ETB`
              : `Withdraw Now · ${amount.toLocaleString()} ETB`}
          </span>
        </button>
      </form>
    </div>
  );
}
