import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Code2,
  CalendarCheck,
  ClipboardCheck,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
];

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Compass,
    title: "Society Discovery & Matching",
    description:
      "Personalized compatibility scoring to help students find the campus societies that best fit their interests.",
  },
  {
    icon: Code2,
    title: "Technical Assessments",
    description:
      "Time-bound online tests for technical societies with automated evaluation and browser proctoring.",
  },
  {
    icon: CalendarCheck,
    title: "Non-Technical Audition Booking",
    description:
      "Real-time audition slot scheduling for cultural and non-technical societies with instant confirmation.",
  },
  {
    icon: ClipboardCheck,
    title: "Portfolio & Rubric Evaluation",
    description:
      "Streamlined portfolio submissions and structured judge grading for non-technical recruitments.",
  },
  {
    icon: CalendarDays,
    title: "Campus Event Calendar",
    description:
      "A centralized feed of upcoming society events, workshops, and one-click student registrations.",
  },
  {
    icon: LayoutDashboard,
    title: "Society Manager Portal",
    description:
      "Dedicated dashboards for society heads to review applicants, manage slots, and shortlist candidates.",
  },
];

function hasLogoFile() {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "tiet-logo.png"));
  } catch {
    return false;
  }
}

function TietLogo() {
  if (hasLogoFile()) {
    return (
      <Image
        src="/tiet-logo.png"
        alt="Thapar Institute of Engineering and Technology logo"
        width={36}
        height={36}
        className="rounded-md"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#B91C1C] text-sm font-bold text-white">
      TI
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="flex w-full flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <TietLogo />
            <span className="truncate text-sm font-semibold text-gray-900 sm:text-base">
              Thapar Institute of Engineering and Technology
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-gray-900">
                {link.label}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="shrink-0 rounded-lg bg-[#B91C1C] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#991B1B]"
          >
            Login
          </Link>
        </div>
      </header>

      <section id="home" className="relative flex min-h-[75vh] items-center justify-center overflow-hidden">
        <Image
          src="/thapar-campus.jpg"
          alt="Thapar Institute of Engineering and Technology campus"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Thapar Society Nexus
          </h1>
          <p className="mt-4 text-lg font-medium text-white/90 sm:text-xl">Seamlessly Connected.</p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-[#B91C1C] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#991B1B]"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section id="about" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#B91C1C]">
            About the Platform
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything on campus, connected
          </h2>
          <p className="mt-6 text-base leading-relaxed text-gray-600">
            Thapar Society Nexus is a unified digital platform designed to simplify student society
            discovery, recruitment, and campus event management at Thapar Institute of Engineering &
            Technology. By integrating technical assessments, non-technical auditions, and society
            calendars into a single interface, it provides a seamless experience for students, society
            heads, and administration.
          </p>
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B91C1C]">
              What We Provide
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              Platform Features
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                      <Icon className="h-5 w-5 text-[#B91C1C]" />
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                  <Link
                    href="/login"
                    className="mt-6 block w-full rounded-lg bg-[#64748B] py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#475569]"
                  >
                    Learn More
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-500">
        Thapar Society Nexus — TIET, Patiala.
      </footer>
    </div>
  );
}
