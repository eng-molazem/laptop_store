import { useState } from 'react';

export default function TagListEditor({ label, items, onChange, type = 'text', suffix = '' }) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const value = draft.trim();
    if (!value) return;
    const normalized = type === 'number' ? Number(value) : value;
    if (type === 'number' && (!normalized || normalized <= 0)) return;
    if (items.some((i) => String(i).toLowerCase() === String(normalized).toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...items, normalized]);
    setDraft('');
  };

  const removeItem = (value) => onChange(items.filter((i) => i !== value));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="form-group">
      <label className="label">{label}</label>
      <div className="tag-list">
        {items.map((item) => (
          <span key={item} className="chip active tag-chip">
            {item}
            {suffix}
            <button type="button" onClick={() => removeItem(item)}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="tag-add-row">
        <input
          className="input"
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب قيمة ثم Enter"
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
          + إضافة
        </button>
      </div>
    </div>
  );
}
