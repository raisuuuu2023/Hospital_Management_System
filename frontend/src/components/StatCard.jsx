export default function StatCard({ title, value, sub, icon, color }) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '16px',
        borderLeft: `3px solid ${color}`,
        border: '0.5px solid #e2e8f0',
        borderLeftWidth: '3px',
        borderLeftColor: color,
      }}>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginBottom: '6px',
        }}>
          {icon} {title}
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: '500',
          color: color,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#94a3b8',
          marginTop: '4px',
        }}>
          {sub}
        </div>
      </div>
    );
  }