import type { TEvent } from '../types/event.types';
import type { SiteSettings } from '../types/settings.types';
import type { CertSettings } from '../types/certificate.types';

export const DEFAULT_EVENTS: TEvent[] = [
    { id: 'code-rush', title: 'Code Rush', description: 'Fast-paced competitive programming challenge. Solve algorithmic problems against the clock.', category: 'Programming', icon: 'code', maxParticipants: 50, prizes: ['₹10,000', '₹5,000', '₹2,500'], eventDate: '2026-03-15T10:00:00', isActive: true, order: 1 },
    { id: 'tech-quiz', title: 'Tech Quiz', description: 'Ultimate technology knowledge test covering latest trends and fundamental concepts.', category: 'Knowledge', icon: 'brain', maxParticipants: 100, prizes: ['₹8,000', '₹4,000', '₹2,000'], eventDate: '2026-03-15T11:30:00', isActive: true, order: 2 },
    { id: 'hackathon', title: 'Hackathon', description: '24-hour intensive coding marathon. Build innovative solutions to real-world problems.', category: 'Innovation', icon: 'zap', maxParticipants: 80, prizes: ['₹25,000', '₹15,000', '₹8,000'], eventDate: '2026-03-15T09:00:00', isActive: true, order: 3 },
    { id: 'web-master', title: 'Web Master', description: 'Design and develop stunning websites. Showcase your frontend and backend skills.', category: 'Web Development', icon: 'globe', maxParticipants: 60, prizes: ['₹12,000', '₹7,000', '₹3,500'], eventDate: '2026-03-15T14:00:00', isActive: true, order: 4 },
    { id: 'debug-dash', title: 'Debug Dash', description: 'Race against time to find and fix bugs in complex codebases.', category: 'Problem Solving', icon: 'bug', maxParticipants: 40, prizes: ['₹6,000', '₹3,500', '₹1,500'], eventDate: '2026-03-15T16:00:00', isActive: true, order: 5 },
    { id: 'ai-challenge', title: 'AI Challenge', description: 'Develop AI solutions using machine learning and deep learning techniques.', category: 'Artificial Intelligence', icon: 'cpu', maxParticipants: 30, prizes: ['₹20,000', '₹12,000', '₹6,000'], eventDate: '2026-03-15T15:30:00', isActive: true, order: 6 },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
    brandName: 'TAARUNYAM',
    eventYear: '2026',
    mainTitle: 'TAARUNYAM',
    subtitle: 'Tech Event 2026',
    description: 'The Ultimate Technology Championship',
    eventDate: 'March 15, 2026',
    eventVenue: 'Tech Campus Auditorium',
    categoriesText: '6 Exciting Events',
    countdownDate: '2026-03-15T09:00:00',
    footer: {
        description: 'The Ultimate Tech Championship celebrating innovation, creativity, and technological excellence.',
        extraInfo: 'Organized by Tech Innovation Society.\nAll participants must follow code of conduct.',
        copyright: '© 2026 TAARUNYAM Tech Event. All rights reserved.',
    },
    contact: {
        email: 'contact@taarunyam2026.com',
        phone: '+91 98765 43210',
        location: 'Tech Campus, Innovation City',
    },
};

export const DEFAULT_CERT_SETTINGS: CertSettings = {
    organizerLogo: '', // Base64 placeholder
    organizerName: 'TECH INNOVATION UNIVERSITY',
    eventName: 'TAARUNYAM 2026',
    participation: {
        title: 'Certificate of Participation',
        mainText: 'has successfully participated in the event "{event}" organized during {eventName}. We appreciate the active involvement and commend the effort.',
        subText: '',
        eventDetails: 'Organized by Tech Innovation Society\nMarch 15, 2026 | Tech Campus Auditorium',
    },
    winner: {
        title: 'Certificate of Achievement',
        mainText: 'for outstanding performance and securing {position} Position in the event "{event}" organized during {eventName}.',
        achievementText: 'For exceptional technical expertise and dedication',
        eventDetails: 'Annual Technical Championship\nMarch 15, 2026 | Innovation Award Ceremony',
    },
    authorities: {
        coordinator: {
            name: 'Dr. Anjali Sharma',
            title: 'Event Coordinator',
            signature: '',
        },
        hod: {
            name: 'Prof. Rajesh Verma',
            title: 'Head of Department',
            signature: '',
        },
        principal: {
            name: 'Dr. Amit Chauhan',
            title: 'Principal',
            signature: '',
        },
    },
};

export const COURSES: string[] = [
    'B.Tech Computer Science & Engineering',
    'B.Tech Information Technology',
    'B.Tech Electronics & Communication',
    'B.Tech Mechanical Engineering',
    'B.Tech Civil Engineering',
    'B.Tech Electrical Engineering',
    'B.Tech Artificial Intelligence',
    'B.Tech Data Science',
    'B.Tech Cyber Security',
    'B.Tech Robotics',
    'B.Tech Aerospace Engineering',
    'BCA (Bachelor of Computer Applications)',
    'B.Sc Computer Science',
    'B.Sc Information Technology',
    'B.Sc Electronics',
    'B.Sc Mathematics',
    'MCA (Master of Computer Applications)',
    'M.Tech Computer Science',
    'M.Tech Information Technology',
    'MBA (IT)',
    'Diploma in Computer Science',
    'Diploma in Electronics',
    'Diploma in Mechanical',
    'Other',
];

import type { Participant } from '../types/participant.types';

export const MOCK_PARTICIPANTS: Participant[] = [
    {
        id: 'TR-1709230101',
        certificateId: 'cert-1111-2222-3333-4444',
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        college: 'Tech University',
        course: 'B.Tech Computer Science',
        year: '3rd Year',
        events: ['code-rush'],
        registeredAt: '2026-02-14T08:30:00Z',
        isWinner: true,
        winnerEvent: 'code-rush',
        certificateIssued: true,
        certificateSentAt: '2026-02-15T10:00:00Z',
    },
    {
        id: 'TR-1709230102',
        certificateId: 'cert-5555-6666-7777-8888',
        name: 'Jane Smith',
        email: 'jane@example.com',
        mobile: '9876543211',
        college: 'Engineering College',
        course: 'B.Tech IT',
        year: '4th Year',
        events: ['tech-quiz', 'hackathon'],
        registeredAt: '2026-02-15T09:15:00Z',
        isWinner: false,
        winnerEvent: null,
        certificateIssued: false,
        certificateSentAt: null,
    },
];
