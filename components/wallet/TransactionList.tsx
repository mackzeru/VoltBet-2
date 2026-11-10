'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { DepositTransaction } from '@/types/api-football';
import { useWallet } from '@/context/WalletContext';

export function TransactionList() {
  const {
    transactions,
    approveDeposit,
    rejectDeposit,
    approveAllPendingDeposits,
  } = useWallet();

  const [adminSimulatorEnabled, setAdminSimulatorEnabled] = useState<boolean>(true);
  const [previewTx, setPreviewTx] = useState<DepositTransaction | null>(null);

  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2A344B]">
        <h2 className="font-display text-base font-bold text-white">
          Transaction History
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminSimulatorEnabled((prev) => !prev)}
            className={`min-h-[34px] px-3 py-1 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              adminSimulatorEnabled
                ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
                : 'bg-[#121721] border-[#2A344B] text-[#94A3B8]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Sim: {adminSimulatorEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {adminSimulatorEnabled && pendingCount > 0 && (
            <button
              type="button"
              onClick={approveAllPendingDeposits}
              className="min-h-[34px] px-3 py-1 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold cursor-pointer"
            >
              Approve All ({pendingCount})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2A344B] text-[11px] font-semibold text-[#94A3B8]">
              <th className="py-2 pr-3">Ticket</th>
              <th className="py-2 px-3">Method</th>
              <th className="py-2 px-3 text-right">Amount</th>
              <th className="py-2 px-3">Receipt</th>
              <th className="py-2 px-3">Status</th>
              {adminSimulatorEnabled && (
                <th className="py-2 pl-3 text-right">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A344B]/60 text-xs">
            {transactions.map((tx) => {
              const isWithdrawal = tx.type === 'WITHDRAWAL';
              return (
                <tr key={tx.id} className="hover:bg-[#121721]/50 transition-colors">
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    <div className="font-mono tabular-nums font-bold text-white">
                      {tx.id}
                    </div>
                    <div className="font-mono tabular-nums text-[10px] text-[#94A3B8]">
                      {tx.createdAt}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">
                    {tx.method}
                  </td>

                  <td
                    className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold whitespace-nowrap ${
                      isWithdrawal ? 'text-amber-400' : 'text-[#00E676]'
                    }`}
                  >
                    {isWithdrawal ? '-' : '+'}
                    {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setPreviewTx(tx)}
                      className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#00E676]" />
                      <span className="truncate max-w-[100px]">{tx.screenshotFileName}</span>
                    </button>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {tx.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>PENDING</span>
                      </span>
                    )}
                    {tx.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>APPROVED</span>
                      </span>
                    )}
                    {tx.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#EF4444]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>REJECTED</span>
                      </span>
                    )}
                  </td>

                  {adminSimulatorEnabled && (
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      {tx.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => approveDeposit(tx.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#00E676] hover:bg-[#00C853] text-[#0B0E14] text-xs font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectDeposit(tx.id)}
                            className="px-2 py-1 rounded-lg bg-[#121721] hover:bg-[#EF4444]/20 border border-[#2A344B] text-xs text-[#94A3B8] hover:text-[#EF4444] cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8] font-mono">Done</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#1E2638] border border-[#2A344B] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{previewTx.id}</h3>
                <p className="text-xs text-[#94A3B8]">
                  {previewTx.method} · {previewTx.amount.toLocaleString()} ETB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTx(null)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-[#0B0E14] border border-[#2A344B] max-h-80 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewTx.screenshotPreviewUrl}
                alt={previewTx.screenshotFileName}
                referrerPolicy="no-referrer"
                className="max-h-72 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
