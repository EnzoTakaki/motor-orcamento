'use client';
import { useId } from 'react';

const estiloCampo =
  'h-10 w-full rounded-lg border border-line bg-field px-3 text-sm text-fg outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent/15 read-only:opacity-70';

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {rotulo}
        {dica && <span title={dica} className="ml-1 inline-grid size-4 cursor-help place-items-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">?</span>}
      </label>
      {children(id)}
    </div>
  );
}

export function Entrada(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${estiloCampo} ${props.className ?? ''}`} />;
}

export function Selecao<T extends string | number>({ valor, opcoes, onMudar, id, placeholder }: {
  valor: T; opcoes: { valor: T; rotulo: string }[]; onMudar: (v: T) => void; id?: string; placeholder?: string;
}) {
  return (
    <select
      id={id}
      value={String(valor)}
      onChange={e => {
        const op = opcoes.find(o => String(o.valor) === e.target.value);
        if (op) onMudar(op.valor);
      }}
      className={estiloCampo}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {opcoes.map(o => <option key={String(o.valor)} value={String(o.valor)}>{o.rotulo}</option>)}
    </select>
  );
}
