export default function Message({ show, message }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 18,
      right: 24,
      zIndex: 999999,
      minWidth: 220,
      background: message.type === 'success' ? '#f6ffed' : message.type === 'error' ? '#fff2f0' : message.type === 'warning' ? '#fffbe6' : '#e6f4ff',
      color: message.type === 'success' ? '#52c41a' : message.type === 'error' ? '#f5222d' : message.type === 'warning' ? '#faad14' : '#1677ff',
      border: `1.5px solid ${message.type === 'success' ? '#b7eb8f' : message.type === 'error' ? '#ffccc7' : message.type === 'warning' ? '#ffe58f' : '#91d5ff'}`,
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
      padding: '12px 22px 12px 18px',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'opacity 0.25s',
      opacity: show ? 1 : 0
    }}>
      <span style={{fontSize:20,display:'inline-flex',alignItems:'center'}}>
        {message.type === 'success' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#52c41a" strokeWidth="2" fill="#f6ffed"/><path d="M6.5 10.5l2 2 5-5" stroke="#52c41a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        {message.type === 'error' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#f5222d" strokeWidth="2" fill="#fff2f0"/><path d="M10 6v5" stroke="#f5222d" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#f5222d"/></svg>
        )}
        {message.type === 'warning' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#faad14" strokeWidth="2" fill="#fffbe6"/><path d="M10 6v5" stroke="#faad14" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#faad14"/></svg>
        )}
        {message.type === 'info' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#1677ff" strokeWidth="2" fill="#e6f4ff"/><path d="M10 7v5" stroke="#1677ff" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#1677ff"/></svg>
        )}
      </span>
      <span style={{fontSize:15,lineHeight:1.6}}>{message.text}</span>
    </div>
  );
} 