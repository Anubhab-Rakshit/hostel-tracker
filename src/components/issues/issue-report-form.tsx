"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Droplets,
  Zap,
  Sparkles,
  Wifi,
  Armchair,
  Building2,
  Shield,
  Thermometer,
  Bug,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, formatFileSize } from "@/lib/utils";
import { ParticleBackground } from "@/components/ui/particle-background";

const issueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  category: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high", "emergency"]),
  hostel: z.string().min(1, "Please select a hostel"),
  block: z.string().min(1, "Please enter your block"),
  floor: z.string().min(1, "Please select a floor"),
  room: z.string().min(1, "Please enter your room number"),
  isPublic: z.boolean(),
});

type IssueFormData = z.infer<typeof issueSchema>;

const steps = [
  { id: 1, title: "Category", description: "Select Type" },
  { id: 2, title: "Priority", description: "Urgency Level" },
  { id: 3, title: "Details", description: "Issue Specifics" },
  { id: 4, title: "Review", description: "Confirm" },
];

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-6 w-6" />,
  electrical: <Zap className="h-6 w-6" />,
  cleanliness: <Sparkles className="h-6 w-6" />,
  internet: <Wifi className="h-6 w-6" />,
  furniture: <Armchair className="h-6 w-6" />,
  structural: <Building2 className="h-6 w-6" />,
  security: <Shield className="h-6 w-6" />,
  ac_heating: <Thermometer className="h-6 w-6" />,
  pest_control: <Bug className="h-6 w-6" />,
  other: <MoreHorizontal className="h-6 w-6" />,
};

