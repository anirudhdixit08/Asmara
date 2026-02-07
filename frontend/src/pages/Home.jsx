import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar - dark blue */}
      <header className="bg-[#0f172a] text-white px-6 py-4 shadow-lg">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            GP Asmara
          </Link>
          <div className="flex items-center gap-6">
            <ul className="flex gap-8 text-sm font-medium text-white/90">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
            <Link
              to="/login"
              className="btn btn-ghost text-white hover:bg-white/10 border border-white/50"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn bg-white text-[#0f172a] hover:bg-white/90 border-0"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero - dark blue with white text */}
      <section
        id="home"
        className="flex-1 bg-[#0f172a] text-white py-24 px-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Welcome to GP Asmara
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            Your trusted partner for quality care and service. We're here to help you every step of the way.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#about"
              className="px-6 py-3 bg-white text-[#0f172a] font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Learn more
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* Content strip - white */}
      <section
        id="about"
        className="bg-white text-[#0f172a] py-20 px-6 border-t border-[#e2e8f0]"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">About us</h2>
          <p className="text-[#64748b] text-lg max-w-2xl mx-auto text-center leading-relaxed">
            We combine expertise with a personal touch to deliver results that matter. 
            Explore what we offer and how we can support you.
          </p>
        </div>
      </section>

      {/* Footer - dark blue */}
      <footer className="bg-[#0f172a] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold">GP Asmara</span>
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} GP Asmara. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
