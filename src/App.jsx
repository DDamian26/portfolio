import { MotionConfig } from 'framer-motion'
import { SHOW_TESTIMONIALS } from './config'
import { LanguageProvider } from './i18n/LanguageContext'
import BackgroundCanvas from './components/BackgroundCanvas'
import GrainOverlay from './components/GrainOverlay'
import Timecode from './components/Timecode'
import Nav from './components/Nav'
import SplashLanguageToggle from './components/SplashLanguageToggle'
import Splash from './sections/Splash'
import Hero from './sections/Hero'
import Portfolio from './sections/Portfolio'
import BeforeAfter from './sections/BeforeAfter'
import Testimonials from './sections/Testimonials'
import About from './sections/About'
import Faq from './sections/Faq'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

export default function App() {
  return (
    <LanguageProvider>
      {/* reducedMotion="user" disables decorative transform animation
          for users with prefers-reduced-motion set */}
      <MotionConfig reducedMotion="user">
      <BackgroundCanvas />
      <GrainOverlay />
      <Timecode />
      <Nav />
      <SplashLanguageToggle />
      <main className="relative z-10">
        <Splash />
        <Hero />
        <Portfolio />
        <BeforeAfter />
        {SHOW_TESTIMONIALS && <Testimonials />}
        <About />
        <Faq />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      </MotionConfig>
    </LanguageProvider>
  )
}
