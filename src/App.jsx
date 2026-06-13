import './App.css';
import React, { useEffect, useState } from 'react';
import OrderModal from './OrderModal';

function App({ setOrderModalOpen, onNavigate, cart }) {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const heroCompactBreakpoint = 980;
  const [useCompactHeroImages, setUseCompactHeroImages] = useState(window.innerWidth < heroCompactBreakpoint);

  const heroImages = [
    useCompactHeroImages ? '/images/pilot-header-image-small.png' : '/images/pilot-header-image.png',
    useCompactHeroImages ? '/images/pilot-header-image-small-2.png' : '/images/pilot-header-image-2.png',
  ];

  useEffect(() => {
    const handleResize = () => {
      setUseCompactHeroImages(window.innerWidth < heroCompactBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [heroCompactBreakpoint]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.ct-scroll-reveal');
    if (!revealElements.length) {
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    return () => revealObserver.disconnect();
  }, []);

  const showPreviousHeroImage = () => {
    setActiveHeroIndex((currentIndex) => (currentIndex - 1 + heroImages.length) % heroImages.length);
  };

  const showNextHeroImage = () => {
    setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroImages.length);
  };

  const goToPilotShirtPage = (event) => {
    event.preventDefault();
    onNavigate('/pilot-shirt');
  };

  const goToSizeChart = (event) => {
    event.preventDefault();
    onNavigate('/pilot-shirt?sizeChart=1');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="crew-threads-landing">
      <div className="ct-shipping-banner" aria-label="Free shipping announcement">
        <span className="ct-shipping-banner-icon" aria-hidden="true">✈</span>
        <span>$5 U.S. Shipping</span>
      </div>

      {/* Header/Nav */}
      <header className="ct-header">
        <img src="/images/crewthreads-logo.png" alt="Crew Threads Logo" className="ct-logo" />
        <nav className="ct-nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#sizes">Sizes</a>
          {/* <button className="ct-btn ct-btn-primary" style={{marginLeft: '1rem'}} onClick={() => setOrderModalOpen(true)}>Order Now</button> */}
          <button className="ct-cart-btn" onClick={() => setOrderModalOpen(true)} aria-label={`Shopping cart with ${cartCount} items`}>
            <svg className="ct-cart-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="ct-cart-badge">{cartCount}</span>}
          </button>
        </nav>
      </header>

      <div className="ct-hero-image-wrap">
        {heroImages.map((heroImage, index) => (
          <img
            key={heroImage}
            src={heroImage}
            alt="Crew Threads pilot shirt"
            className={`ct-hero-image${index === activeHeroIndex ? ' is-active' : ''}`}
          />
        ))}
        {activeHeroIndex === 0 && (
          <>
            <img
              src="/images/crewthreads-logo-only.png"
              alt="Crew Threads emblem"
              className="ct-hero-overlay-logo"
            />
            <div className="ct-hero-overlay-tagline">Built for Pilots. Designed for Comfort.</div>
          </>
        )}
        <div className="ct-hero-nav" aria-label="Hero image controls">
          <button
            type="button"
            className="ct-hero-nav-btn"
            onClick={showPreviousHeroImage}
            aria-label="Show previous hero image"
          >
            &#8592;
          </button>
          <button
            type="button"
            className="ct-hero-nav-btn"
            onClick={showNextHeroImage}
            aria-label="Show next hero image"
          >
            &#8594;
          </button>
        </div>
        {/* <h1 className="ct-hero-image-title">Pilot Shirts Built for Comfort in and out of the Cockpit</h1> */}
      </div>

      {/* Hero Section */}
      <section className="ct-hero ct-scroll-reveal">
        <p className="ct-hero-sub">Pilot Shirts Built for Comfort in and out of the Cockpit</p>
        {/* <div className="ct-hero-cta">
          <button className="ct-btn ct-btn-primary" onClick={() => setOrderModalOpen(true)}>Order Now</button>
          <a href="#features" className="ct-btn ct-btn-secondary">View Features</a>
        </div> */}
        {/* Add your hero image here if available */}
        {/* <img src="/images/shirt-front.jpg" alt="Crew Threads Pilot Shirt" className="ct-hero-img" /> */}
        {/* <div className="ct-hero-brand-desc">
          <strong>Crew Threads</strong> is a small-batch pilot apparel brand focused on rethinking the standard pilot shirt. Our performance shirts are designed for pilots, instructors, students, and aviation professionals who want comfort, utility, and a professional look.
        </div> */}
        <a href="/pilot-shirt" className="ct-product-card" onClick={goToPilotShirtPage}>
          <img src="/images/prop-front.png" alt="Crew Threads Pilot Shirt" className="ct-product-card-image" />
          <div className="ct-product-card-title">Pilot Shirt</div>
        </a>
      </section>

      {/* Features Section */}
      <section className="ct-features ct-scroll-reveal" id="features">
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
      <section className="ct-about ct-scroll-reveal" id="about">
        <h2>About Crew Threads</h2>
        <p>Crew Threads was created to rethink the standard pilot shirt. Instead of a stiff, uncomfortable uniform top, these shirts were designed with performance materials, breathable construction, and hidden utility features that make sense for pilots.</p>
      </section>

      {/* Sizes Section */}
      {/* <section className="ct-sizes" id="sizes">
        <h2>Sizes & Pricing</h2>
        <p>Available in men’s fit only. Sizes range from XS–XXL depending on inventory.</p>
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
              <td>XS, S, M, L, XL, XXL</td>
              <td>White</td>
              <td>$34</td>
            </tr>
          </tbody>
        </table>
        <a href="/pilot-shirt?sizeChart=1" className="ct-sizes-chart-link" onClick={goToSizeChart}>View Size Chart</a>
      </section> */}

      {/* Order/Contact Section */}
      {/* <section className="ct-order" id="order">
        <h2>Order Now</h2>
        <p>Ready to get your Crew Threads shirt? Click the button below to order and pay securely online.</p>
        <button className="ct-btn ct-btn-primary" onClick={() => setOrderModalOpen(true)}>
          Order Now
        </button>
      </section> */}

      {/* Footer */}
      <footer className="ct-footer">
        <img src="/images/crewthreads-white-logo.png" alt="Crew Threads emblem" className="ct-footer-logo" />
        <div className="ct-footer-title">Crew Threads</div>
        <div className="ct-footer-meta">
          <a className="ct-footer-contact-link" href="mailto:haatchedinterns@gmail.com">Contact Us</a>
          <span>&copy; 2026</span>
        </div>
      </footer>
    </div>
  );
}

function PilotShirtPage({ setOrderModalOpen, onNavigate, cart, addToCart }) {
  const shirtUnitPrice = 34.50;
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isPhoneGallery, setIsPhoneGallery] = useState(window.innerWidth <= 700);
  const [thumbnailPage, setThumbnailPage] = useState(0);
  const [cartNotice, setCartNotice] = useState('');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  const productImages = [
    { src: '/images/prop-front.png', alt: 'Front view' },
    { src: '/images/prop-full-body.png', alt: 'Full body view' },
    { src: '/images/prop-back.png', alt: 'Back view' },
    { src: '/images/prop-pocket.png', alt: 'Pocket detail' },
    { src: '/images/prop-armpit.png', alt: 'Armpit ventilation' },
    { src: '/images/shirt-mock.png', alt: 'Shirt mockup' },
  ];

  const sizeChartRows = [
    { size: 'XS', neck: '14.0', chest: '32.0', shirtLength: '29.0', sleeveLength: '17.0' },
    { size: 'S', neck: '14.5', chest: '36.0', shirtLength: '30.0', sleeveLength: '17.5' },
    { size: 'M', neck: '15.5', chest: '40.0', shirtLength: '30.0', sleeveLength: '18.5' },
    { size: 'L', neck: '17.5', chest: '44.0', shirtLength: '31.0', sleeveLength: '20.0' },
    { size: 'XL', neck: '19.0', chest: '48.0', shirtLength: '32.0', sleeveLength: '21.0' },
    { size: 'XXL', neck: '20.5', chest: '52.0', shirtLength: '33.0', sleeveLength: '22.0' },
  ];

  const productFeatureHighlights = [
    // 'Made from recycled materials including 49% rayon from bamboo, 47% polyester, and 4% spandex.',
    // 'Pen/Glasses holder, breathable underarm, magnetic pockets, sweat-resistant pocket.',
    'Premium Quality',
    '49% Rayon from Bamboo, 47% Polyester, 4% Spandex',
    'Sweat-resistant collar',
    'Breathable underarm mesh',
    'Magnetic pocket',
    'Hidden glasses loop',
  ];

  const thumbnailsPerPage = 4;
  const totalThumbnailPages = Math.ceil(productImages.length / thumbnailsPerPage);
  const visibleThumbnailStart = isPhoneGallery ? thumbnailPage * thumbnailsPerPage : 0;
  const visibleThumbnails = isPhoneGallery
    ? productImages.slice(visibleThumbnailStart, visibleThumbnailStart + thumbnailsPerPage)
    : productImages;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    const addedSize = selectedSize;
    const addedQuantity = quantity;
    addToCart(selectedSize, quantity);
    setSelectedSize('');
    setQuantity(1);
    setCartNotice(`Added ${addedQuantity} ${addedSize} shirt(s) to cart.`);
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setQuantity(val);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity < 1) setQuantity(1);
    if (quantity > 10) setQuantity(10);
  };

  const goBackHome = (event) => {
    event.preventDefault();
    onNavigate('/');
  };

  const getGalleryImageClass = (src) => {
    const isShirtMock = src.includes('shirt-mock');
    return `ct-product-page-image${isShirtMock ? ' is-shirt-mock' : ' is-prop-image'}`;
  };

  const getThumbnailImageClass = (src) => {
    const isShirtMock = src.includes('shirt-mock');
    return isShirtMock ? 'is-shirt-mock' : 'is-prop-image';
  };

  const openImageZoom = () => {
    setIsImageZoomOpen(true);
  };

  const closeImageZoom = () => {
    setIsImageZoomOpen(false);
  };

  const openSizeChart = () => {
    setIsSizeChartOpen(true);
  };

  const closeSizeChart = () => {
    setIsSizeChartOpen(false);
  };

  const showNextThumbnailPage = () => {
    setThumbnailPage((currentPage) => (currentPage + 1) % totalThumbnailPages);
  };

  useEffect(() => {
    if (!isImageZoomOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeImageZoom();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImageZoomOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sizeChart') === '1') {
      setIsSizeChartOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsPhoneGallery(window.innerWidth <= 700);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isPhoneGallery) {
      setThumbnailPage(0);
      return;
    }

    const nextPage = Math.floor(selectedImageIndex / thumbnailsPerPage);
    setThumbnailPage(nextPage);
  }, [isPhoneGallery, selectedImageIndex]);

  useEffect(() => {
    if (!cartNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCartNotice('');
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [cartNotice]);

  return (
    <div className="crew-threads-landing ct-product-page">
      <header className="ct-header">
        <a href="/" className="ct-logo-link" onClick={goBackHome}>
          <img src="/images/crewthreads-logo.png" alt="Crew Threads Logo" className="ct-logo" />
        </a>
        <nav className="ct-nav">
          <a href="/" onClick={goBackHome}>Home</a>
          <button className="ct-cart-btn" onClick={() => setOrderModalOpen(true)} aria-label={`Shopping cart with ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}>
            <svg className="ct-cart-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && <span className="ct-cart-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button>
        </nav>
      </header>

      <main className="ct-product-page-main">
        <div className="ct-product-gallery-section">
          <div className="ct-product-thumbnails-row">
            <div className="ct-product-thumbnails">
              {visibleThumbnails.map((image, index) => {
                const resolvedIndex = visibleThumbnailStart + index;
                return (
                <button
                  key={image.src}
                  className={`ct-product-thumbnail${resolvedIndex === selectedImageIndex ? ' is-active' : ''}`}
                  onClick={() => setSelectedImageIndex(resolvedIndex)}
                  aria-label={`View ${image.alt}`}
                >
                  <img src={image.src} alt={image.alt} className={getThumbnailImageClass(image.src)} />
                </button>
                );
              })}
            </div>
            {isPhoneGallery && totalThumbnailPages > 1 && (
              <button
                type="button"
                className="ct-thumb-scroll-btn"
                onClick={showNextThumbnailPage}
                aria-label="Show more thumbnails"
              >
                &#8594;
              </button>
            )}
          </div>
          <div className="ct-product-page-image-wrap">
            <img
              src={productImages[selectedImageIndex].src}
              alt={productImages[selectedImageIndex].alt}
              className={getGalleryImageClass(productImages[selectedImageIndex].src)}
              role="button"
              tabIndex={0}
              onClick={openImageZoom}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openImageZoom();
                }
              }}
              aria-label={`Zoom ${productImages[selectedImageIndex].alt} image`}
            />
          </div>
        </div>
        <div className="ct-product-page-content">
          {/* <p className="ct-product-page-kicker">/pilot-shirt</p> */}
          <h1>Pilot Shirts</h1>
          <p>
            A modern flight shirt built for long days in the cockpit, with the professional look you want and the comfort details you actually notice.
          </p>
          <div className="ct-product-price">${shirtUnitPrice.toFixed(2)} each</div>

          <div className="ct-product-selectors">
            <div className="ct-size-selector">
              <label htmlFor="size-select">Size:</label>
              <select 
                id="size-select"
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Choose a size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="ct-quantity-selector">
              <label htmlFor="quantity-input">Quantity:</label>
              <input
                id="quantity-input"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
              />
            </div>
          </div>

          <div className="ct-product-actions-group">
            <div className="ct-product-page-actions">
              <button className="ct-btn ct-btn-primary" onClick={handleAddToCart}>Add to Cart</button>
              <button className="ct-btn ct-btn-secondary" onClick={() => setOrderModalOpen(true)}>
                View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
            </div>
            <div className="ct-product-mini-features" aria-label="Pilot shirt features">
              <h3>Features</h3>
              <ul>
                {productFeatureHighlights.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="ct-size-chart-trigger-row">
              <button className="ct-size-chart-trigger" onClick={openSizeChart}>View Size Chart</button>
            </div>
          </div>
        </div>
      </main>

      {cartNotice && (
        <div className="ct-cart-notice" role="status" aria-live="polite">
          {cartNotice}
        </div>
      )}

      {/* Footer */}
      <footer className="ct-footer">
        <img src="/images/crewthreads-white-logo.png" alt="Crew Threads emblem" className="ct-footer-logo" />
        <div className="ct-footer-title">Crew Threads</div>
        <div className="ct-footer-meta">
          <a className="ct-footer-contact-link" href="mailto:haatchedinterns@gmail.com">Contact Us</a>
          <span>&copy; 2026</span>
        </div>
      </footer>

      {isImageZoomOpen && (
        <div
          className="ct-image-zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          onClick={closeImageZoom}
        >
          <button
            type="button"
            className="ct-image-zoom-close"
            onClick={closeImageZoom}
            aria-label="Close zoomed image"
          >
            &times;
          </button>
          <img
            src={productImages[selectedImageIndex].src}
            alt={productImages[selectedImageIndex].alt}
            className="ct-image-zoom-content"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {isSizeChartOpen && (
        <div
          className="ct-size-chart-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ct-size-chart-title"
          onClick={closeSizeChart}
        >
          <div className="ct-size-chart-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="ct-size-chart-close"
              onClick={closeSizeChart}
              aria-label="Close size chart"
            >
              &times;
            </button>
            <h2 id="ct-size-chart-title">Crew Threads Size Chart</h2>
            <div className="ct-size-chart-table-wrap">
              <table className="ct-size-chart-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Neck (in)</th>
                    <th>Chest (in)</th>
                    <th>Shirt Length (in)</th>
                    <th>Sleeve Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChartRows.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.neck}</td>
                      <td>{row.chest}</td>
                      <td>{row.shirtLength}</td>
                      <td>{row.sleeveLength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppWrapper() {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [thankYouModalOpen, setThankYouModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [cart, setCart] = useState([]);

  const addToCart = (size, quantity) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          item.size === size ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { size, quantity }];
    });
  };

  const navigateTo = (nextPath) => {
    const nextUrl = new URL(nextPath, window.location.origin);
    const nextFullPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

    if (`${window.location.pathname}${window.location.search}${window.location.hash}` === nextFullPath) {
      return;
    }

    window.history.pushState({}, '', nextFullPath);
    setCurrentPath(nextUrl.pathname);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setThankYouModalOpen(true);
      setCart([]);
      params.delete('checkout');
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showPilotShirtPage = currentPath === '/pilot-shirt' || currentPath === '/flight-order';

  return (
    <>
      {showPilotShirtPage ? (
        <PilotShirtPage setOrderModalOpen={setOrderModalOpen} onNavigate={navigateTo} cart={cart} addToCart={addToCart} />
      ) : (
        <App setOrderModalOpen={setOrderModalOpen} onNavigate={navigateTo} cart={cart} />
      )}
      <OrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} initialCart={cart} />
      {thankYouModalOpen && (
        <div className="ct-success-overlay" role="dialog" aria-modal="true" aria-labelledby="ct-success-title">
          <div className="ct-success-modal">
            <button className="ct-success-close" onClick={() => setThankYouModalOpen(false)} aria-label="Close">&times;</button>
            <h3 id="ct-success-title">Thank You for Your Purchase!</h3>
            <p>Your payment was successful, and your order is now being processed.</p>
            <button className="ct-btn ct-btn-primary" onClick={() => setThankYouModalOpen(false)}>
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AppWrapper;
