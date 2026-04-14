import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Layout, 
  Newspaper, 
  Share2, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw,
  Zap,
  Box,
  Monitor,
  Smartphone,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { generateBrandImage, GenerationResult } from "@/src/lib/gemini";

type Medium = "billboard" | "newspaper" | "social post";

interface BrandAsset {
  medium: Medium;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

const INITIAL_ASSETS: Record<Medium, BrandAsset> = {
  billboard: { medium: "billboard", imageUrl: null, loading: false, error: null },
  newspaper: { medium: "newspaper", imageUrl: null, loading: false, error: null },
  "social post": { medium: "social post", imageUrl: null, loading: false, error: null },
};

export default function App() {
  const [productDescription, setProductDescription] = useState("");
  const [assets, setAssets] = useState<Record<Medium, BrandAsset>>(INITIAL_ASSETS);
  const [activeTab, setActiveTab] = useState<Medium>("billboard");

  const generateAsset = useCallback(async (medium: Medium) => {
    if (!productDescription.trim()) return;

    setAssets(prev => ({
      ...prev,
      [medium]: { ...prev[medium], loading: true, error: null }
    }));

    try {
      const aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = 
        medium === "billboard" ? "16:9" : 
        medium === "newspaper" ? "4:3" : "1:1";

      const result = await generateBrandImage(productDescription, medium, aspectRatio);
      
      setAssets(prev => ({
        ...prev,
        [medium]: { ...prev[medium], imageUrl: result.imageUrl, loading: false }
      }));
    } catch (err: any) {
      setAssets(prev => ({
        ...prev,
        [medium]: { ...prev[medium], loading: false, error: err.message || "Failed to generate image. Please try again." }
      }));
    }
  }, [productDescription]);

  const generateAll = async () => {
    if (!productDescription.trim()) return;
    const mediums: Medium[] = ["billboard", "newspaper", "social post"];
    await Promise.all(mediums.map(m => generateAsset(m)));
  };

  const downloadImage = (url: string, medium: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-${medium}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E4E3E0] font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] p-6 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.3)]">
            <Zap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Brand Builder</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#8E9299] font-mono">AI Visual Identity Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-[#1A1A1A] text-[#8E9299] font-mono text-[10px] px-2 py-0.5">
            Model: Nano-Banana
          </Badge>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="bg-[#151619] border-[#1A1A1A] shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-[#F27D26] mb-1">
                <Box className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Product Definition</span>
              </div>
              <CardTitle className="text-lg text-white">Describe Your Product</CardTitle>
              <CardDescription className="text-[#8E9299] text-xs">
                Detail the product's appearance, materials, and vibe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-widest text-[#8E9299] font-mono">
                  Product Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g. A sleek, minimalist glass water bottle with a matte black bamboo cap. Etched logo on the side. Soft natural lighting..."
                  className="bg-[#0A0A0A] border-[#1A1A1A] text-[#E4E3E0] min-h-[150px] focus-visible:ring-[#F27D26] resize-none"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
              <div className="p-3 bg-[#0A0A0A] rounded-md border border-[#1A1A1A] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#8E9299] leading-relaxed">
                  The engine will automatically ensure <span className="text-white">no people</span> are present and maintain <span className="text-white">product consistency</span> across all mediums.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                className="w-full bg-[#F27D26] hover:bg-[#D66A1E] text-white font-bold uppercase tracking-widest text-xs h-12 shadow-[0_0_20px_rgba(242,125,38,0.2)]"
                onClick={generateAll}
                disabled={!productDescription.trim() || (Object.values(assets) as BrandAsset[]).some(a => a.loading)}
              >
                {(Object.values(assets) as BrandAsset[]).some(a => a.loading) ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Full Identity
              </Button>
              <p className="text-[9px] text-center text-[#8E9299] font-mono uppercase tracking-tighter">
                Generates Billboard, Newspaper, and Social Post
              </p>
            </CardFooter>
          </Card>

          {/* Quick Tips */}
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#151619]/50">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#F27D26] mb-2">Consistency Tip</h3>
              <p className="text-xs text-[#8E9299]">Be specific about colors and unique design elements to help the AI maintain identity.</p>
            </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Medium)} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-[#151619] border border-[#1A1A1A] p-1 h-auto">
                <TabsTrigger 
                  value="billboard" 
                  className="data-[state=active]:bg-[#F27D26] data-[state=active]:text-white px-6 py-2 text-xs uppercase tracking-widest font-bold"
                >
                  <Monitor className="w-3.5 h-3.5 mr-2" />
                  Billboard
                </TabsTrigger>
                <TabsTrigger 
                  value="newspaper" 
                  className="data-[state=active]:bg-[#F27D26] data-[state=active]:text-white px-6 py-2 text-xs uppercase tracking-widest font-bold"
                >
                  <Newspaper className="w-3.5 h-3.5 mr-2" />
                  Newspaper
                </TabsTrigger>
                <TabsTrigger 
                  value="social post" 
                  className="data-[state=active]:bg-[#F27D26] data-[state=active]:text-white px-6 py-2 text-xs uppercase tracking-widest font-bold"
                >
                  <Smartphone className="w-3.5 h-3.5 mr-2" />
                  Social Post
                </TabsTrigger>
              </TabsList>

              <Button 
                variant="outline" 
                size="sm"
                className="border-[#1A1A1A] bg-[#151619] hover:bg-[#1A1A1A] text-[#E4E3E0] text-[10px] uppercase tracking-widest font-mono"
                onClick={() => generateAsset(activeTab)}
                disabled={!productDescription.trim() || assets[activeTab].loading}
              >
                {assets[activeTab].loading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Regenerate Current
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {(Object.entries(assets) as [Medium, BrandAsset][]).map(([key, asset]) => (
                <TabsContent key={key} value={key} className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-[#151619] border-[#1A1A1A] overflow-hidden shadow-2xl">
                      <div className="relative aspect-video bg-[#0A0A0A] flex items-center justify-center group">
                        {asset.loading ? (
                          <div className="w-full h-full p-8 space-y-4">
                            <Skeleton className="w-full h-full bg-[#1A1A1A] rounded-lg" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                              <Loader2 className="w-10 h-10 text-[#F27D26] animate-spin" />
                              <p className="text-[#8E9299] font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
                                Synthesizing Visual Identity...
                              </p>
                            </div>
                          </div>
                        ) : asset.error ? (
                          <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
                              <Info className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Generation Failed</h3>
                            <p className="text-xs text-[#8E9299] max-w-[280px] leading-relaxed">
                              {asset.error}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 border-[#1A1A1A] hover:bg-[#1A1A1A] text-[10px] uppercase tracking-widest font-mono"
                              onClick={() => generateAsset(asset.medium)}
                            >
                              <RefreshCw className="w-3 h-3 mr-2" />
                              Try Again
                            </Button>
                          </div>
                        ) : asset.imageUrl ? (
                          <>
                            <img 
                              src={asset.imageUrl} 
                              alt={`${asset.medium} mockup`}
                              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <Button 
                                size="icon" 
                                className="bg-white text-black hover:bg-[#F27D26] hover:text-white rounded-full transition-colors"
                                onClick={() => downloadImage(asset.imageUrl!, asset.medium)}
                              >
                                <Download className="w-5 h-5" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-4 text-[#8E9299]">
                            <div className="w-20 h-20 rounded-full border border-dashed border-[#1A1A1A] flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest font-mono">No asset generated yet</p>
                          </div>
                        )}
                        
                        {/* Frame Overlays based on medium */}
                        {key === "billboard" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F27D26] to-transparent opacity-50" />
                        )}
                        {key === "newspaper" && (
                          <div className="absolute inset-0 pointer-events-none border-[20px] border-[#E4E3E0]/5 mix-blend-overlay" />
                        )}
                      </div>
                      
                      <CardHeader className="border-t border-[#1A1A1A]">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm text-white uppercase tracking-wider flex items-center gap-2">
                              {key === "billboard" && <Monitor className="w-4 h-4 text-[#F27D26]" />}
                              {key === "newspaper" && <Newspaper className="w-4 h-4 text-[#F27D26]" />}
                              {key === "social post" && <Smartphone className="w-4 h-4 text-[#F27D26]" />}
                              {key} Mockup
                            </CardTitle>
                            <CardDescription className="text-[10px] font-mono mt-1">
                              {key === "billboard" && "16:9 Wide Format • High Contrast • Urban Context"}
                              {key === "newspaper" && "4:3 Classic Format • Print Texture • Editorial Context"}
                              {key === "social post" && "1:1 Square Format • Lifestyle Aesthetic • Digital Context"}
                            </CardDescription>
                          </div>
                          {asset.imageUrl && (
                            <Badge className="bg-[#1A1A1A] text-[#8E9299] border-none font-mono text-[9px]">
                              READY
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </Tabs>

          {/* Asset Grid Summary */}
          <div className="grid grid-cols-3 gap-4">
            {(Object.entries(assets) as [Medium, BrandAsset][]).map(([key, asset]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as Medium)}
                className={`p-4 rounded-xl border transition-all duration-300 text-left group ${
                  activeTab === key 
                    ? "bg-[#151619] border-[#F27D26] shadow-[0_0_15px_rgba(242,125,38,0.1)]" 
                    : "bg-[#151619]/30 border-[#1A1A1A] hover:border-[#F27D26]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${activeTab === key ? "bg-[#F27D26] text-white" : "bg-[#1A1A1A] text-[#8E9299]"}`}>
                    {key === "billboard" && <Monitor className="w-3.5 h-3.5" />}
                    {key === "newspaper" && <Newspaper className="w-3.5 h-3.5" />}
                    {key === "social post" && <Smartphone className="w-3.5 h-3.5" />}
                  </div>
                  {asset.imageUrl && <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]" />}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299] group-hover:text-white transition-colors">
                  {key}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-12 border-t border-[#1A1A1A] mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-30">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">BrandBuilder v1.0.4</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299] hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299] hover:text-white transition-colors">API Status</a>
          <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299] hover:text-white transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
