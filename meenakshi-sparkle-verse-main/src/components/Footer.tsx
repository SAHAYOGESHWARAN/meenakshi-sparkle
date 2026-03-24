import { Link } from "react-router-dom";
import { Phone, MapPin, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="gradient-hero text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-display font-bold mb-3 text-gradient-gold inline-block">Meenakshi Universe</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Your one-stop destination for custom frames, photo printing, sublimation gifts, fancy items & beautiful aari works.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm opacity-80">
            <Link to="/shop" className="hover:opacity-100 transition-opacity">Shop All</Link>
            <Link to="/shop?category=gifts" className="hover:opacity-100 transition-opacity">Gifts</Link>
            <Link to="/shop?category=frames" className="hover:opacity-100 transition-opacity">Frames</Link>
            <Link to="/shop?category=aari" className="hover:opacity-100 transition-opacity">Aari Works</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Contact Us</h4>
          <div className="flex flex-col gap-2 text-sm opacity-80">
            <a href="tel:8754885130" className="flex items-center gap-2 hover:opacity-100">
              <Phone className="w-4 h-4" /> 8754885130
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Thindukkal, Viruveedu (PT), Dharumathupatti</span>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-100"
            >
              <Instagram className="w-4 h-4" /> Follow on Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Meenakshi Universe. All rights reserved. Owner: Raja
      </div>
    </div>
  </footer>
);

export default Footer;
