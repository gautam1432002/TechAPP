import { useState, useEffect } from 'react';
import { LogOut, Users, Calendar, Award, LayoutDashboard, FileText, Phone, BarChart, Send, ShieldCheck, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';
import { getParticipants } from '../../api/participants.api';
import { getAdminEvents } from '../../api/events.api';
import ParticipantsTab from './ParticipantsTab';
import EventsTab from './EventsTab';
import CertificatesTab from './CertificatesTab';
import DashboardContentTab from './DashboardContentTab';
import FooterTab from './FooterTab';
import ContactTab from './ContactTab';
import DistributeTab from './DistributeTab';
import VerifyTab from './VerifyTab';
import AnalyticsTab from './AnalyticsTab';
import CertificatePreviewModal from '../modals/CertificatePreviewModal';
import EditParticipantModal from '../modals/EditParticipantModal';

type TabName =
    | 'participants'
    | 'events'
    | 'certificates'
    | 'distribute'
    | 'verify'
    | 'analytics'
    | 'dashboard'
    | 'footer'
    | 'contact';

const tabs: { name: TabName; label: string; icon: React.ReactNode }[] = [
    { name: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
    { name: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { name: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { name: 'distribute', label: 'Distribute', icon: <Send className="w-4 h-4" /> },
    { name: 'verify', label: 'Verify', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'analytics', label: 'Analytics', icon: <BarChart className="w-4 h-4" /> },
    { name: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'footer', label: 'Footer', icon: <FileText className="w-4 h-4" /> },
    { name: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
];

export default function AdminDashboardView() {
    const [activeTab, setActiveTab] = useState<TabName>('participants');
    const adminLogout = useAppStore((s) => s.adminLogout);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [totalWinners, setTotalWinners] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);

    useEffect(() => {
        const fetchStats = () => {
            getParticipants({ pageSize: 1 })
                .then(res => setTotalParticipants(res.count))
                .catch(() => console.error("Failed to load global participants stat"));

            getParticipants({ pageSize: 1, isWinner: true })
                .then(res => setTotalWinners(res.count))
                .catch(() => console.error("Failed to load global winners stat"));

            getAdminEvents()
                .then(res => setTotalEvents(res.length))
                .catch(() => console.error("Failed to load global events stat"));
        };

        fetchStats();

        // Listen for data updates from other components or API calls
        window.addEventListener('participantsUpdated', fetchStats);
        return () => window.removeEventListener('participantsUpdated', fetchStats);
    }, []);

    const handleLogout = () => {
        adminLogout();
        toast('Logged Out', 'Admin session ended', 'info');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'participants': return <ParticipantsTab />;
            case 'events': return <EventsTab />;
            case 'certificates': return <CertificatesTab />;
            case 'distribute': return <DistributeTab />;
            case 'verify': return <VerifyTab />;
            case 'analytics': return <AnalyticsTab />;
            case 'dashboard': return <DashboardContentTab />;
            case 'footer': return <FooterTab />;
            case 'contact': return <ContactTab />;
            default: return null;
        }
    };

    return (
        <div className="p-6 admin-theme">
            {/* Header + Stats */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold glow-text text-white">Admin Dashboard</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-glass border border-glass-border rounded-lg hover:bg-glass-hover text-white transition-colors"
                    >
                        <Home className="w-4 h-4" /> Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg border border-destructive/30 hover:bg-destructive/30 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-primary" id="stat-total">{totalParticipants}</div>
                    <div className="text-sm text-muted-foreground">Total Participants</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-winner" id="stat-winners">{totalWinners}</div>
                    <div className="text-sm text-muted-foreground">Winners</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-secondary" id="stat-events">{totalEvents}</div>
                    <div className="text-sm text-muted-foreground">Events</div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="relative border-b border-glass-border mb-6 flex items-center group">
                {/* Left Arrow */}
                <button
                    onClick={() => {
                        const el = document.getElementById('admin-tabs-container');
                        if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    className="absolute left-0 z-10 p-2 bg-background/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100 hidden md:block border border-glass-border shadow-lg"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                    id="admin-tabs-container"
                    className="overflow-x-auto whitespace-nowrap hide-scrollbar flex-1 scroll-smooth px-0 md:px-8 relative"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            className={`admin-tab ${activeTab === tab.name ? 'active' : ''} inline-flex items-center gap-2`}
                            onClick={() => setActiveTab(tab.name)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => {
                        const el = document.getElementById('admin-tabs-container');
                        if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    className="absolute right-0 z-10 p-2 bg-background/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100 hidden md:block border border-glass-border shadow-lg"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Tab content */}
            <div className="min-h-[400px]">{renderContent()}</div>

            {/* Admin-only Modals */}
            <CertificatePreviewModal />
            <EditParticipantModal />
        </div>
    );
}
