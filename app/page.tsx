import Link from "next/link";
import { ArrowRight, Users, Wallet, Shield, Clock, CheckCircle, Repeat } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 lg:px-16 h-16 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-sm shadow-emerald-200">
            A
          </div>
          <span className="font-semibold text-gray-900 text-sm">Ajo Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm shadow-emerald-200"
          >
            Get started <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Community savings, reimagined
        </div>

        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight max-w-2xl leading-tight">
          Save together.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            Win together.
          </span>
        </h1>

        <p className="text-gray-500 text-base lg:text-lg mt-6 max-w-xl leading-relaxed">
          Ajo is a rotating savings platform that lets your circle pool money, take turns receiving the pot, and hold each other accountable — no bank needed.
        </p>

        <div className="flex items-center gap-3 mt-10 flex-wrap justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-200"
          >
            Start your circle <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 h-12 px-8 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all"
          >
            Sign in
          </Link>
        </div>

        {/* Social proof line */}
        <p className="text-xs text-gray-400 mt-8">
          Free to join · No hidden fees · Paystack-secured payments
        </p>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 lg:px-16 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-500 text-sm mt-2">Three steps to your first payout</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Users, title: "Create or join a group", body: "Start a savings circle with a custom amount and cycle, or join one with a shared ID or invite link.", color: "emerald" },
              { step: "02", icon: Repeat, title: "Everyone contributes each cycle", body: "Members pay their contribution every cycle — daily, weekly, or monthly. Paystack handles payments securely.", color: "sky" },
              { step: "03", icon: Wallet, title: "One member gets the pot", body: "Each cycle, one member receives the full pot. The rotation continues until everyone has been paid out.", color: "violet" },
            ].map(({ step, icon: Icon, title, body, color }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold text-${color}-500 bg-${color}-50 px-2 py-1 rounded-lg`}>{step}</span>
                  <div className={`w-9 h-9 rounded-xl bg-${color}-50 flex items-center justify-center`}>
                    <Icon size={17} className={`text-${color}-600`} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-16 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Everything your circle needs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Secure payments", body: "All transactions go through Paystack — Nigeria's most trusted payment gateway.", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Clock, title: "Automatic reminders", body: "Members who haven't paid get email reminders so no one falls behind.", color: "text-sky-600", bg: "bg-sky-50" },
              { icon: CheckCircle, title: "Payment receipts", body: "Every contribution generates a receipt you can download any time.", color: "text-violet-600", bg: "bg-violet-50" },
              { icon: Users, title: "Invite via link", body: "Share a link and new members join instantly — no manual IDs required.", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: Wallet, title: "Payout tracking", body: "See exactly who gets paid next and a full history of completed payouts.", color: "text-rose-600", bg: "bg-rose-50" },
              { icon: Repeat, title: "Multiple groups", body: "Join as many circles as you want — each with its own cycle and members.", color: "text-teal-600", bg: "bg-teal-50" },
            ].map(({ icon: Icon, title, body, color, bg }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={17} className={color} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-16 py-20">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Ready to start saving?</h2>
            <p className="text-emerald-100/80 text-sm mt-3">
              Create your free account and start your first savings circle in minutes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 mt-8 h-12 px-8 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition-all shadow-lg"
            >
              Create free account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-16 py-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white text-xs">A</div>
          <span className="text-sm font-medium text-gray-600">Ajo Platform</span>
        </div>
        <p className="text-xs text-gray-400">© 2025 Ajo Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Sign in</Link>
          <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Register</Link>
        </div>
      </footer>

    </div>
  );
}
