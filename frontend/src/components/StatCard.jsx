export default function StatCard({ title, value, sub, icon, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, border: '0.5px solid #e2e8f0',
      borderLeft: `3px solid ${color || '#1a6b3a'}`,
      display: 'flex', alignItems: 'center', gap: 14, flex: 1, padding: '16px 20px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        background: `${color || '#1a6b3a'}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: color || '#1a6b3a' }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}