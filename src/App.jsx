import './App.css';
import React, { useState } from 'react';
import OrderModal from './OrderModal';

function App({ setOrderModalOpen }) {
  return (
    <div className="crew-threads-landing">
      {/* Header/Nav */}
      <header className="ct-header">
        <img src="/images/crewthreads-logo.png" alt="Crew Threads Logo" className="ct-logo" />
        <nav className="ct-nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#sizes">Sizes</a>
          <button className="ct-btn ct-btn-primary" style={{marginLeft: '1rem'}} onClick={() => setOrderModalOpen(true)}>Order Now</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="ct-hero">
        <h1>Pilot Shirts Built for Comfort in and out of the Cockpit</h1>
        <p className="ct-hero-sub">Premium white pilot performance shirts with aviation-ready details, breathable fabric, hidden utility features, and shoulder epaulettes for rank.</p>
        {/* <div className="ct-price">Limited inventory — $24 each</div> */}
        <div className="ct-hero-cta">
          <button className="ct-btn ct-btn-primary" onClick={() => setOrderModalOpen(true)}>Order Now</button>
          <a href="#features" className="ct-btn ct-btn-secondary">View Features</a>
        </div>
        {/* Add your hero image here if available */}
        {/* <img src="/images/shirt-front.jpg" alt="Crew Threads Pilot Shirt" className="ct-hero-img" /> */}
        <div className="ct-hero-brand-desc">
          <strong>Crew Threads</strong> is a small-batch pilot apparel brand focused on rethinking the standard pilot shirt. Our performance shirts are designed for pilots, instructors, students, and aviation professionals who want comfort, utility, and a professional look.
        </div>
      </section>

      {/* Features Section */}
      <section className="ct-features" id="features">
        <h2>Shirt Features</h2>
        <div className="ct-feature-grid">
          <div className="ct-feature-card"><strong>Shoulder Epaulettes</strong><br />Designed for pilot rank placement. Easily add or remove rank stripes for a professional look.</div>
          <div className="ct-feature-card"><strong>Sweat-Wicking Collar</strong><br />Inner collar lined with sweat-wicking material to keep your neckline dry and comfortable during long days.</div>
          <div className="ct-feature-card"><strong>Hidden Glasses Loop</strong><br />A small, hidden slit/loop for sunglasses or glasses—keeps your eyewear secure and handy.</div>
          <div className="ct-feature-card"><strong>Breathable Underarm Mesh</strong><br />Hidden mesh gusset under the arms for extra airflow and ventilation, even in hot cockpits.</div>
          <div className="ct-feature-card"><strong>Secure Pocket</strong><br />Right chest pocket with magnetic/secure closure for pens, phone, or small items.</div>
          <div className="ct-feature-card"><strong>Longer Back Fit</strong><br />Shirt is cut longer in the back so it stays tucked in while sitting, standing, or moving around.</div>
          <div className="ct-feature-card"><strong>Premium Material</strong><br />Comfortable, durable, wrinkle-resistant, and performance-focused for long workdays.</div>
          <div className="ct-feature-card"><strong>Made in Colombia</strong><br />Quality construction and thoughtful design from a country known for premium textiles.</div>
        </div>
      </section>

      {/* About Section */}
      <section className="ct-about" id="about">
        <h2>About Crew Threads</h2>
        <p>Crew Threads was created to rethink the standard pilot shirt. Instead of a stiff, uncomfortable uniform top, these shirts were designed with performance materials, breathable construction, and hidden utility features that make sense for pilots.</p>
        <div className="ct-about-highlights">
          <strong>Product highlights:</strong><br />
          • Professional pilot uniform look<br />
          • Athletic/performance features for comfort<br />
          • Designed for real cockpit use<br />
          {/* • Limited inventory – order before they're gone! */}
        </div>
      </section>

      {/* Sizes Section */}
      <section className="ct-sizes" id="sizes">
        <h2>Sizes & Pricing</h2>
        <p>Available in men’s fit only. Sizes range from S–XXL depending on inventory.</p>
        <table className="ct-sizes-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Color</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S, M, L, XL, XXL</td>
              <td>White</td>
              <td>$34</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Order/Contact Section */}
      <section className="ct-order" id="order">
        <h2>Order Now</h2>
        <p>Ready to get your Crew Threads shirt? Click the button below to order and pay securely online.</p>
        <button className="ct-btn ct-btn-primary" onClick={() => setOrderModalOpen(true)}>
          Order Now
        </button>
      </section>

      {/* Footer */}
      <footer className="ct-footer">
        Crew Threads<br />
        Limited pilot performance shirts available while inventory lasts.<br />
        &copy; 2026
      </footer>
    </div>
  );
}

function AppWrapper() {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  return (
    <>
      <App setOrderModalOpen={setOrderModalOpen} />
      <OrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} />
    </>
  );
}

export default AppWrapper;
