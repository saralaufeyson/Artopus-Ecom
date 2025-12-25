import { useParams } from 'react-router-dom';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();

  return (
    <div className="product-details-page">
      <div className="page-container">
        <div className="product-layout">
          <div className="product-image-section">
            <div className="product-main-image">
              <span>Product Image {id}</span>
            </div>
          </div>

          <div className="product-details-section">
            <h1 className="product-name">Artwork Title</h1>
            <p className="product-artist-name">by Artist Name</p>
            <p className="product-price-large">$850.00</p>

            <div className="product-description">
              <h3>About this artwork</h3>
              <p>
                This is a placeholder description for the artwork. It would contain
                details about the piece, the artist's inspiration, materials used,
                and any other relevant information about the artwork.
              </p>
            </div>

            <div className="product-details-list">
              <div className="detail-item">
                <span className="detail-label">Medium:</span>
                <span className="detail-value">Oil on Canvas</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dimensions:</span>
                <span className="detail-value">24" x 36"</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Year:</span>
                <span className="detail-value">2024</span>
              </div>
            </div>

            <button className="add-to-cart-button">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
