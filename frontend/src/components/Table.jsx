export default function Table({ columns, data }) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {columns.map((col) => (
                <th key={col} style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  color: '#64748b',
                  fontWeight: '400',
                  borderBottom: '0.5px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                {columns.map((col) => (
                  <td key={col} style={{
                    padding: '10px 12px',
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                  }}>
                    {col === 'Status' ? (
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        background:
                          row[col] === 'Confirmed' ? '#e8f5ee' :
                          row[col] === 'Pending' ? '#fef9e7' : '#fdecea',
                        color:
                          row[col] === 'Confirmed' ? '#1a6b3a' :
                          row[col] === 'Pending' ? '#b7770d' : '#c0392b',
                      }}>
                        {row[col]}
                      </span>
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }