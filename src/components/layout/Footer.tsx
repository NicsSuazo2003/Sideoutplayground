import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-28 pt-12 sm:pb-12 sm:pt-14 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-200/80 p-1 shadow-xs">
                <img src="/logo.png" alt="Side Out Playground" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight">
                <span className="font-black text-slate-900 text-sm tracking-tight block">SIDE OUT</span>
                <span className="text-[10px] text-teal-600 tracking-widest font-black uppercase block">PLAYGROUND</span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              Premier dedicated pickleball destination in Tandag City. Book tournament-grade courts, join weekly Open Play, and level up your game.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all active:scale-95"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                ['Home', '/'],
                ['Book a Court', '/book'],
                ['Open Play Sessions', '/openplay'],
                ['Track Reservation', '/track'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-slate-500 hover:text-teal-600 transition-colors inline-block py-0.5">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Court Hours */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">Court Schedule</h4>
            <div className="space-y-2 text-xs sm:text-sm text-slate-500">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Monday – Sunday</span>
                <span className="font-semibold text-slate-800">5:00 AM – 12:00 AM</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Prime Hours (Fixed)</span>
                <span className="font-semibold text-amber-700">4:00 PM – 6:00 PM</span>
              </div>
              <p className="text-[11px] text-teal-600 font-medium pt-1 flex items-center gap-1">
                <Sparkles size={12} /> Lighted night sessions available
              </p>
            </div>
          </div>

          {/* Direct Contact */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">Visit Facility</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-slate-500 hover:text-teal-700 transition-colors"
                >
                  <MapPin size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>Purok Million, Brgy. San Agustin Sur, Tandag City, Surigao del Sur</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:09058100973"
                  className="flex items-center gap-2 text-slate-500 hover:text-teal-700 font-semibold transition-colors"
                >
                  <Phone size={16} className="text-teal-600 shrink-0" />
                  <span>0905 810 0973</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Attribution */}
        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 Side Out Playground. Powered &amp; Developed by Astravex.</p>
          <div className="flex items-center gap-4">
            <span className="text-teal-600 font-medium">GCash Verified Facility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}