import { Mail, Phone, Globe, Bug } from "lucide-react";

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Company", href: "/company" },
];

const contactInfo = [
  { icon: Mail, text: "support@arribion.com" },
  { icon: Phone, text: "+254 700 000 000" },
  { icon: Globe, text: "www.arribion.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border gradient-primary text-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">About Us</h3>
          <p className="text-sky-100 text-sm">GT Tasking Consultation.</p>
          <div className="mt-3 space-y-1">
            <a href="#" className="underline hover:text-white">
              Terms & Conditions
            </a>
            <br />
            <a href="#" className="underline hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-sky-100">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-sky-100">
            {contactInfo.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sky-400 mt-8 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-sky-100">
          &copy; {new Date().getFullYear()} GT. All Rights Reserved.
        </p>
        <p className="text-sm text-sky-200">Powered by Arribion Technologies</p>
        <a
          href="https://wa.me/254707468863?text=I would like to report a bug/suggestion in the qt-online application."
          target="_blank"
          rel="noopener noreferrer">
          <button
            className="flex items-center gap-2 rounded-3xl bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Report a bug or suggestion">
            <Bug size={16} />
            Report a Bug & Suggestions
          </button>
        </a>
      </div>
    </footer>
  );
}

export default Footer;