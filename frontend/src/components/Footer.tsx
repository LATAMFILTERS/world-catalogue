'use client';

export function Footer() {
  return (
    <footer
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.02)',
        padding: '4rem 0 2rem',
      }}
    >
      <style>{`
        .footer-col-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 25px;
        }
        .footer-link {
          font-size: 14px;
          margin-bottom: 12px !important;
          text-decoration: none !important;
          color: #888 !important;
          display: block;
          transition: color 0.3s;
          font-family: Barlow, sans-serif;
        }
        .footer-link:hover { color: #FFF12D !important; }
      `}</style>

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        {/* Grid columnas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px',
            marginBottom: '60px',
          }}
        >
          {/* Company */}
          <div>
            <div className="footer-col-title">Company</div>
            <a
              href="https://elimfilters.com/about-elimfilters/"
              className="footer-link"
            >
              About Us
            </a>
            <a
              href="https://elimfilters.com/industries-we-service/"
              className="footer-link"
            >
              Industries
            </a>
            <a href="https://elimfilters.com/contact-info/" className="footer-link">
              Contact
            </a>
          </div>

          {/* Systems */}
          <div>
            <div className="footer-col-title">Systems</div>
            <a
              href="https://part-search.elimfilters.com/"
              className="footer-link"
            >
              Part Search
            </a>
            <a
              href="https://elimfilters.com/technology/"
              className="footer-link"
            >
              Technology
            </a>
            <a href="https://elimfilters.com/products/" className="footer-link">
              Systems
            </a>
          </div>

          {/* Support */}
          <div>
            <div className="footer-col-title">Support</div>
            <a
              href="https://elimfilters.com/contact-info/"
              className="footer-link"
            >
              Technical Support
            </a>
            <a href="/distributor-application.html" className="footer-link">
              Become a Dealer
            </a>
            <a href="/warranty.html" className="footer-link">
              Warranty
            </a>
          </div>

          {/* Follow Us */}
          <div>
            <div className="footer-col-title">Follow Us</div>
            <a
              href="https://www.linkedin.com/company/elimfilters/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/elimfilters.global"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@elimfilters9112"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              YouTube
            </a>
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '1px solid #1a1a1a',
            paddingTop: '50px',
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '14px',
              color: '#666',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '25px',
            }}
          >
            <strong style={{ color: '#fff' }}>FRISCO, TX</strong> | UNITED STATES
          </div>

          <img
            src="https://elimfilters.com/wp-content/uploads/2025/08/a2ec2ccf-d6ed-4acf-bcda-337b5669f007_removalai_preview.png"
            alt="Authorized Seal"
            style={{
              height: '80px',
              opacity: 0.8,
              margin: '0 auto',
              display: 'block',
            }}
          />

          <p
            style={{
              fontSize: '10px',
              color: '#444',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              marginTop: '40px',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            © 2015-2026 ELIMFILTERS LLC | Intelligence and Engineering in
            Filtration
          </p>
        </div>
      </div>
    </footer>
  );
}
