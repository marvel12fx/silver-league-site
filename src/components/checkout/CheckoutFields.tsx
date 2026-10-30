import type { ReactNode } from 'react';

export function CheckoutInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors"
      />
    </div>
  );
}

export function CheckoutOptionCard({
  title,
  description,
  meta,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  meta: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full flex items-center justify-between gap-4 p-4 border-2 transition-colors text-left ${
        selected ? 'border-burgundy bg-cream' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-burgundy' : 'border-gray-300'
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-burgundy" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-burgundy-dark font-medium">{title}</p>
          <p className="text-xs text-silver-dark">{description}</p>
        </div>
      </div>
      <div className="text-sm text-burgundy-dark text-right shrink-0">{meta}</div>
    </button>
  );
}
