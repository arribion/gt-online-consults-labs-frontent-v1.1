import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Benefits from "../../components/landing/Benefits";
import Showcase from "../../components/landing/Showcase";
import Pricing from "../../components/landing/Pricing";
import Testimonials from "../../components/landing/Testimonials";
import CallToAction from "../../components/landing/CallToAction";

export default function Landing() {
  return (
    <div className="relative min-h-screen font-body">
      <div className="ambient" />
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Showcase />
        <Pricing />
        <Testimonials />
        <CallToAction/>
      </main>
    </div>
  );
}
