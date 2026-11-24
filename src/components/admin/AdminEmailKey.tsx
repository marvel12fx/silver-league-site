import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, KeyRound, Save } from 'lucide-react';

const inputClass = 'w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white';
const labelClass = 'block text-[10px] tracking-luxe uppercase text-silver-dark mb-2';

type SecretState = 'missing' | 'saved' | 'unknown';

export function AdminEmailKey() {
  const [keyState, setKeyState] = useState<SecretState>('unknown');
  const [value, setValue] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromMissing, setFromMissing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('app_secrets')
        .select('name')
        .in('name', ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']);
      if (error) {
        setKeyState('unknown');
        return;
      }
      const names = ((data ?? []) as { name: string }[]).map((r) => r.name);
      setKeyState(names.includes('RESEND_API_KEY') ? 'saved' : 'missing');
      setFromMissing(!names.includes('RESEND_FROM_EMAIL'));
    };
    load();
  }, []);

  const save = async () => {
    setMessage(null);
    if (!value.trim()) {
      setMessage({ kind: 'error', text: 'Paste your Resend API key first.' });
      return;
    }
    if (!fromEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail.trim())) {
      setMessage({ kind: 'error', text: 'Enter the verified sender email address.' });
      return;
    }
    setSaving(true);
    const rows = [
      { name: 'RESEND_API_KEY', value: value.trim() },
      { name: 'RESEND_FROM_EMAIL', value: fromEmail.trim() },
    ];
    const { error } = await supabase
      .from('app_secrets')
      .upsert(rows, { onConflict: 'name' });
    if (error) {
      setMessage({ kind: 'error', text: `Could not save: ${error.message}` });
    } else {
      setKeyState('saved');
      setFromMissing(false);
      setValue('');
      setMessage({ kind: 'ok', text: 'Saved securely on the server. Order emails will now send automatically.' });
    }
    setSaving(false);
  };

  return (
    <section className="bg-white border border-gray-100 p-6 md:p-8 space-y-6">
      <div>
        <p className="font-display text-xl text-burgundy-dark flex items-center gap-2">
          <KeyRound size={18} /> Email connection
        </p>
        <p className="text-xs text-silver-dark mt-1">
          Paste your Resend API key here. It is saved as a server-side secret, is never shown again after saving,
          and is never included in the website code or exposed to visitors. Get the key from the Resend dashboard
          at resend.com/api-keys.
        </p>
      </div>

      {keyState === 'saved' && (
        <p className="flex items-center gap-2 text-sm text-green-800">
          <CheckCircle2 size={16} /> An API key is saved. Paste a new key only if you want to replace it.
        </p>
      )}

      <div>
        <label className={labelClass}>Resend API key</label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={keyState === 'saved' ? '•••••••• (saved)' : 're_...'}
          autoComplete="off"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>From email address (verified in Resend)</label>
        <input
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder="orders@yourdomain.com"
          autoComplete="off"
          className={inputClass}
        />
        {!fromMissing && <p className="text-xs text-silver-dark mt-1">A sender address is already saved. Enter it again to change it.</p>}
      </div>

      {message && (
        <p className={`text-sm ${message.kind === 'ok' ? 'text-green-800' : 'text-red-700'}`}>{message.text}</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-60"
      >
        <Save size={14} /> {saving ? 'Saving...' : 'Save securely'}
      </button>
    </section>
  );
}
