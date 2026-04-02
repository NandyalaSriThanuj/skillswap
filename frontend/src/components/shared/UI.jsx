// src/components/shared/UI.jsx
// Reusable dark-theme primitives matching barter.html design

import React from 'react';

// ── Card ──────────────────────────────────────────────
export const Card = ({ children, style = {}, hover = true, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
      transition: 'all .2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
    onMouseOver={hover ? e => {
      e.currentTarget.style.background = 'var(--card-hover)';
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,99,255,.15)';
    } : undefined}
    onMouseOut={hover ? e => {
      e.currentTarget.style.background = 'var(--surface)';
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    } : undefined}
  >
    {children}
  </div>
);

// ── Btn variants ──────────────────────────────────────
const btnBase = {
  padding: '10px 22px', borderRadius: 8,
  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14,
  cursor: 'pointer', border: 'none', transition: 'all .2s',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};

export const BtnPrimary = ({ children, onClick, style = {}, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ ...btnBase, background: 'var(--accent)', color: 'white', opacity: disabled ? .5 : 1, ...style }}
    onMouseOver={e => !disabled && (e.currentTarget.style.background = '#7d75ff')}
    onMouseOut={e => (e.currentTarget.style.background = 'var(--accent)')}
  >{children}</button>
);

export const BtnGhost = ({ children, onClick, style = {}, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ ...btnBase, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', opacity: disabled ? .5 : 1, ...style }}
    onMouseOver={e => { e.currentTarget.style.color='var(--text)'; e.currentTarget.style.borderColor='var(--accent)'; }}
    onMouseOut={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
  >{children}</button>
);

export const BtnDanger = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{ ...btnBase, background: 'var(--accent2)', color: 'white', ...style }}
    onMouseOver={e => (e.currentTarget.style.background = '#ff8080')}
    onMouseOut={e => (e.currentTarget.style.background = 'var(--accent2)')}
  >{children}</button>
);

export const BtnSuccess = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{ ...btnBase, background: 'var(--accent3)', color: '#0a0a0f', ...style }}
    onMouseOver={e => (e.currentTarget.style.background = '#5fffaa')}
    onMouseOut={e => (e.currentTarget.style.background = 'var(--accent3)')}
  >{children}</button>
);

export const BtnGold = ({ children, onClick, style = {}, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ ...btnBase, background: 'linear-gradient(135deg,#ffd700,#ffaa00)', color: '#1a1100', fontWeight: 700, opacity: disabled ? .5 : 1, ...style }}
  >{children}</button>
);

// ── Input / Select / Textarea ──────────────────────────
const inputStyle = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  padding: '12px 16px',
  borderRadius: 10,
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color .2s',
};

export const Input = ({ style = {}, ...props }) => (
  <input
    style={{ ...inputStyle, ...style }}
    onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,.1)'; }}
    onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
    {...props}
  />
);

export const Select = ({ children, style = {}, ...props }) => (
  <select
    style={{ ...inputStyle, ...style }}
    onFocus={e => { e.target.style.borderColor='var(--accent)'; }}
    onBlur={e => { e.target.style.borderColor='var(--border)'; }}
    {...props}
  >{children}</select>
);

export const Textarea = ({ style = {}, ...props }) => (
  <textarea
    style={{ ...inputStyle, resize: 'vertical', ...style }}
    onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,.1)'; }}
    onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
    {...props}
  />
);

// ── Label ──────────────────────────────────────────────
export const Label = ({ children }) => (
  <label style={{
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--muted)', marginBottom: 8,
    letterSpacing: '0.5px', textTransform: 'uppercase',
  }}>{children}</label>
);

// ── FormGroup ──────────────────────────────────────────
export const FormGroup = ({ label, children, style = {} }) => (
  <div style={{ marginBottom: 20, ...style }}>
    {label && <Label>{label}</Label>}
    {children}
  </div>
);

// ── Avatar ──────────────────────────────────────────────
export const Avatar = ({ name, photo, size = 52, fontSize = 20 }) => {
  const src = photo
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${photo}`
    : null;

  return src ? (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Clash Display, sans-serif', fontWeight: 700,
      fontSize, color: 'white',
    }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
};

// ── LevelBadge (UPDATED: emojis removed) ─────────────────
export const LevelBadge = ({ level }) => {
  const map = {
    experienced: { label: 'Experienced', color: 'rgba(255,107,107,.15)', border: 'rgba(255,107,107,.3)', text: 'var(--exp,#ff6b6b)' },
    mid:         { label: 'Mid-Level',   color: 'rgba(108,99,255,.15)',  border: 'rgba(108,99,255,.3)',  text: 'var(--mid,#6c63ff)' },
    beginner:    { label: 'Beginner',    color: 'rgba(67,233,123,.15)',  border: 'rgba(67,233,123,.3)',  text: 'var(--beg,#43e97b)' },
  };
  const cfg = map[level] || map.beginner;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 100,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.5px',
      background: cfg.color, border: `1px solid ${cfg.border}`, color: cfg.text,
    }}>{cfg.label}</span>
  );
};

// ── Remaining code unchanged ───────────────────────────
export const SkillChip = ({ children, selected, onClick, onRemove }) => (
  <span
    onClick={onClick}
    style={{
      padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      background: selected ? 'rgba(108,99,255,.2)' : 'var(--surface2)',
      color: selected ? 'var(--accent)' : 'var(--muted)',
      cursor: onClick ? 'pointer' : 'default',
      userSelect: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
      transition: 'all .15s',
    }}
  >
    {children}
    {onRemove && (
      <span onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{ fontWeight: 700, marginLeft: 2, cursor: 'pointer', opacity: .7 }}>×</span>
    )}
  </span>
);

export const Stars = ({ rating = 0, size = 16 }) => (
  <span>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? 'var(--gold)' : 'var(--border)', fontSize: size }}>★</span>
    ))}
  </span>
);

export const StatusBadge = ({ status }) => {
  const map = {
    pending:   { bg: 'rgba(255,170,0,.15)', border: 'rgba(255,170,0,.3)', color: '#ffaa00', label: 'Pending' },
    accepted:  { bg: 'rgba(67,233,123,.15)', border: 'rgba(67,233,123,.3)', color: 'var(--accent3)', label: 'Active' },
    rejected:  { bg: 'rgba(255,107,107,.15)', border: 'rgba(255,107,107,.3)', color: 'var(--accent2)', label: 'Declined' },
    completed: { bg: 'rgba(108,99,255,.15)', border: 'rgba(108,99,255,.3)', color: 'var(--accent)', label: 'Completed' },
    cancelled: { bg: 'rgba(107,107,138,.1)', border: 'rgba(107,107,138,.2)', color: 'var(--muted)', label: 'Cancelled' },
  };
  const cfg = map[status] || map.pending;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
    }}>{cfg.label}</span>
  );
};

export const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{children}</h2>
    {sub && <p style={{ color: 'var(--muted)', fontSize: 16 }}>{sub}</p>}
  </div>
);

export const ProgressBar = ({ pct }) => (
  <div style={{ width: '100%', height: 8, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden' }}>
    <div style={{
      width: `${pct}%`, height: '100%',
      background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
      borderRadius: 100, transition: 'width .6s ease',
    }} />
  </div>
);

export const Spinner = ({ size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `3px solid var(--border)`, borderTopColor: 'var(--accent)',
    animation: 'spin 1s linear infinite',
  }} />
);

export const Modal = ({ open, onClose, children, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: 40, width: '100%', maxWidth,
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeUp .2s ease',
      }}>
        {children}
      </div>
    </div>
  );
};