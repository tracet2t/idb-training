export function Select({ value, onChange, children, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      {...props}
      style={{
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #dce6f0',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

export function SelectOption({ value, children, ...props }) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
}
