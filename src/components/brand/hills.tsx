export function FarmHills() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden">
      <svg viewBox="0 0 400 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <circle className="animate-sun origin-center" cx="318" cy="42" r="22" fill="#E8B15A" />
        <path
          className="animate-fade-up delay-2"
          d="M0 180 L0 108 Q70 58 150 98 T400 72 L400 180 Z"
          fill="#3F7A55"
        />
        <path
          className="animate-fade-up delay-3"
          d="M0 180 L0 128 Q110 88 200 122 T400 108 L400 180 Z"
          fill="#215C3A"
        />
        <path
          className="animate-fade-up delay-4"
          d="M0 180 L0 150 Q90 128 170 148 T400 136 L400 180 Z"
          fill="#163D28"
        />
      </svg>
      <span className="absolute left-1/2 top-6 block size-2 rounded-full bg-white/80 animate-[drip_1.6s_ease-in-out_infinite]" />
    </div>
  );
}
