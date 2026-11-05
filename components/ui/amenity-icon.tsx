import {
  Waves,
  Dumbbell,
  Building2,
  Trees,
  Baby,
  ShieldCheck,
  Zap,
  Car,
  Trophy,
  Flower2,
  Laptop,
  Store,
  BellRing,
  PlugZap,
  Theater,
  Footprints,
  Sparkles,
  Sun,
  Circle,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "Swimming Pool": Waves,
  Gymnasium: Dumbbell,
  Clubhouse: Building2,
  "Landscaped Gardens": Trees,
  "Kids' Play Area": Baby,
  "24x7 Security": ShieldCheck,
  "Power Backup": Zap,
  "Covered Parking": Car,
  "Sports Court": Trophy,
  "Yoga Deck": Flower2,
  "Co-working Lounge": Laptop,
  "Retail Arcade": Store,
  Concierge: BellRing,
  "EV Charging": PlugZap,
  Amphitheatre: Theater,
  "Jogging Track": Footprints,
  Spa: Sparkles,
  "Rooftop Lounge": Sun,
};

export function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Circle;
  return <Icon className={className} aria-hidden />;
}
