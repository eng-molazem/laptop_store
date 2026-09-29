export default function StarRating({ value = 0, size = 16, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="stars" style={{ fontSize: size }}>
      {stars.map((s) => (
        <span
          key={s}
          onClick={onChange ? () => onChange(s) : undefined}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
        >
          {s <= Math.round(value) ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
