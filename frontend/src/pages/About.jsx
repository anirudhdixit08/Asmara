import { Link } from "react-router";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#0f172a] text-white px-6 py-4 shadow-lg border-b border-white/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight hover:text-white/90">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain flex-shrink-0" />
            <span>Factrix</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-white/90 hover:text-white">
              Home
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white/90 hover:text-white">
              Contact
            </Link>
            <Link to="/login" className="btn btn-ghost text-white hover:bg-white/10 border border-white/50 btn-sm">
              Login
            </Link>
            <Link to="/signup" className="btn bg-white text-[#0f172a] hover:bg-white/90 border-0 btn-sm">
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Factrix
          </h1>
          <p className="text-xl text-white/80 mb-12">
            The link between factories and Asmara — where brands get made.
          </p>

          <section className="space-y-8 text-white/90 leading-relaxed">
            <div className="bg-white/5 rounded-xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">What we do</h2>
              <p className="text-lg">
                <strong className="text-white">Factrix</strong> is the bridge between Asmara and factories. We connect your company’s teams with production partners so that employees can place orders for your brands directly with factories — from one place.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">For Asmara</h2>
              <p className="text-lg mb-4">
                Asmara employees can create and manage style orders, send tech packs, track TNA, fabric, and costing — and keep everything in sync with assigned factories.
              </p>
              <p className="text-lg">
                One platform to order for your brands, track production, and stay connected with factory partners.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 sm:p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">For factories</h2>
              <p className="text-lg">
                Factories receive orders assigned to them, view full order details — TNA, fabric, tech pack, costing — and update status so Asmara always has visibility. You focus on production; Factrix handles the link to the brand.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-lg text-white/80">
                Whether you’re placing orders for your brand or fulfilling them as a factory, Factrix keeps the process clear, traceable, and in one place.
              </p>
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="btn bg-white text-[#0f172a] hover:bg-white/90 border-0"
            >
              Get in touch
            </Link>
            <Link
              to="/"
              className="btn btn-ghost text-white border border-white/50 hover:bg-white/10"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#0f172a] text-white py-6 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold hover:opacity-90">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain flex-shrink-0" />
            <span>Factrix</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link>
          </nav>
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Factrix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
