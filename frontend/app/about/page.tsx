"use client";

import { Navbar } from "@/components/navigation/navbar";
import { GlassCard } from "@/components/ui/glass-card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text-pink mb-4">
              About AAVRA GENERAL
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Your trusted destination for premium skincare and beauty
              essentials. At <strong>AAVRA GENERAL</strong>,<br />   we believe beauty
              is for everyone and our carefully curated collection of products
              helps you <br/> <strong>GLOW WITH CONFIDENCE</strong> every day.
            </p>
          </div>

          {/* Contact Info */}
          <section className="mb-16 max-w-5xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
              Contact Us
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              <GlassCard className="p-6 text-center space-y-2">
                <h3 className="font-semibold text-pink-600">Phone</h3>
                <a
                  href="https://wa.me/919691908320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 hover:underline"
                >
                  +91 96919 08320
                </a>
              </GlassCard>
              <GlassCard className="p-6 text-center space-y-2">
                <h3 className="font-semibold text-pink-600">Email</h3>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=aavrageneral@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 hover:underline"
                >
                  aavrageneral@gmail.com
                </a>
              </GlassCard>

              <GlassCard className="p-6 text-center space-y-2">
                <h3 className="font-semibold text-pink-600">Instagram</h3>  
                <a
                  href="https://www.instagram.com/makeupstore_by_aavra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 hover:underline"
                >
                  @aavrageneral
                </a>
              </GlassCard>
              
<GlassCard className="p-6 text-center space-y-2">
  <h3 className="font-semibold text-pink-600">Address</h3>
  <a
    href="https://www.google.com/maps/place/Kamal+Chowk,+Tagore+Marg,+Neemuch,+Madhya+Pradesh+458441/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-cyan-700 hover:underline"
  >
    Kamal Chowk, Tagore Marg, Neemuch,
    <br /> MP-458441
  </a>
</GlassCard>

            </div>
          </section>

          {/* Shop Story */}
          {/* <section className="mb-16 max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
                Our Story
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                AAVRA GENERAL started with a simple vision: to make high-quality
                skincare and makeup products accessible to everyone. Whether
                you're starting your self-care journey or refining your beauty
                routine, we’ve got everything you need under one roof.
              </p>
            </div>
          </section> */}

          {/* Product Categories */}
          {/* <section className="mb-16 max-w-5xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
              What We Offer
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                "Face Serum",
                "Face Wash",
                "Lip Gloss",
                "Lipsticks",
                "Eyeshadows",
                "Blusher",
                "Highlighter",
                "Sheet Mask",
              ].map((item) => (
                <div
                  key={item}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-xl text-center shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-pink-200/50 dark:hover:shadow-pink-500/20 transition-all"
                >
                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section> */}

          {/* Location */}
          <section className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
              Visit Us
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Drop by our store to explore our full collection and get
              personalized recommendations.
            </p>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d434.46630305880285!2d74.8691129!3d24.4582912!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396673a355feb055%3A0xcfaa9f1b97bde214!2sPARTHA!5e1!3m2!1sen!2sin!4v1755906581073!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
