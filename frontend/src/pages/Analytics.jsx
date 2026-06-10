import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDateRange, setShowDateRange] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [period, dateRange.start, dateRange.end, showDateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching analytics...');
      
      const payload = { period };
      if (showDateRange && dateRange.start && dateRange.end) {
        payload.dateRange = dateRange;
      }
      
      const res = await axiosInstance.post('/api/analytics/stats', payload);
      console.log('Analytics response:', res.data);
      
      if (res.data && res.data.success) {
        setStats(res.data.stats);
      } else {
        setStats(null);
        setError('No data available');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      let errorMessage = 'Failed to load analytics. ';
      if (err.response?.status === 401) {
        errorMessage += 'Please login again.';
      } else if (err.response?.status === 404) {
        errorMessage += 'Analytics endpoint not found.';
      } else {
        errorMessage += err.message || 'Please try again later.';
      }
      setError(errorMessage);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = async () => {
    setCalculating(true);
    try {
      await axiosInstance.post('/api/analytics/calculate-summary', { periodType: 'monthly' });
      alert('Analytics summary calculated successfully!');
      fetchStats();
    } catch (err) {
      console.error('Error calculating summary:', err);
      alert('Failed to calculate summary');
    } finally {
      setCalculating(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      view: '👁️', create: '➕', edit: '✏️', delete: '🗑️',
      login: '🔑', logout: '🚪', book: '📅', cancel: '❌',
      confirm: '✅', complete: '✔️'
    };
    return icons[action] || '📊';
  };

  const getEntityIcon = (entity) => {
    const icons = {
      appointment: '📅', patient: '👤', doctor: '👨‍⚕️',
      profile: '👤', department: '🏥', dashboard: '📊',
      auth: '🔐', analytics: '📈'
    };
    return icons[entity] || '📋';
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar active="Analytics" />
        <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132, textAlign: 'center' }}>
          Loading analytics...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar active="Analytics" />
      
      <div style={{ background: '#f0f7f3', flex: 1, padding: '24px 32px', marginTop: 132 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a', margin: 0 }}>Activity Analytics</h2>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Track your activity and productivity insights</p>
          </div>
          <button
            onClick={calculateSummary}
            disabled={calculating}
            style={{
              padding: '8px 16px',
              background: calculating ? '#6dab89' : '#1a6b3a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: calculating ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            {calculating ? 'Calculating...' : '🔄 Recalculate Stats'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fdecea',
            color: '#c0392b',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', marginRight: 8 }}>Period:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', marginRight: 8 }}>
                <input
                  type="checkbox"
                  checked={showDateRange}
                  onChange={(e) => setShowDateRange(e.target.checked)}
                  style={{ marginRight: 4 }}
                />
                Custom Range:
              </label>
              {showDateRange && (
                <>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #e2e8f0', marginLeft: 8 }}
                  />
                  <span style={{ margin: '0 8px' }}>to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}
                  />
                </>
              )}
            </div>
            <button
              onClick={fetchStats}
              style={{ padding: '6px 16px', background: '#1a6b3a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, borderLeft: '4px solid #1a6b3a' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Total Actions</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1a6b3a' }}>{stats?.total_actions || 0}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>in selected period</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, borderLeft: '4px solid #2980b9' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Peak Activity Hour</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#2980b9' }}>{stats?.peak_hour?.hour || 0}:00</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{stats?.peak_hour?.count || 0} actions</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, borderLeft: '4px solid #e67e22' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Most Common Action</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#e67e22' }}>
              {stats?.actions_by_type?.[0]?.action_type || 'None'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{stats?.actions_by_type?.[0]?.count || 0} times</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, borderLeft: '4px solid #9b59b6' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Sections Visited</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#9b59b6' }}>{stats?.most_visited?.length || 0}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>different sections</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          
          {/* Actions by Type */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16 }}>Actions by Type</h3>
            {stats?.actions_by_type && stats.actions_by_type.length > 0 ? (
              stats.actions_by_type.map((item, idx) => {
                const percentage = stats.total_actions > 0 ? (item.count / stats.total_actions) * 100 : 0;
                return (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{getActionIcon(item.action_type)} {item.action_type}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{item.count}</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentage}%`,
                        background: '#1a6b3a',
                        height: 8,
                        borderRadius: 4
                      }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No data available</div>
            )}
          </div>

          {/* Most Visited Sections */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16 }}>Most Visited Sections</h3>
            {stats?.most_visited && stats.most_visited.length > 0 ? (
              stats.most_visited.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{getEntityIcon(item.entity_type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{item.entity_type}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.visit_count} visits</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a6b3a' }}>{item.visit_count}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No data available</div>
            )}
          </div>

          {/* Daily Activity Chart */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16 }}>Daily Activity (Last 14 days)</h3>
            {stats?.daily_activity && stats.daily_activity.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 8, minWidth: 500 }}>
                  {stats.daily_activity.slice(0, 14).map((day, idx) => {
                    const maxCount = Math.max(...stats.daily_activity.map(d => d.count));
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: `${Math.min(height, 150)}px`,
                          background: '#1a6b3a',
                          width: '100%',
                          borderRadius: 4,
                          marginBottom: 8
                        }} />
                        <div style={{ fontSize: 10, color: '#64748b' }}>
                          {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{day.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No activity data available</div>
            )}
          </div>

          {/* Hourly Activity Chart */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16 }}>Activity by Hour</h3>
            {stats?.hourly_activity && stats.hourly_activity.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 4, minWidth: 500 }}>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hourData = stats.hourly_activity.find(h => h.hour === i) || { count: 0 };
                    const maxCount = Math.max(...stats.hourly_activity.map(h => h.count));
                    const height = maxCount > 0 ? (hourData.count / maxCount) * 100 : 0;
                    return (
                      <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: `${Math.min(height, 120)}px`,
                          background: hourData.count > 0 ? '#1a6b3a' : '#e2e8f0',
                          width: '100%',
                          borderRadius: 4,
                          marginBottom: 8
                        }} />
                        <div style={{ fontSize: 9, color: '#64748b' }}>{i}:00</div>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{hourData.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No activity data available</div>
            )}
          </div>

          {/* Recent Activities */}
          <div style={{ gridColumn: 'span 2', background: '#fff', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a6b3a', marginBottom: 16 }}>Recent Activities</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                stats.recent_activities.map((activity, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <div style={{ fontSize: 20 }}>{getActionIcon(activity.action_type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>
                        <strong>{activity.action_type}</strong> {activity.entity_type}
                        {activity.entity_id && ` #${activity.entity_id}`}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{activity.description || 'No description'}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No recent activities</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}