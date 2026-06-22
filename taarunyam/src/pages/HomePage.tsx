import HeroSection from '../components/public/HeroSection';
import EventsSection from '../components/public/EventsSection';
import CertificatesSection from '../components/public/CertificatesSection';
import ContactSection from '../components/public/ContactSection';
import Footer from '../components/public/Footer';

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <EventsSection />
            <CertificatesSection />
            <ContactSection />
            <Footer />
        </>
    );
}
