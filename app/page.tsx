"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import html2canvas from "html2canvas";

// Separate client component for floating emojis
const FloatingEmojis = () => {
  const [emojis, setEmojis] = useState<Array<{ id: number; left: string }>>([]);

  useEffect(() => {
    setEmojis(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
      }))
    );
  }, []);

  const getRandomEmoji = () => {
    const emojis = ["✨", "🌟", "🔮", "🎭", "⭐️"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {emojis.map(({ id, left }) => (
        <motion.span
          key={id}
          className="absolute text-4xl opacity-20"
          initial={{ y: "100vh" }}
          animate={{
            y: "-100vh",
            x: [0, 50, -50, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            delay: Math.random() * 20,
          }}
          style={{ left }}
        >
          {getRandomEmoji()}
        </motion.span>
      ))}
    </div>
  );
};

const CardWrapper = ({
  children,
  mounted,
  theme,
}: {
  children: React.ReactNode;
  mounted: boolean;
  theme: string | undefined;
}) => {
  return (
    <Card
      className={`w-full max-w-2xl ${
        mounted
          ? `backdrop-blur-md bg-white/95 dark:bg-[#222]/95 minimal:bg-white minimal:backdrop-blur-none`
          : "bg-white"
      } border-4 border-black dark:border-purple-500 minimal:border minimal:border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(147,51,234,1)] minimal:shadow-none`}
    >
      {mounted && theme !== "minimal" && (
        <div className="h-4 bg-black dark:bg-purple-500 w-full flex overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex w-full"
          >
            {["bg-red-400", "bg-blue-400", "bg-green-400", "bg-pink-400"].map(
              (color, i) => (
                <div key={i} className={`${color} h-full w-1/4`} />
              )
            )}
          </motion.div>
        </div>
      )}
      {children}
    </Card>
  );
};

const FortuneTeller = () => {
  const [name, setName] = useState("");
  const [fortune, setFortune] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const fortuneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Force initial theme application
    if (theme === "minimal") {
      document.documentElement.classList.add("minimal");
    }
  }, [theme]);

  // Handle theme changes
  useEffect(() => {
    if (mounted) {
      setIsThemeLoading(true);
      // Force a re-render when switching from minimal theme
      if (theme !== "minimal") {
        document.documentElement.classList.remove("minimal");
      } else {
        document.documentElement.classList.add("minimal");
      }

      // Ensure theme is fully applied
      requestAnimationFrame(() => {
        setTimeout(() => {
          setIsThemeLoading(false);
        }, 100);
      });
    }
  }, [theme, mounted]);

  // Add sound effects
  const [playPop] = useSound("/pop.mp3", { volume: 0.5 });
  const [playSuccess] = useSound("/success.mp3", { volume: 0.5 });

  // Custom cursor
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const generateFortune = useCallback(async () => {
    if (!name) return;
    setIsLoading(true);
    playPop();

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }

      const data = await response.json();
      setFortune(data.fortune);
      playSuccess();
    } catch (error) {
      console.error("Error fetching fortune:", error);
      setFortune("Oops! Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [name, playPop, playSuccess]);

  const downloadFortuneAsImage = async () => {
    if (fortuneRef.current && fortune) {
      const canvas = await html2canvas(fortuneRef.current);
      const link = document.createElement("a");
      link.download = "my-2025-fortune.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const shareOnSocial = async (platform: "twitter" | "facebook") => {
    const text = encodeURIComponent(`Check out my 2025 fortune: ${fortune}`);
    const url = encodeURIComponent(window.location.href);

    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    };

    window.open(links[platform], "_blank");
  };

  // Update ThemeToggle component
  const ThemeToggle = () => {
    const themes = ["light", "dark", "minimal"] as const;
    const themeIcons: Record<string, string> = {
      light: "🌞",
      dark: "🌙",
      minimal: "⚪",
    };

    const cycleTheme = () => {
      setIsThemeLoading(true);
      const currentIndex = themes.indexOf(theme as (typeof themes)[number]);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];

      // Handle minimal theme transition
      if (theme === "minimal") {
        document.documentElement.classList.remove("minimal");
        setTimeout(() => setTheme(nextTheme), 50);
      } else if (nextTheme === "minimal") {
        setTheme(nextTheme);
        document.documentElement.classList.add("minimal");
      } else {
        setTheme(nextTheme);
      }
    };

    return (
      <button
        onClick={cycleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-opacity-50 backdrop-blur-sm bg-black text-white"
        aria-label="Toggle theme"
        disabled={isThemeLoading}
      >
        {isThemeLoading ? "⏳" : themeIcons[theme ?? "light"]}
      </button>
    );
  };

  // Ensure consistent initial render
  if (!mounted || isThemeLoading) {
    return (
      <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
        <CardWrapper mounted={false} theme={undefined}>
          <div className="p-8 text-center">Loading...</div>
        </CardWrapper>
      </div>
    );
  }

  return (
    <>
      {mounted && (
        <>
          {/* Custom cursor */}
          <motion.div
            className="fixed w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mix-blend-screen pointer-events-none z-50 opacity-75"
            animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
            transition={{ type: "spring", damping: 3 }}
          />
          <motion.div
            className="fixed w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-green-400 mix-blend-screen pointer-events-none z-50 opacity-50"
            animate={{ x: mousePosition.x - 12, y: mousePosition.y - 12 }}
            transition={{ type: "spring", damping: 5, delay: 0.05 }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-lime-200 via-pink-200 to-sky-300 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 minimal:bg-white p-4 flex flex-col items-center justify-center overflow-hidden"
      >
        {mounted && theme !== "minimal" && <FloatingEmojis />}
        {mounted && <ThemeToggle />}

        <div className="text-center mb-4 relative z-10">
          <h1 className="text-2xl font-bold text-black dark:text-white minimal:text-black">
            {theme === "minimal"
              ? "Fortune Teller"
              : "🔮 Peek into Your 2025 Future 🔮"}
          </h1>
          <p className="text-sm text-black/70 dark:text-white/70 max-w-md mx-auto">
            {mounted ? (
              "Get ready for a vibe check from the future! Our AI fortune teller is serving up fresh predictions with a side of sass."
            ) : (
              <span className="opacity-0">Loading...</span>
            )}
          </p>
        </div>

        <CardWrapper mounted={mounted} theme={theme}>
          <CardHeader className="text-center p-4">
            <motion.div
              className="flex items-center justify-center gap-4 mb-4"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-6xl animate-none hover:animate-spin">
                🔮
              </span>
              <span className="text-6xl rotate-12">✨</span>
            </motion.div>
            <CardTitle className="text-5xl font-black text-black dark:text-white flex flex-col items-center gap-2">
              <span className="bg-blue-400 text-black px-6 py-3 rounded-lg transform -rotate-2">
                CookedFR
              </span>
              <span className="text-lg font-normal bg-black text-white px-4 py-1 rounded-full mt-2">
                ur 2025 fortune teller bestie
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Enhanced input with glow effect */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <Input
                type="text"
                placeholder="Drop ur name bestie..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer relative w-full text-lg border-2 border-black rounded-lg px-4 py-3 bg-gradient-to-r from-pink-100/50 to-purple-100/50 backdrop-blur-sm placeholder:text-transparent focus:ring-4 focus:ring-pink-400 focus:border-pink-400 shadow-inner"
                aria-label="Enter your name"
                onFocus={() => playPop()}
              />
              <span className="absolute left-4 top-4 text-gray-600 transition-all duration:300 peer-focus:-translate-y-8 peer-focus:text-sm peer-focus:text-pink-500 peer-focus:font-bold peer-valid:-translate-y-8 peer-valid:text-sm">
                Drop ur name bestie...
              </span>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left column: Fortune generation */}
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={generateFortune}
                    disabled={!name || isLoading}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-black font-bold py-3 border-2 border-black rounded-lg"
                  >
                    {isLoading ? "✨" : "Tell My Fortune!"}
                  </Button>
                </motion.div>

                {/* Fortune display */}
                <AnimatePresence mode="wait">
                  {fortune && (
                    <motion.div
                      ref={fortuneRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 bg-blue-200 rounded-lg border-2 border-black"
                    >
                      <p className="text-black text-lg font-medium">
                        {fortune}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right column: Share and Download */}
              <div className="space-y-4">
                {fortune && (
                  <>
                    <Button
                      onClick={downloadFortuneAsImage}
                      className="w-full bg-purple-400 text-black font-bold py-3 border-2 border-black rounded-lg"
                    >
                      📸 Save Fortune
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => shareOnSocial("twitter")}
                        className="flex-1 bg-blue-400 text-black font-bold py-3 border-2 border-black rounded-lg"
                      >
                        𝕏 Share
                      </Button>
                      <Button
                        onClick={() => shareOnSocial("facebook")}
                        className="flex-1 bg-indigo-400 text-black font-bold py-3 border-2 border-black rounded-lg"
                      >
                        📘 Share
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>

          {/* Only show bottom rainbow border when not in minimal theme */}
          {theme !== "minimal" && (
            <div className="h-4 bg-black dark:bg-purple-500 w-full flex overflow-hidden">
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex w-full"
              >
                {[
                  "bg-pink-400",
                  "bg-green-400",
                  "bg-blue-400",
                  "bg-red-400",
                ].map((color, i) => (
                  <div key={i} className={`${color} h-full w-1/4`} />
                ))}
              </motion.div>
            </div>
          )}
        </CardWrapper>
      </motion.div>
    </>
  );
};

export default FortuneTeller;
