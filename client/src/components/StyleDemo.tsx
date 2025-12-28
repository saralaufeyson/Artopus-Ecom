import React from 'react';

const StyleDemo: React.FC = () => {
  return (
    <div>
      {/* Hero Section Demo */}
      <section className="hero-section">
        <div className="container">
          <h1>Artopus India</h1>
          <p>Discover exquisite Indian artwork in our minimalist art gallery. Each piece tells a story of tradition, culture, and contemporary expression.</p>
          <button className="button-primary">Explore Collection</button>
        </div>
      </section>

      {/* Artwork Grid Demo */}
      <div className="container">
        <h2 className="text-center mb-4">Featured Artworks</h2>
        <div className="artwork-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card-shadow">
              <div style={{
                height: '200px',
                background: 'var(--surface-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary-text)'
              }}>
                Artwork {item}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3>Beautiful Painting {item}</h3>
                <p>A stunning piece of Indian art that captures the essence of our cultural heritage.</p>
                <div className="flex-between mt-2">
                  <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>$299</span>
                  <button className="button-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Demo */}
      <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <h2>Typography Showcase</h2>
        <h1>Heading 1 - Artopus India</h1>
        <h2>Heading 2 - Art Gallery</h2>
        <h3>Heading 3 - Featured Works</h3>
        <h4>Heading 4 - Artist Spotlight</h4>
        <h5>Heading 5 - Exhibition</h5>
        <h6>Heading 6 - Details</h6>
        <p>This is a paragraph demonstrating the body text styling with proper line height and color contrast. The typography is designed for optimal readability across all devices and themes.</p>
        <p><a href="#">This is a link</a> that demonstrates the accent color hover effect.</p>
      </div>

      {/* Button Demo */}
      <div className="container text-center" style={{ marginBottom: '4rem' }}>
        <h3>Button Styles</h3>
        <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <button className="button-primary">Primary Button</button>
          <button className="button-primary" style={{ backgroundColor: 'var(--secondary-text)' }}>Secondary Style</button>
        </div>
      </div>
    </div>
  );
};

export default StyleDemo;