import { Hero2 } from "@/components/Landing/Hero";
import { Footer } from "../components/Landing/Footer"
import {TestimonialsSectionDemo} from "../components/Landing/Testimonials"
import About from "@/components/Landing/About";
const Landing = () => {
  return (
    <div>
      <Hero2 />
      <About/>
      <TestimonialsSectionDemo/>
      <Footer/>
    </div>
  );
};

export default Landing;