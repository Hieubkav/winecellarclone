"use client";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface ContactHeroProps {
  siteName: string;
}

/**
 * ContactHero - Hero section cho trang Contact
 * 
 * Design:
 * - Flat minimal design (no shadows, no gradients)
 * - Brand colors: #ECAA4D (accent background), #1C1C1C (text)
 * - Centered content với max-width
 * - Responsive typography
 * - Subtle animation on mount
 */
export default function ContactHero({ siteName }: ContactHeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-[#ECAA4D] py-16 sm:py-20 lg:py-24"
      aria-labelledby="contact-hero-title"
    >
      {/* Background Pattern (optional subtle pattern) */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[linear-gradient(30deg,transparent_48%,#1C1C1C_49%,#1C1C1C_51%,transparent_52%)] bg-[length:20px_20px]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1
          id="contact-hero-title"
          className={`${montserrat.className} mb-4 text-4xl font-bold tracking-tight text-[#1C1C1C] sm:text-5xl lg:text-6xl`}
          style={{ animation: "fadeInUp 0.6s ease-out" }}
        >
          Liên hệ với chúng tôi
        </h1>
        
        <p
          className={`${montserrat.className} mx-auto max-w-2xl text-base text-[#1C1C1C]/80 sm:text-lg lg:text-xl`}
          style={{ animation: "fadeInUp 0.8s ease-out" }}
        >
          {siteName} luôn sẵn sàng hỗ trợ bạn với các câu hỏi về rượu vang, dịch vụ và đơn hàng.
          Hãy liên hệ với chúng tôi qua bất kỳ kênh nào dưới đây.
        </p>

        {/* Decorative Line */}
        <div
          className="mx-auto mt-8 h-1 w-24 bg-[#9B2C3B]"
          style={{ animation: "fadeInUp 1s ease-out" }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
