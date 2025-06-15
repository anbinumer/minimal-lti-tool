export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Minimal LTI Tool</h1>
      <p>This is a basic LTI tool for Canvas testing.</p>
      <a href="/launch" style={{ 
        display: 'inline-block',
        padding: '10px 20px',
        background: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px'
      }}>
        Test Launch Page
      </a>
    </div>
  );
}
