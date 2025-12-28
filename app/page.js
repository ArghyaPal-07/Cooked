"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. UI Components (Defined Outside to prevent errors) ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-black/40 border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const NeonButton = ({ onClick, children, color = "green" }) => {
  const colorClasses = color === "green" 
    ? "bg-green-500 text-black hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]" 
    : "bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]";

  return (
    <button 
      onClick={onClick} 
      className={`${colorClasses} font-bold text-sm md:text-lg py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 tracking-wide uppercase mt-8 w-full md:w-auto`}
    >
      {children}
    </button>
  );
};

// --- 2. Slide Components ---

const SlideIntro = ({ data, onNext }) => {
  if (!data?.data?.user) return <div className="text-red-500">Error loading data.</div>;
  return (
    <GlassCard className="text-center max-w-lg mx-auto">
      <div className="mb-6"><span className="text-4xl md:text-6xl">👋</span></div>
      <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
        Oh, it's <span className="text-green-400">{data.data.user.display_name}</span>.
      </h1>
      <p className="text-lg md:text-2xl text-gray-300 italic font-light leading-relaxed">
        "{data.content.intro}"
      </p>
      <NeonButton onClick={onNext} color="white">Let's see the damage</NeonButton>
    </GlassCard>
  );
};

const SlideGenre = ({ data, onNext }) => (
  <GlassCard className="text-center max-w-xl mx-auto">
    <h2 className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-4">Your Vibe Check</h2>
    <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 py-2">
      {data.data.topGenre}
    </div>
    <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed">
      {data.content.genre_roast}
    </p>
    <NeonButton onClick={onNext} color="white">It gets worse...</NeonButton>
  </GlassCard>
);

const SlideArtist = ({ data, onNext }) => (
  <GlassCard className="flex flex-col items-center max-w-2xl mx-auto">
    <h2 className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-6">The Main Culprit</h2>
    <div className="relative group mb-6">
      <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
      <img 
        src={data.data.topArtist.images[0].url} 
        className="w-40 h-40 md:w-64 md:h-64 rounded-full border-4 border-white/20 relative z-10 object-cover shadow-2xl"
        alt="Top Artist"
      />
    </div>
    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 text-center">{data.data.topArtist.name}</h1>
    <div className="bg-red-500/10 border border-red-500/30 p-4 md:p-6 rounded-xl w-full">
      <p className="text-base md:text-lg text-red-200 text-center font-medium">"{data.content.artist_roast}"</p>
    </div>
    <NeonButton onClick={onNext} color="white">Check the tracks</NeonButton>
  </GlassCard>
);

const SlideTracks = ({ data, onNext }) => (
  <GlassCard className="w-full max-w-md mx-auto">
    <h2 className="text-center text-gray-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-2">On Repeat</h2>
    <p className="text-center text-gray-300 text-sm md:text-base mb-8 italic opacity-80">"{data.content.track_roast}"</p>
    <div className="space-y-3">
      {data.data.topTracks.map((track, i) => (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          key={track.id} 
          className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 md:p-4 rounded-xl border border-white/5 transition-colors"
        >
          <img src={track.album.images[2]?.url} className="w-10 h-10 md:w-12 md:h-12 rounded-md shadow-lg" alt="Album Art" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm md:text-base truncate">{track.name}</p>
            <p className="text-gray-400 text-xs md:text-sm truncate">{track.artists[0].name}</p>
          </div>
          <span className="text-gray-600 font-mono text-xs md:text-sm font-bold">#{i + 1}</span>
        </motion.div>
      ))}
    </div>
    <div className="flex justify-center">
      <NeonButton onClick={onNext} color="white">The Final Verdict</NeonButton>
    </div>
  </GlassCard>
);

const SlideVerdict = ({ data }) => (
  <GlassCard className="text-center max-w-xl mx-auto border-red-500/30 bg-red-950/20">
    <p className="text-red-500 font-mono tracking-[0.5em] text-sm mb-4">FINAL SCORE</p>
    <div className="relative inline-block mb-6">
       <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-8xl md:text-9xl font-black text-white relative z-10"
      >
        {data.content.final_verdict.score}
      </motion.div>
      <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse"></div>
    </div>
    <h2 className="text-2xl md:text-4xl font-bold text-gray-200 mb-6 uppercase tracking-tight">
      "{data.content.final_verdict.title}"
    </h2>
    <p className="text-lg md:text-xl text-gray-300 leading-relaxed opacity-90 mb-8">
      {data.content.final_verdict.summary}
    </p>
    <button 
      onClick={() => window.location.href='/'} 
      className="text-gray-500 text-sm hover:text-white underline decoration-red-500 underline-offset-4 transition-colors"
    >
      Accept Fate & Restart
    </button>
  </GlassCard>
);

// --- 3. Main Page Component ---

export default function Home() {
  const [status, setStatus] = useState("idle");
  const [roastData, setRoastData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && status === "idle") {
      setStatus("loading");
      fetchRoast(code);
    }
  }, []);

  const fetchRoast = async (code) => {
    try {
      const res = await fetch("/api/roast", { 
        method: "POST", 
        body: JSON.stringify({ code }) 
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        console.error("API Error:", data.error);
        setStatus("error");
        return;
      }

      setRoastData(data);
      setStatus("ready");
      window.history.replaceState({}, document.title, "/");
    } catch (e) { 
      console.error("Network Error:", e);
      setStatus("error");
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => prev + 1);

  // Array of components
  const slides = [SlideIntro, SlideGenre, SlideArtist, SlideTracks, SlideVerdict];
  const CurrentComponent = slides[currentSlide];

  return (
    <main className="min-h-screen w-full bg-black text-white font-sans overflow-x-hidden selection:bg-green-500 selection:text-black">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-green-600/20 rounded-full blur-[128px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
        
        {/* Header */}
        <header className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
           <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
             <span className="block w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
             COOKED.
           </div>
        </header>

        {/* ERROR STATE */}
        {status === "error" && (
          <GlassCard className="text-center border-red-500/50">
             <h2 className="text-3xl font-bold text-red-500 mb-2">System Overload.</h2>
             <p className="text-gray-400 mb-6">The AI couldn't handle your taste.</p>
             <NeonButton onClick={() => window.location.href='/'} color="white">Try Again</NeonButton>
          </GlassCard>
        )}

        {/* LOGIN SCREEN */}
        {status === "idle" && (
          <div className="text-center space-y-8 max-w-2xl px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-black tracking-tighter leading-none"
            >
              GET<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">COOKED</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl"
            >
              AI-powered music roasting. We expose your bad taste with receipts.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <NeonButton onClick={() => window.location.href='/api/login'} color="green">
                Login with Spotify
              </NeonButton>
            </motion.div>
          </div>
        )}

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
            <div className="text-xl md:text-2xl font-mono text-green-500 animate-pulse text-center px-4">
              ANALYZING LISTENING HISTORY...
            </div>
          </div>
        )}

        {/* ACTIVE SLIDES */}
        {status === "ready" && roastData && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full flex justify-center"
            >
              <CurrentComponent data={roastData} onNext={nextSlide} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}