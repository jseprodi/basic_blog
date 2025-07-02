'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  source: string;
}

interface SecurityStats {
  totalEvents: number;
  highSeverity: number;
  blockedRequests: number;
  suspiciousActivity: number;
  last24Hours: number;
}

const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    highSeverity: 0,
    blockedRequests: 0,
    suspiciousActivity: 0,
    last24Hours: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock security events (in production, this would come from a real monitoring service)
  const mockEvents: SecurityEvent[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      event: 'Rate limit exceeded',
      severity: 'medium',
      details: { ip: '192.168.1.100', endpoint: '/api/posts' },
      source: 'API Gateway',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      event: 'Suspicious user agent detected',
      severity: 'low',
      details: { userAgent: 'curl/7.68.0', path: '/api/auth/login' },
      source: 'Middleware',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      event: 'SQL injection attempt blocked',
      severity: 'high',
      details: { 
        input: 'admin\' OR 1=1--',
        field: 'email',
        path: '/api/auth/login'
      },
      source: 'Input Validation',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      event: 'XSS attempt detected',
      severity: 'high',
      details: { 
        input: '<script>alert("xss")</script>',
        field: 'content',
        path: '/api/posts'
      },
      source: 'Content Sanitization',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      event: 'Unauthorized access attempt',
      severity: 'medium',
      details: { 
        path: '/api/posts',
        method: 'POST',
        ip: '203.0.113.1'
      },
      source: 'Authentication',
    },
  ];

  useEffect(() => {
    // Simulate real-time security monitoring
    setEvents(mockEvents);
    
    const interval = setInterval(() => {
      if (autoRefresh) {
        // Add new mock events occasionally
        if (Math.random() < 0.1) {
          const newEvent: SecurityEvent = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            event: 'New security event detected',
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            details: { source: 'Real-time monitoring' },
            source: 'Security Monitor',
          };
          setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    // Calculate stats
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    
    const newStats: SecurityStats = {
      totalEvents: events.length,
      highSeverity: events.filter(e => e.severity === 'high' || e.severity === 'critical').length,
      blockedRequests: events.filter(e => e.event.includes('blocked') || e.event.includes('attempt')).length,
      suspiciousActivity: events.filter(e => e.event.includes('suspicious')).length,
      last24Hours: events.filter(e => new Date(e.timestamp).getTime() > last24Hours).length,
    };
    
    setStats(newStats);
  }, [events]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Shield className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Security Monitor"
        >
          <Shield className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">Security Monitor</h3>
          {stats.highSeverity > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {stats.highSeverity} alerts
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600' : 'bg-gray-400'}`} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.highSeverity}</div>
            <div className="text-gray-600">High Severity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.blockedRequests}</div>
            <div className="text-gray-600">Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.last24Hours}</div>
            <div className="text-gray-600">Last 24h</div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No security events detected
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                    {getSeverityIcon(event.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.event}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Source: {event.source}
                    </p>
                    {event.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Real-time monitoring active</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitor; 