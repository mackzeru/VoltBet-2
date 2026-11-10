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
} from 'lucide-react';
import { PaymentMethodType } from '@/types/api-football';
import { useWallet } from '@/context/WalletContext';
import { useTelegram } from '@/hooks/useTelegram';

interface PaymentMethodDetails {
  method: PaymentMethodType;
  shortLabel: string;
  accountName: string;
  accountNumber: string;
  networkNote: string;
}

const PAYMENT_METHODS: PaymentMethodDetails[] = [
  {
    method: 'Telebirr',
    shortLabel: 'Telebirr',
    accountName: 'VoltBet Entertainment PLC',
    accountNumber: '+251 911 248 900 (Merchant ID: 884920)',
    networkNote: 'Instant mobile money transfer via Ethio Telecom Telebirr SuperApp.',
  },
  {
    method: 'Commercial Bank of Ethiopia (CBE Birr)',
    shortLabel: 'CBE Birr',
    accountName: 'VoltBet Sports Trading PLC',
    accountNumber: '1000482910482',
    networkNote: 'Transfer via CBE Mobile Banking or CBE Birr agent and upload screenshot.',
  },
  {
    method: 'Bank Transfer',
    shortLabel: 'Bank Transfer',
    accountName: 'VoltBet Ethiopia Escrow Account (Awash / Abyssinia)',
    accountNumber: '01320948102900',
    networkNote: 'Supports RTGS & instant inter-bank transfers across all Ethiopian banks.',
  },
  {
    method: 'USDT (TRC-20)',
    shortLabel: 'USDT (TRC-20)',
    accountName: 'VoltBet TRON Treasury Vault',
    accountNumber: 'TVoLt98xK2pLmN4qR7sW1yZ3bC6vB8nM2Q',
    networkNote: 'Send only USDT on TRON (TRC-20). Auto-converted to ETB at 128.50 ETB / USDT.',
  },
];

const AMOUNT_PRESETS = [500, 1000, 5000, 15000, 50000];

