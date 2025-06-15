'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function LaunchContent() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [launchInfo, setLaunchInfo] = useState<any>({});

  useEffect(() => {
    // Collect all URL parameters
    const params = Object.fromEntries(searchParams?.entries() || []);
    
    // Basic environment info
    const info = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      inIframe: window !== window.parent,
      userAgent: navigator.userAgent.substring(0, 100),
      parameters: params
    };
    
    setLaunchInfo(info);
    console.log('LTI Launch Info:', info);
  }, [searchParams]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Success indicator */}
      <div style={{
        backgroundColor: '#d4edda',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #c3e6cb'
      }}>
        <h1 style={{ color: '#155724', margin: '0 0 10px 0' }}>
          ✅ LTI Tool Successfully Launched!
        </h1>
        <p style={{ color: '#155724', margin: 0 }}>
          🚀 {launchInfo.inIframe ? 'Launched from Canvas iframe' : 'Direct access'}
        </p>
      </div>

      {/* Basic info */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Launch Information</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>Time:</strong> {launchInfo.timestamp}</li>
          <li><strong>In iframe:</strong> {launchInfo.inIframe ? 'Yes' : 'No'}</li>
          <li><strong>Referrer:</strong> {launchInfo.referrer || 'None'}</li>
          <li><strong>URL:</strong> {launchInfo.url}</li>
        </ul>
      </div>

      {/* Parameters (if any) */}
      {Object.keys(launchInfo.parameters || {}).length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>URL Parameters</h3>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {JSON.stringify(launchInfo.parameters, null, 2)}
          </pre>
        </div>
      )}

      {/* Simple tool content */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>🛠️ Minimal LTI Tool</h3>
        <p>This is where your actual tool functionality would go.</p>
        <button style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Tool Button
        </button>
      </div>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LaunchContent />
    </Suspense>
  );
} 