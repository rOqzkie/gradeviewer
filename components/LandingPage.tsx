import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  GraduationCap,
  Users,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Sparkles,
  Menu,
  X,
  Star,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              GradeMaster <span className="text-indigo-600">AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button onClick={() => scrollTo('features')} className="hover:text-indigo-600 transition-colors">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-indigo-600 transition-colors">How It Works</button>
            <button onClick={() => scrollTo('for-who')} className="hover:text-indigo-600 transition-colors">For Who</button>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              Get Started <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700 shadow-lg">
            <button onClick={() => scrollTo('features')} className="text-left hover:text-indigo-600 transition-colors">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-left hover:text-indigo-600 transition-colors">How It Works</button>
            <button onClick={() => scrollTo('for-who')} className="text-left hover:text-indigo-600 transition-colors">For Who</button>
            <button
              onClick={onGetStarted}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl mt-1"
            >
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-blue-700 pt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Smart Grades.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              Smarter Insights.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            GradeMaster AI bridges students and educators through intelligent grade analytics,
            real-time feedback, and AI-powered academic summaries — all in one secure platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 text-base group"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm text-base"
            >
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '100%', label: 'Secure & Encrypted' },
              { value: 'AI', label: 'Powered Analytics' },
              { value: '2', label: 'Role Dashboards' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-indigo-300 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Features</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4 tracking-tight">
              Everything You Need to{' '}
              <span className="text-indigo-600">Succeed</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A complete academic performance platform built for modern education.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <BrainCircuit className="h-7 w-7" />,
                color: 'bg-violet-100 text-violet-600',
                title: 'AI-Powered Summaries',
                desc: "Receive personalized academic performance insights generated by Google Gemini AI, tailored to each student's results.",
              },
              {
                icon: <BarChart3 className="h-7 w-7" />,
                color: 'bg-blue-100 text-blue-600',
                title: 'Visual Grade Analytics',
                desc: 'Interactive charts show breakdowns across Class Standing, Examinations, and Requirements — all at a glance.',
              },
              {
                icon: <ClipboardList className="h-7 w-7" />,
                color: 'bg-indigo-100 text-indigo-600',
                title: 'Comprehensive Grading',
                desc: 'Covers attendance, quizzes, assignments, recitation, midterm, final exams, reporting, and final requirements.',
              },
              {
                icon: <ShieldCheck className="h-7 w-7" />,
                color: 'bg-green-100 text-green-600',
                title: 'Secure Authentication',
                desc: 'Role-based access control for students and teachers. Supabase-backed, persistent session management.',
              },
              {
                icon: <TrendingUp className="h-7 w-7" />,
                color: 'bg-rose-100 text-rose-600',
                title: 'Real-Time Grade Tracking',
                desc: 'Teachers update grades instantly. Students see changes reflected immediately in their dashboard.',
              },
              {
                icon: <Users className="h-7 w-7" />,
                color: 'bg-amber-100 text-amber-600',
                title: 'Dual-Role Dashboards',
                desc: 'Separate, purpose-built interfaces for students viewing progress and teachers managing the entire class.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className={`inline-flex p-3 rounded-xl mb-5 ${f.color}`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Process</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4 tracking-tight">
              Up and Running in{' '}
              <span className="text-indigo-600">3 Steps</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Simple setup. Powerful results. No technical expertise required.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-10">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 z-0" />

            {[
              {
                step: '01',
                icon: <ShieldCheck className="h-8 w-8 text-indigo-600" />,
                title: 'Teachers Set Up Classes',
                desc: 'Administrators register, create student accounts, and configure grade weights through the teacher dashboard.',
              },
              {
                step: '02',
                icon: <ClipboardList className="h-8 w-8 text-indigo-600" />,
                title: 'Grades Are Entered',
                desc: 'Teachers input scores for every grading component — from attendance to final requirements — in real time.',
              },
              {
                step: '03',
                icon: <BrainCircuit className="h-8 w-8 text-indigo-600" />,
                title: 'Students Get AI Insights',
                desc: 'Students log in, view their full grade breakdown, and receive an AI-generated performance summary.',
              },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-300 mb-6">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Step {step.step}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Who Section ── */}
      <section id="for-who" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Built For</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4 tracking-tight">
              Two Roles. One Platform.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Students */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 p-10 border border-indigo-100">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-200/40 rounded-full" />
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-200/40 rounded-full" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">For Students</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Log in and instantly see your complete academic performance — from individual scores to your overall standing.
                </p>
                <ul className="space-y-2.5">
                  {[
                    'View detailed grade breakdown per component',
                    'Track your weighted class standing',
                    'Get an AI-generated performance summary',
                    'Monitor midterm and final exam scores',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Teachers */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-50 to-purple-100 p-10 border border-purple-100">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-200/40 rounded-full" />
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-violet-200/40 rounded-full" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-6 shadow-lg shadow-violet-200">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">For Teachers</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Manage your entire class from a single dashboard. Add students, update grades, and monitor performance in real time.
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Add, edit, and manage all student records',
                    'Input and update grades for each component',
                    'Access class-wide grade analytics',
                    'Secure admin authentication and session control',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial-style trust bar ── */}
      <section className="py-16 bg-slate-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />, text: 'Supabase-Backed Security' },
              { icon: <BrainCircuit className="h-6 w-6 text-indigo-600" />, text: 'Google Gemini AI' },
              { icon: <BarChart3 className="h-6 w-6 text-indigo-600" />, text: 'Interactive Charts' },
              { icon: <Star className="h-6 w-6 text-indigo-600" />, text: 'Built for Education' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2.5">
                <div className="bg-indigo-50 p-3 rounded-xl">{item.icon}</div>
                <span className="text-sm font-semibold text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border border-white/20 rounded-2xl mb-8 backdrop-blur-sm">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Ready to Transform Academic Tracking?
          </h2>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Join GradeMaster AI today. Students gain clarity. Teachers gain control. Everyone gains confidence.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl shadow-black/20 text-base inline-flex items-center gap-2 group"
          >
            Sign In to Your Account
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand mark */}
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">
                GradeMaster <span className="text-indigo-400">AI</span>
              </span>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollTo('for-who')} className="hover:text-white transition-colors">For Who</button>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-600 text-center md:text-right">
              © {new Date().getFullYear()} GradeMaster AI. All rights reserved.<br />
              <span className="text-gray-700">Education Technology Systems</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
