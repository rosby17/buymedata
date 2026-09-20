"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./BrandSelect.module.css";

type Option = { value: string; label: string };
export default function BrandSelect({ label, options, value, defaultValue, onChange, name, className = "", disabled = false }: {
  label: string; options: Option[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; name?: string; className?: string; disabled?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = value ?? internal;
  const index = Math.max(0, options.findIndex(option => option.value === selected));
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    const form = root.current?.closest("form");
    const reset = () => { setInternal(defaultValue ?? options[0]?.value ?? ""); setOpen(false); };
    form?.addEventListener("reset", reset);
    return () => { document.removeEventListener("pointerdown", outside); form?.removeEventListener("reset", reset); };
  }, [defaultValue, options]);
  useEffect(() => { if (open) list.current?.focus(); }, [open]);
  useEffect(() => { if (open) list.current?.children[active]?.scrollIntoView({block:"nearest"}); }, [active,open]);
  function choose(i: number) { const option = options[i]; if (!option) return; setInternal(option.value); onChange?.(option.value); setOpen(false); button.current?.focus(); }
  return <div className={`${styles.root} ${className}`} ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    {name && <input type="hidden" name={name} value={selected} disabled={disabled}/>}
    <button ref={button} type="button" className={styles.trigger} disabled={disabled} aria-label={label}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => { setActive(index); setOpen(!open); }}
      onKeyDown={event => { if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setActive(index); setOpen(true); } }}>
      {options[index]?.label}<span aria-hidden="true">⌄</span>
    </button>
    {open && <ul id={id} ref={list} tabIndex={-1} role="listbox" aria-label={label} aria-activedescendant={id + "-" + active} className={styles.list}
      onKeyDown={event => {
        if (["ArrowDown","ArrowUp","Home","End"].includes(event.key)) { event.preventDefault(); setActive(i => event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (i + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length); }
        else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
        else if (event.key === "Escape") { event.preventDefault(); setOpen(false); button.current?.focus(); }
        else if (event.key.length === 1) { const i = options.findIndex(o => o.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase())); if (i >= 0) setActive(i); }
      }}>
      {options.map((option, i) => <li key={option.value} id={id + "-" + i} role="option" aria-selected={selected === option.value}
        className={i === active ? styles.active : ""} onPointerMove={() => setActive(i)} onClick={() => choose(i)}>
        {option.label}<span aria-hidden="true">{selected === option.value ? "✓" : ""}</span>
      </li>)}
    </ul>}
  </div>;
}