export function DepositFormPanel() {
  const { submitDeposit } = useWallet();
  const { hapticImpact } = useTelegram();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodDetails>(PAYMENT_METHODS[0]);
  const [amount, setAmount] = useState<number>(5000);
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

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
    setSubmittedTicketId(null);
    setIsUploading(true);
    setUploadProgress(15);

    const step1 = setTimeout(() => setUploadProgress(65), 180);
    const step2 = setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setFileName(name);
      setPreviewUrl(dataUrl);
    }, 420);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (PNG, JPG, WEBP).');
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

    if (amount <= 0) {
      setFileError('Please enter a deposit amount greater than 0 ETB.');
      return;
    }

    if (!previewUrl) {
      setFileError('Please upload a payment screenshot or click "Use Sample Receipt" to test.');
      return;
    }

    const created = submitDeposit({
      method: selectedMethod.method,
      amount,
      referenceCode: referenceCode || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      screenshotFileName: fileName || 'payment_receipt.jpg',
      screenshotPreviewUrl: previewUrl,
    });

    setSubmittedTicketId(created.id);
    setReferenceCode('');
  };

  return (
    <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-6 space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-white">
          Screenshot Deposit Settlement
        </h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Select your preferred Ethiopian or crypto rail, transfer your ETB amount, and upload your screenshot receipt for instant verification.
        </p>
      </div>

      {/* 1. Payment Method Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#94A3B8]">
          1. Select Payment Method
        </label>
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
                  setSubmittedTicketId(null);
                }}
                className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                  active
                    ? 'bg-[#00E676] border-[#00E676] text-[#0B0E14] font-bold shadow-[0_0_16px_rgba(0,230,118,0.2)]'
                    : 'bg-[#121721] border-[#2A344B] text-white hover:border-[#00E676]/40'
                }`}
              >
                <span className="truncate">{pm.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Payment Instructions Card & QR Code */}
      <div className="rounded-xl bg-[#121721] border border-[#2A344B] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2.5 flex-1 min-w-0 w-full">
          <div className="text-xs text-[#94A3B8]">
            <span>{selectedMethod.method}</span>
            <span aria-hidden="true"> · </span>
            <span className="text-[#00E676]">Verified Merchant</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0B0E14] border border-[#2A344B] px-3 py-2">
              <div className="min-w-0">
                <span className="block text-[10px] text-[#94A3B8]">Account / Merchant Name</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {selectedMethod.accountName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.accountName, 'name')}
                className="px-2.5 py-1 rounded-md bg-[#1E2638] hover:bg-[#2A344B] text-xs font-medium text-white inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedField === 'name' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00E676]" />
                    <span className="text-[#00E676]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0B0E14] border border-[#2A344B] px-3 py-2">
              <div className="min-w-0">
                <span className="block text-[10px] text-[#94A3B8]">
                  Account Number / IBAN / Address
                </span>
                <span className="font-mono tabular-nums text-xs font-bold text-[#00E676] truncate block">
                  {selectedMethod.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedMethod.accountNumber, 'number')}
                className="px-2.5 py-1 rounded-md bg-[#1E2638] hover:bg-[#2A344B] text-xs font-medium text-white inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedField === 'number' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00E676]" />
                    <span className="text-[#00E676]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#94A3B8]">{selectedMethod.networkNote}</p>
        </div>

        {/* Simulated Merchant QR Code Box */}
        <div className="w-28 h-28 rounded-xl bg-white p-2 flex flex-col items-center justify-center shrink-0 self-center sm:self-auto border border-[#2A344B]">
          <QrCode className="w-20 h-20 text-[#0B0E14]" strokeWidth={1.5} />
          <span className="text-[9px] font-mono font-bold text-[#0B0E14] uppercase">
            SCAN TO PAY
          </span>
        </div>
      </div>

      {/* 3. Deposit Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input + Quick Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#94A3B8]">
            2. Deposit Amount (ETB)
          </label>
          <div className="relative">
            <input
              type="number"
              min={50}
              step="any"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-11 px-3.5 pr-16 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono tabular-nums text-sm font-bold text-white"
              placeholder="Enter amount in ETB"
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
                {preset.toLocaleString()} ETB
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot / Receipt Upload Drag-and-Drop Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#94A3B8]">
              3. Upload Transfer Screenshot / Receipt
            </label>
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
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile && droppedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    simulateFileProcessing(droppedFile.name, reader.result);
                  }
                };
                reader.readAsDataURL(droppedFile);
              }
            }}
            className="rounded-xl border border-dashed border-[#2A344B] hover:border-[#00E676]/60 bg-[#121721] p-4 text-center cursor-pointer transition-colors"
          >
            {isUploading ? (
              <div className="py-4 space-y-2">
                <p className="text-xs font-semibold text-white">
                  Validating Receipt Image... ({uploadProgress}%)
                </p>
                <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-[#0B0E14] overflow-hidden">
                  <div
                    className="h-full bg-[#00E676] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : previewUrl ? (
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover border border-[#00E676]/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[#00E676]">
                      <FileCheck2 className="w-4 h-4 shrink-0" />
                      <span>Receipt Verified & Ready</span>
                    </div>
                    <p className="text-xs text-white truncate mt-0.5">{fileName}</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Click to replace screenshot image
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-3 space-y-1.5">
                <UploadCloud className="w-7 h-7 text-[#00E676] mx-auto" />
                <p className="text-xs font-semibold text-white">
                  Tap to Capture or Drop Payment Screenshot Here
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  Supports JPG, PNG, WEBP up to 10MB · Or click &ldquo;Use Sample Receipt&rdquo; above
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Optional Transaction Reference Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#94A3B8]">
            4. Bank / Telebirr Transaction Reference Code (Optional)
          </label>
          <input
            type="text"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            placeholder="e.g. FT2631398001 or TB99481023ET"
            className="w-full h-11 px-3.5 rounded-xl bg-[#0B0E14] border border-[#2A344B] focus:border-[#00E676] focus:outline-none font-mono text-xs text-white"
          />
        </div>

        {fileError && (
          <div className="rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 p-3 flex items-center gap-2 text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {submittedTicketId && (
          <div className="rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 p-3 flex items-center justify-between gap-2 text-xs text-[#00E676]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Deposit Ticket <strong className="font-mono">{submittedTicketId}</strong> created as PENDING! Use the Admin Simulator in the table below to approve it immediately.
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full min-h-[48px] rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-all cursor-pointer"
        >
          <span>Submit Deposit Ticket ({amount.toLocaleString()} ETB)</span>
        </button>
      </form>
    </div>
  );
}
