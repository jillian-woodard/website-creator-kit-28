import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStyle } from "@/lib/styleContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VibeStep from "@/components/interview/VibeStep";
import VisualCuesStep from "@/components/interview/VisualCuesStep";
import BodyStep from "@/components/interview/BodyStep";
import ShoppingPreferenceStep from "@/components/interview/ShoppingPreferenceStep";
import OccasionsStep from "@/components/interview/OccasionsStep";
import ABStep from "@/components/interview/ABStep";
import BudgetStep from "@/components/interview/BudgetStep";
import RecalibrationStep from "@/components/interview/RecalibrationStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const STEPS = ["Vibe", "Visual Cues", "Body", "Shopping", "Occasions", "Budget", "Recalibrate"];

const Interview = () => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, updateData } = useStyle();
  const { user, session, loading: authLoading } = useAuth();
  const autoFinishedRef = useRef(false);

  const enabledBudgets = () =>
    Object.entries(data.categoryBudgets ?? {}).filter(([, b]) => b?.enabled);

  const canProceed = () => {
    if (step === 0) return data.vibeDescription.trim().length > 0;
    if (step === 1) return data.selectedVisualCues.length > 0;
    if (step === 2) return data.bodyInputMethod !== null && data.heightInches !== null;
    if (step === 3) return data.shoppingPreference !== null;
    if (step === 4) return (data.occasions?.length ?? 0) > 0;
    if (step === 5) return enabledBudgets().length > 0;
    if (step === 6) return data.recalibrationCadence !== null;
    return true;
  };

  // Step 1: Generate AI results and show them. No auth required
  const generateAndPreview = async () => {
    setGenerating(true);
    try {
      const enabled = enabledBudgets();
      const mins = enabled.map(([, b]) => b.min);
      const maxes = enabled.map(([, b]) => b.max);
      const overallMin = mins.length > 0 ? Math.min(...mins) : data.budgetMin;
      const overallMax = maxes.length > 0 ? Math.max(...maxes) : data.budgetMax;

      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        "generate-style-profile",
        {
          body: {
            vibeDescription: data.vibeDescription,
            selectedVisualCues: data.selectedVisualCues,
            bodyInputMethod: data.bodyInputMethod,
            silhouetteType: data.silhouetteType,
            manualMeasurements: data.manualMeasurements,
            heightInches: data.heightInches,
            shoppingPreference: data.shoppingPreference,
            abChoices: data.abChoices,
            occasions: data.occasions,
            categoryBudgets: enabled.length > 0 ? Object.fromEntries(enabled) : null,
            budgetMin: overallMin,
            budgetMax: overallMax,
          },
        }
      );

      if (!aiError && aiResult && !aiResult.error) {
        updateData({
          aiKeywords: aiResult.keywords || [],
          aiSilhouettes: aiResult.silhouettes || [],
          aiStyleBrief: aiResult.style_brief || "",
          profileGenerated: true,
        });
      } else {
        updateData({ profileGenerated: true });
      }
    } catch (err) {
      console.error("Failed to generate style profile:", err);
      updateData({ profileGenerated: true });
    } finally {
      setGenerating(false);
      navigate("/profile");
    }
  };

  // Step 2: Save to DB. Called after sign-in or when logged-in user wants to persist
  const saveProfileToDb = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const enabled = enabledBudgets();
      const mins = enabled.map(([, b]) => b.min);
      const maxes = enabled.map(([, b]) => b.max);
      const overallMin = mins.length > 0 ? Math.min(...mins) : data.budgetMin;
      const overallMax = maxes.length > 0 ? Math.max(...maxes) : data.budgetMax;

      const profileData = {
        user_id: user.id,
        vibe_description: data.vibeDescription || null,
        selected_visual_cues: data.selectedVisualCues.length > 0 ? data.selectedVisualCues : null,
        body_input_method: data.bodyInputMethod || null,
        silhouette_type: data.silhouetteType || null,
        manual_measurements: data.manualMeasurements ? (data.manualMeasurements as any) : null,
        height_inches: data.heightInches ?? null,
        shopping_preference: data.shoppingPreference ?? null,
        ab_choices: data.abChoices.length > 0 ? data.abChoices : null,
        occasions: (data.occasions?.length ?? 0) > 0 ? data.occasions : null,
        category_budgets: enabled.length > 0 ? (Object.fromEntries(enabled) as any) : null,
        budget_min: overallMin,
        budget_max: overallMax,
        recalibration_cadence: data.recalibrationCadence ?? null,
        ai_keywords: data.aiKeywords?.length ? data.aiKeywords : null,
        ai_silhouettes: data.aiSilhouettes?.length ? data.aiSilhouettes : null,
        ai_style_brief: data.aiStyleBrief || null,
      };

      const { data: existing } = await supabase
        .from("style_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("style_profiles")
          .update({ ...profileData, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase.from("style_profiles").insert(profileData);
      }

      toast("Profile saved!");
    } catch (err) {
      console.error("Failed to save style profile:", err);
      toast("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else generateAndPreview();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/");
  };

  const isWorking = saving || generating;


  // Full-screen loading state while the AI runs
  if (generating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-6" />
        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">
          Building your profile
        </p>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground max-w-md text-center leading-tight">
          Reading your inputs. Finding your aesthetic.
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-4 max-w-sm text-center">
          This usually takes about 10 seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={back}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
            disabled={isWorking}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="font-serif text-lg text-foreground">Style Interview</span>
          <span className="text-sm text-muted-foreground font-sans">
            {step + 1} of {STEPS.length}
          </span>
        </div>
        {/* Progress */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-32 container mx-auto px-6 lg:px-16 max-w-3xl">
        <div className="animate-fade-in-up" key={step}>
          {step === 0 && <VibeStep />}
          {step === 1 && <VisualCuesStep />}
          {step === 2 && <BodyStep />}
          {step === 3 && <ShoppingPreferenceStep />}
          {step === 4 && <OccasionsStep />}
          {step === 5 && <BudgetStep />}
          {step === 6 && <RecalibrationStep />}
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="container mx-auto px-6 py-4 flex justify-end gap-3">
          {step !== 2 && step !== 3 && step !== 5 && step !== 6 && (
            <Button
              variant="outline"
              size="lg"
              onClick={next}
              disabled={isWorking}
              className="border-border text-muted-foreground hover:text-foreground px-8 py-5 text-base font-sans tracking-wide"
            >
              Skip
            </Button>
          )}
          <Button
            size="lg"
            onClick={next}
            disabled={!canProceed() || isWorking}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-5 text-base font-sans tracking-wide disabled:opacity-40"
          >
            {saving
              ? "Saving..."
              : step === STEPS.length - 1
              ? "See My Style Profile"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Interview;
