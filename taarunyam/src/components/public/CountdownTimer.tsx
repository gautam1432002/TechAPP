import { useCountdown } from '../../hooks/useCountdown';

interface Props {
    targetDate: string;
}

export default function CountdownTimer({ targetDate }: Props) {
    const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

    if (expired) {
        return <div className="text-white text-xl font-bold">Event Started!</div>;
    }

    const units = [
        { value: days, label: 'Days' },
        { value: hours, label: 'Hours' },
        { value: minutes, label: 'Minutes' },
        { value: seconds, label: 'Seconds' },
    ];

    return (
        <div id="countdown" className="flex gap-4 justify-center items-center">
            {units.map((u) => (
                <div key={u.label} className="text-center">
                    <div className="countdown-digit rounded-xl p-4 min-w-[70px] md:min-w-[80px] flex items-center justify-center">
                        <span className="text-2xl md:text-3xl font-bold text-white">
                            {u.value.toString().padStart(2, '0')}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">{u.label}</p>
                </div>
            ))}
        </div>
    );
}
