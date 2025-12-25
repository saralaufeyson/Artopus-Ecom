import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Exceptional Art</h1>
          <p className="hero-subtitle">
            Explore curated collections from talented artists worldwide
          </p>
          <Link to="/shop" className="hero-button">
            Browse Collection
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-container">
          <h2 className="section-title">Featured Artworks</h2>
          <div className="artwork-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="artwork-card">
                <div className="artwork-image-placeholder">
                  <span>Artwork {item}</span>
                </div>
                <div className="artwork-info">
                  <h3 className="artwork-title">Art Title {item}</h3>
                  <p className="artwork-artist">Artist Name</p>
                  <p className="artwork-price">${(item * 250).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
