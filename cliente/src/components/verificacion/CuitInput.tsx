import React, { useRef } from 'react';

interface CuitInputProps {
  value: string; // formato "XX-XXXXXXXX-X"
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Desarma "XX-XXXXXXXX-X" en sus 3 partes.
function parseValue(v: string): [string, string, string] {
  if (!v) return ['', '', ''];
  const parts = v.split('-');
  return [parts[0] || '', parts[1] || '', parts[2] || ''];
}

const CuitInput: React.FC<CuitInputProps> = ({ value, onChange, disabled = false }) => {
  const [p1Init, p2Init, p3Init] = parseValue(value);
  const refP2 = useRef<HTMLInputElement>(null);
  const refP3 = useRef<HTMLInputElement>(null);

  const commit = (p1: string, p2: string, p3: string) => {
    if (!p1 && !p2 && !p3) {
      onChange('');
      return;
    }
    onChange(`${p1}-${p2}-${p3}`);
  };

  const handleChange = (idx: 1 | 2 | 3, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    const [p1, p2, p3] = parseValue(value);
    if (idx === 1) {
      const next = clean.slice(0, 2);
      commit(next, p2, p3);
      if (next.length === 2) refP2.current?.focus();
    } else if (idx === 2) {
      const next = clean.slice(0, 8);
      commit(p1, next, p3);
      if (next.length === 8) refP3.current?.focus();
    } else {
      const next = clean.slice(0, 1);
      commit(p1, p2, next);
    }
  };

  // Sin w-full para que los anchos específicos (w-14/flex-1/w-10) realmente se apliquen.
  const inputBase =
    'border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100';

  return (
    <div className="flex items-center space-x-2 w-full">
      <input
        className={`${inputBase} w-14 flex-shrink-0`}
        value={p1Init}
        onChange={(e) => handleChange(1, e.target.value)}
        inputMode="numeric"
        maxLength={2}
        placeholder="30"
        disabled={disabled}
      />
      <span className="text-gray-400">-</span>
      <input
        ref={refP2}
        className={`${inputBase} flex-1 min-w-0`}
        value={p2Init}
        onChange={(e) => handleChange(2, e.target.value)}
        inputMode="numeric"
        maxLength={8}
        placeholder="12345678"
        disabled={disabled}
      />
      <span className="text-gray-400">-</span>
      <input
        ref={refP3}
        className={`${inputBase} w-10 flex-shrink-0`}
        value={p3Init}
        onChange={(e) => handleChange(3, e.target.value)}
        inputMode="numeric"
        maxLength={1}
        placeholder="9"
        disabled={disabled}
      />
    </div>
  );
};

export default CuitInput;
