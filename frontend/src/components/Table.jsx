export default function Table({ columns, data, onView, onEdit, onDelete }) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {columns.map((col) => (
                <th key={col} style={{
                  textAlign: 'left', padding: '12px 16px',
                  color: '#64748b', fontWeight: '400',
                  borderBottom: '1px solid #f1f5f9',
                  whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: '400', borderBottom: '1px solid #f1f5f9' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                  {columns.map((col) => (
                    <td key={col} style={{ padding: '12px 16px', color: '#1e293b', whiteSpace: 'nowrap' }}>
                      {col === 'Status' ? (
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                          background:
                            row[col] === 'Confirmed' || row[col] === 'Active' || row[col] === 'done' ? '#e8f5ee' :
                            row[col] === 'Pending' || row[col] === 'pending' ? '#fef9e7' : '#fdecea',
                          color:
                            row[col] === 'Confirmed' || row[col] === 'Active' || row[col] === 'done' ? '#1a6b3a' :
                            row[col] === 'Pending' || row[col] === 'pending' ? '#b7770d' : '#c0392b',
                        }}>
                          {row[col]}
                        </span>
                      ) : (
                        row[col] || '—'
                      )}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {onView && (
                        <button onClick={() => onView(row)} style={{
                          padding: '4px 10px', borderRadius: '4px', fontSize: '11px',
                          cursor: 'pointer', border: '1px solid #2980b9',
                          color: '#2980b9', background: '#fff', marginRight: '4px',
                        }}>View</button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(row)} style={{
                          padding: '4px 10px', borderRadius: '4px', fontSize: '11px',
                          cursor: 'pointer', border: '1px solid #e67e22',
                          color: '#e67e22', background: '#fff', marginRight: '4px',
                        }}>Edit</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} style={{
                          padding: '4px 10px', borderRadius: '4px', fontSize: '11px',
                          cursor: 'pointer', border: '1px solid #e74c3c',
                          color: '#e74c3c', background: '#fff',
                        }}>Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }