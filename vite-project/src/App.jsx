import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import FeaturedDoctors from './components/FeaturedDoctors'
import WhyChooseUs from './components/WhyChooseUs'
import Statistics from './components/Statistics'
import AppointmentCTA from './components/AppointmentCTA'
import Testimonials from './components/Testimonials'
import Gallery from './components/Gallery'
import FAQs from './components/FAQs'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <FeaturedDoctors />
        <WhyChooseUs />
        <Statistics />
        <AppointmentCTA />
        <Testimonials />
        <Gallery />
        <FAQs />
      </main>
      <Footer />
    </>
  )
}

export default App
