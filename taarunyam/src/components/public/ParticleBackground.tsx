import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = `${Math.random() * 100}%`;
            p.style.animationDelay = `${Math.random() * 20}s`;
            p.style.animationDuration = `${15 + Math.random() * 10}s`;
            container.appendChild(p);
        }
        return () => {
            container.innerHTML = '';
        };
    }, []);

    return <div ref={containerRef} className="particles" />;
}
