// src/app/not-found.tsx
import Link from 'next/link';
import { NextPage } from 'next';

const NotFound: NextPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        404 - Page Not Available
      </h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Sorry, the item you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        href="/" 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          borderRadius: '5px',
          textDecoration: 'none'
        }}
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;