import { useState, useEffect } from 'react';

interface CountdownValues {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

export function useCountdown(targetDate: string): CountdownValues {
    const [countdown, setCountdown] = useState<CountdownValues>(calculate(targetDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(calculate(targetDate));
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return countdown;
}

function calculate(targetDate: string): CountdownValues {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
    };
}
