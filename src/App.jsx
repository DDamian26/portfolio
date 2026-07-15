import { SHOW_TESTIMONIALS } from './config'
import { LanguageProvider } from './i18n/LanguageContext'
import BackgroundCanvas from './components/BackgroundCanvas'
import Nav from './components/Nav'
import Splash from './sections/Splash'
import Hero from './sections/Hero'
import Portfolio from './sections/Portfolio'
import BeforeAfter from './sections/BeforeAfter'
import Testimonials from './sections/Testimonials'
import About from './sections/About'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

export default function App() {
  return (
    <LanguageProvider>
      <BackgroundCanvas />
      <Nav />
      <main className="relative z-10">
        <Splash />
        <Hero />
        <Portfolio />
        <BeforeAfter />
        {SHOW_TESTIMONIALS && <Testimonials />}
        <About />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </LanguageProvider>
  )
}
