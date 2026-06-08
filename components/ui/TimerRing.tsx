import Svg, { Circle } from 'react-native-svg';

type Props = {
  seconds: number;
  totalSeconds: number;
  size?: number;
  cor?: string;
  trackColor?: string;
}

export function TimerRing({ seconds, totalSeconds, size = 280, cor = '#ffffff', trackColor = '#1a1a1a' }: Props) {
    const espessura = 4
    const raio = (size - espessura) / 2;
    const circunferencia = 2 * Math.PI * raio;

    const progresso = totalSeconds > 0 ? seconds / totalSeconds : 0;

    const offset = circunferencia * (1 - progresso);

    return (
        <Svg width={size} height={size}>
            <Circle
                cx={size/2}
                cy={size/2}
                r={raio}
                stroke={trackColor}
                strokeWidth={espessura}
                fill="none"
            />
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={raio}
                stroke={cor}
                strokeWidth={espessura}
                fill="none"
                strokeDasharray={`${circunferencia} ${circunferencia}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </Svg>
    );
}