export function IssueReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [aiPrediction, setAiPrediction] = useState<{ category: string; confidence: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      hostel: session?.user?.hostel || "",
      block: session?.user?.block || "",
      floor: session?.user?.floor || "",
      room: session?.user?.room || "",
      isPublic: true,
    },
  });

  useEffect(() => {
    if (session?.user) {
      if (session.user.hostel) setValue("hostel", session.user.hostel);
      if (session.user.block) setValue("block", session.user.block);
      if (session.user.floor) setValue("floor", session.user.floor);
      if (session.user.room) setValue("room", session.user.room);
    }
  }, [session, setValue]);

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (images.length + newImages.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }
    setImages((prev) => [...prev, ...newImages]);
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await trigger(["category"]);
    else if (step === 2) isValid = await trigger(["priority"]);
    else if (step === 3) isValid = await trigger(["title", "description", "hostel", "block", "floor", "room"]);

    if (isValid) setStep((prev) => Math.min(prev + 1, 4));
  };

  const onSubmit = async (data: IssueFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
      images.forEach((image) => formData.append("files", image));

      const response = await fetch("/api/issues", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to create issue");

      const result = await response.json();
      toast.success("Issue reported successfully!");
      router.push(`/issues/${result.id}`);
    } catch (error) {
      toast.error("Failed to report issue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center py-10 relative z-10">

      {/* HUD Progress Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-6">
        <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6">
            SYSTEM STATUS
          </h2>
          <div className="space-y-6 relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10" />

            {steps.map((s) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="relative flex items-center gap-4 group">
                  <div className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    isActive ? "border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" :
                      isCompleted ? "border-indigo-500 bg-indigo-500 text-white" : "border-white/20 bg-black/40 text-white/30"
                  )}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{s.id}</span>}
                  </div>
                  <div>
                    <div className={cn("text-sm font-bold transition-colors", isActive ? "text-white" : "text-white/50")}>{s.title}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.description}</div>
                  </div>
                  {isActive && (
                    <motion.div layoutId="active-glow" className="absolute inset-0 bg-white/5 rounded-lg -z-10 -m-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Console Interface */}
      <div className="flex-1 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Hidden inputs to ensure RHF registration */}
          <input type="hidden" {...register("category")} />
          <input type="hidden" {...register("priority")} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 relative z-10"
              >
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Select Protocol</h3>
                    <p className="text-white/50 mt-1">Categorize the anomaly for routing.</p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">Step 1/4</Badge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {ISSUE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue("category", cat.id, { shouldValidate: true })}
                      className={cn(
                        "group relative p-6 rounded-xl border transition-all duration-300 flex flex-col items-center gap-4 text-center overflow-hidden",
                        selectedCategory === cat.id
                          ? "bg-indigo-500/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-full transition-all duration-300 group-hover:scale-110",
                        selectedCategory === cat.id ? "bg-indigo-500 text-white" : "bg-white/10 text-white/70"
                      )}>
                        {categoryIcons[cat.id]}
                      </div>
                      <span className={cn("font-medium", selectedCategory === cat.id ? "text-white" : "text-white/60")}>
                        {cat.name}
                      </span>
                      {selectedCategory === cat.id && (
                        <motion.div layoutId="selection-ring" className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-400 text-sm animate-pulse">{errors.category.message}</p>}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 relative z-10"
              >
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Urgency Level</h3>
                    <p className="text-white/50 mt-1">Determine response priority.</p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">Step 2/4</Badge>
                </div>

                <div className="space-y-4">
                  {PRIORITY_LEVELS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setValue("priority", p.id as any, { shouldValidate: true })}
                      className={cn(
                        "w-full relative flex items-center justify-between p-6 rounded-xl border transition-all duration-300 group",
                        selectedPriority === p.id
                          ? "border-transparent bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                          : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="h-3 w-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                        <div className="text-left">
                          <div className="text-lg font-bold text-white tracking-wide uppercase">{p.name}</div>
                          <div className="text-sm text-white/40">{p.description}</div>
                        </div>
                      </div>
                      {selectedPriority === p.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </motion.div>
                      )}

                      {/* Animated Highlight */}
                      {selectedPriority === p.id && (
                        <motion.div
                          layoutId="priority-highlight"
                          className="absolute inset-0 border border-white/20 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 relative z-10"
              >
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Issue Details</h3>
                    <p className="text-white/50 mt-1">Provide comprehensive documentation.</p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">Step 3/4</Badge>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Subject Title</Label>
                    <Input
                      {...register("title")}
                      className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-indigo-500 placeholder:text-white/20 transition-all h-14"
                      placeholder="e.g. Broken Pipe in Restroom"
                    />
                    {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Hostel Block</Label>
                      <Input
                        {...register("hostel")}
                        className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500 placeholder:text-white/20"
                        placeholder="Block A"
                      />
                      {errors.hostel && <p className="text-red-400 text-sm">{errors.hostel.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Floor</Label>
                      <Input
                        {...register("floor")}
                        className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500 placeholder:text-white/20"
                        placeholder="2nd"
                      />
                      {errors.floor && <p className="text-red-400 text-sm">{errors.floor.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Room No.</Label>
                      <Input
                        {...register("room")}
                        className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-500 placeholder:text-white/20"
                        placeholder="101"
                      />
                      {errors.room && <p className="text-red-400 text-sm">{errors.room.message}</p>}
                    </div>
                  </div>

                  {/* Hidden Inputs for Block/Floor completeness if needed, or we rely on session. For now user can edit Hostel/Room freely */}

                  <div className="space-y-2">
                    <Label className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Description</Label>
                    <Textarea
                      {...register("description")}
                      className="bg-white/5 border-white/10 focus-visible:ring-indigo-500/50 min-h-[150px] resize-none rounded-xl"
                      placeholder="Describe the issue in detail..."
                    />
                    {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Digital Evidence</Label>
                    <div {...getRootProps()} className={cn(
                      "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group",
                      isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}>
                      <input {...getInputProps()} />
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6 text-white/70" />
                      </div>
                      <p className="text-sm text-gray-400">Drop files here or click to upload</p>
                    </div>

                    {imagePreview.length > 0 && (
                      <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                        {imagePreview.map((src, i) => (
                          <div key={i} className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden group border border-white/20">
                            <img src={src} className="h-full w-full object-cover" alt="preview" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 relative z-10"
              >
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Final Verification</h3>
                    <p className="text-white/50 mt-1">Review data before submission.</p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">Step 4/4</Badge>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{watch("title")}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{watch("description")}</p>
                    </div>
                    <Badge variant={selectedPriority as any} className="capitalize px-3 py-1 text-sm">{selectedPriority} Priority</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Category</div>
                      <div className="flex items-center gap-2 text-white">
                        {categoryIcons[selectedCategory]}
                        <span className="capitalize">{ISSUE_CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Location</div>
                      <div className="text-white font-medium">
                        {watch("hostel")} • Room {watch("room")}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-10 flex justify-between pt-6 border-t border-white/10 relative z-10">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} className="text-white/50 hover:text-white hover:bg-white/5">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : <div />}

            {step < 4 ? (
              <Button type="button" onClick={nextStep} className="bg-white text-black hover:bg-white/90 rounded-full px-8 font-bold">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-10 font-bold shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Submit Report"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
