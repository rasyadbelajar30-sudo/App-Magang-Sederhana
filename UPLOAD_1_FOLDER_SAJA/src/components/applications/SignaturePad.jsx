import React, { useState } from 'react';
import { PenTool, PartyPopper } from 'lucide-react';
import { Button } from '../ui/Button';
import { sfx } from '../../lib/soundEffects';

export function SignaturePad({ expectedName, onSign, loading }) {
  const [typedName, setTypedName] = useState('');

  const cleanTyped = typedName.trim();
  const cleanExpected = String(expectedName || '').trim();
  const isMatch =
    cleanTyped.length > 0 && cleanTyped.toLowerCase() === cleanExpected.toLowerCase();

  return (
    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <PenTool className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
            Tanda Tangan Elektronik (Digital Signature)
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Ketik nama lengkapmu persis sesuai profil (<strong>{cleanExpected}</strong>) untuk menandatangani Offering Letter dan resmi memulai magang!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Ketik Nama Lengkapmu:
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => {
              sfx.signatureScribble();
              setTypedName(e.target.value);
            }}
            placeholder={cleanExpected}
            className="w-full rounded-xl bg-white dark:bg-ink-900 border border-slate-300 dark:border-white/20 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          {cleanTyped.length > 0 && !isMatch && (
            <p className="text-[11px] font-bold text-amber-500 mt-1">
              Ketik sama persis dengan nama lengkap profilmu: &ldquo;{cleanExpected}&rdquo;
            </p>
          )}
        </div>

        {/* Live Handwriting Preview */}
        <div className="bg-white text-slate-900 rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Pratinjau Tanda Tangan Digital
          </p>
          <div className="min-h-[42px] flex items-center justify-center border-b-2 border-dashed border-slate-300 pb-1">
            <span className="font-signature text-3xl text-brand-600">
              {cleanTyped || 'Tanda Tanganmu'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="emerald"
          size="lg"
          disabled={!isMatch}
          loading={loading}
          onClick={() => {
            sfx.celebrationFanfare();
            onSign(cleanTyped);
          }}
          className="w-full sm:w-auto"
        >
          <PartyPopper className="w-5 h-5" />
          <span>Terima Tawaran &amp; Mulai Magang 🎉</span>
        </Button>
      </div>
    </div>
  );
}
