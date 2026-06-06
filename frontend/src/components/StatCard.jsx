export default function StatCard({ title, value, sub, icon, color }) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '20px 24px',
        border: '0.5px solid #e2e8f0',
        borderLeft: `3px solid ${color || '#1a6b3a'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
      }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '8px',
          background: `${color || '#1a6b3a'}15`,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '22px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{
            fontSize: '12px', color: '#64748b', marginBottom: '4px',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '24px', fontWeight: '600',
            color: color || '#1a6b3a',
          }}>
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              {sub}
            </div>
          )}
        </div>
      </div>
    );
  }