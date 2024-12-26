export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-900 to-slate-950 relative overflow-hidden">
      {/* Floating elements with enhanced animation */}
      <div className="absolute w-full h-full">
        <div className="absolute w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl top-1/4 -left-12 animate-pulse" />
        <div className="absolute w-32 h-32 bg-teal-500/10 rounded-full blur-3xl bottom-1/4 -right-12 animate-pulse delay-700" />
        <div className="absolute w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl top-3/4 left-1/4 animate-pulse delay-1000" />
        <div className="absolute w-48 h-48 bg-teal-500/5 rounded-full blur-3xl top-1/4 right-1/4 animate-pulse delay-500" />
      </div>

      <div className="space-y-8 text-center z-10">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-200 tracking-tighter hover:scale-105 transition-all duration-500 drop-shadow-2xl">
          CookedFR
        </h1>
        <p className="text-zinc-400 text-sm tracking-widest uppercase animate-pulse">
          vibes only
        </p>

        <div className="mt-8">
          <input
            type="text"
            placeholder="Enter your name..."
            className="w-64 px-4 py-2 bg-slate-950/50 border border-cyan-500/20 rounded-lg
              text-cyan-200 placeholder-cyan-500/50
              focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20
              hover:border-cyan-400/30 transition-all duration-300
              backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
}
