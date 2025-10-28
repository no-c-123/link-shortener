import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'

export default function About() {
    const slides = [
      { src: '/SnapLink-Logo.png', alt: 'Step 1: Paste your link' },
      { src: '/SnapLink-Logo.png', alt: 'Step 2: Click shorten' },
      { src: '/SnapLink-Logo.png', alt: 'Step 3: Get your short link' },
    ];
  
    return (
      <section className="min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] text-white px-6 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
  
          {/* Left Side: Info */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">What is SnapLink?</h1>
            <p className="text-lg text-gray-300 mb-8">
              SnapLink is your go-to link shortener for fast, stylish, and reliable link sharing.
              Built to deliver instant results with a clean, modern interface, SnapLink makes link
              management easy whether you're sharing with friends, clients, or your team.
            </p>
  
            <h2 className="text-2xl font-semibold mb-4">📂 Key Features</h2>
            <ul className="text-left text-gray-300 space-y-2 list-disc list-inside">
              <li>🔗 One-click link shortening with instant access</li>
              <li>📈 Trackable links</li>
              <li>⚡ Fast redirection and reliable uptime</li>
              <li>🎨 Clean, user-friendly design with no ads</li>
              <li>🔒 Secure handling with backend API integration</li>
            </ul>
          </div>
  
          {/* Right Side: Carousel */}
          <div className="w-full max-w-md mx-auto">
            <Swiper
              pagination={{ clickable: true }}
              modules={[Pagination]}
              spaceBetween={30}
              className="rounded-lg overflow-hidden"
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <img src={slide.src} alt={slide.alt} className="w-full h-auto object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
  
        </div>
      </section>
    );
}