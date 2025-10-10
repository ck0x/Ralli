import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Ralli</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Simple kiosk intake form & dashboard to manage badminton racquet
              stringing orders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Submit Order", href: "/form" },
                { label: "Orders", href: "/orders" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Status Codes</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Pending – Submitted, not started</li>
              <li>In Progress – Currently being strung</li>
              <li>Ready – Completed & awaiting pickup</li>
              <li>Picked Up – Customer collected</li>
            </ul>
          </div>

          {/* Contact Info */}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Ralli. MIT Licensed.</p>
        </div>
      </div>
    </footer>
  );
}
