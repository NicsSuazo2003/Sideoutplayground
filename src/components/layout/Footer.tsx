import { Link } from 'react-router-dom';
import { Zap, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
  <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
    <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
  </div>
  <div className="leading-none">
    <div className="font-black text-white text-sm">SIDE OUT</div>
    <div className="text-[10px] text-[#7CFC00] tracking-widest font-semibold">
      PLAYGROUND
    </div>
  </div>
</Link>

            <p className="text-white/50 text-sm leading-relaxed mb-4">
  Premium pickleball court in Tandag City. Book your slot and experience outdoor facility in Surigao del Sur.
</p>

            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-[#7CFC00] hover:border-[#7CFC00]/30 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Quick Links
            </h4>

            <ul className="space-y-2.5">
              {[
                ['Home', '/'],
                ['Book a Slot', '/book'],
                ['Tournaments', '/tournaments'],
                ['Membership', '/dashboard/membership'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-white/50 hover:text-[#7CFC00] text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Account
            </h4>

            <ul className="space-y-2.5">
              {[
                ['Login', '/login'],
                ['Register', '/register'],
                ['Dashboard', '/dashboard'],
                ['My Bookings', '/dashboard/my-bookings'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-white/50 hover:text-[#7CFC00] text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Contact
            </h4>

            <ul className="space-y-3">

              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <MapPin
                  size={15}
                  className="mt-0.5 text-[#7CFC00] shrink-0"
                />
                <span>
                  Purok Million, Barangay San Agustin Sur,
                  Tandag City, Surigao del Sur 8300
                </span>
              </li>

              <li className="flex items-center gap-2.5 text-white/50 text-sm">
                <Phone
                  size={15}
                  className="text-[#7CFC00] shrink-0"
                />
                <span>09058100973</span>
              </li>

              <li className="flex items-center gap-2.5 text-white/50 text-sm">
                <Mail
                  size={15}
                  className="text-[#7CFC00] shrink-0"
                />
                <span>Powered & Developed by Astravex</span>
              </li>

            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/8 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">

          <p className="text-white/30 text-xs">
            © 2026 Side Out Playground. Developed by Astravex.
          </p>

          <div className="flex gap-4">
            <a
              href="#"
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Terms of Service
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}