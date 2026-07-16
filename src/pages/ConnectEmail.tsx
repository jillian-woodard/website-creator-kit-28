import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Loader2, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type DetectedPurchase = Tables<"detected_purchases">;
type ConnectionStatus = { email_address: string | null; last_synced_at: string | null };

const CATEGORIES = ["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessory", "Activewear"];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly email";

const ConnectEmail = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [exchanging, setExchanging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [pending, setPending] = useState<DetectedPurchase[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [editing, setEditing] = useState<Record<string, Partial<DetectedPurchase>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const redirectUri = `${window.location.origin}/closet/connect-email`;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchConnection = useCallback(async () => {
    const { data, error } = await supabase
      .from("email_connection_status")
      .select("email_address, last_synced_at")
      .maybeSingle();
    if (!error) setConnection((data as ConnectionStatus) ?? null);
    setCheckingConnection(false);
  }, []);

  const fetchPending = useCallback(async () => {
    setLoadingPending(true);
    const { data, error } = await supabase
      .from("detected_purchases")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error) setPending(data || []);
    setLoadingPending(false);
  }, []);

  const handleScan = useCallback(async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-email-purchases", { body: {} });
      if (error || !data || data.error) {
        toast.error(data?.error || "Couldn't scan your email right now.");
        return;
      }
      if (data.found > 0) {
        toast.success(`Found ${data.found} new ${data.found === 1 ? "item" : "items"} to review.`);
      } else {
        toast.info("No new clothing purchases found.");
      }
      await fetchPending();
      await fetchConnection();
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Couldn't scan your email right now.");
    } finally {
      setScanning(false);
    }
  }, [fetchPending, fetchConnection]);

  useEffect(() => {
    if (user) {
      fetchConnection();
      fetchPending();
    }
  }, [user, fetchConnection, fetchPending]);

  // Handle the redirect back from Google with ?code=...&state=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");

    if (oauthError) {
      toast.error("Google sign-in was cancelled.");
      window.history.replaceState({}, "", redirectUri);
      return;
    }

    if (!code) return;

    const expectedState = sessionStorage.getItem("gmail_oauth_state");
    sessionStorage.removeItem("gmail_oauth_state");
    if (!state || state !== expectedState) {
      toast.error("Couldn't verify the connection request. Try again.");
      window.history.replaceState({}, "", redirectUri);
      return;
    }

    // Clear the query params right away so a refresh doesn't replay the code
    window.history.replaceState({}, "", redirectUri);

    (async () => {
      setExchanging(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("store-email-connection", {
          body: { code, redirectUri },
        });
        if (fnError || !data || data.error) {
          toast.error(data?.error || "Couldn't connect Gmail. Try again.");
          return;
        }
        toast.success(data.email ? `Connected ${data.email}` : "Gmail connected.");
        await fetchConnection();
        await handleScan();
      } catch (err) {
        console.error("Gmail connect error:", err);
        toast.error("Couldn't connect Gmail. Try again.");
      } finally {
        setExchanging(false);
      }
    })();
    // Runs once on mount to handle the OAuth redirect, intentionally not re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Email import isn't configured yet.");
      return;
    }
    const state = crypto.randomUUID();
    sessionStorage.setItem("gmail_oauth_state", state);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", GMAIL_SCOPE);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  };

  const getField = (item: DetectedPurchase, field: keyof DetectedPurchase) => {
    const override = editing[item.id];
    return override && override[field] !== undefined ? override[field] : item[field];
  };

  const setField = (id: string, field: keyof DetectedPurchase, value: string) => {
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleAddToCloset = async (item: DetectedPurchase) => {
    if (!user) return;
    setSavingId(item.id);
    const name = (getField(item, "item_name") as string) || "Imported item";
    const category = ((getField(item, "category") as string) || "Top").toLowerCase();
    const color = (getField(item, "color") as string) || null;
    const brand = (getField(item, "brand") as string) || null;

    const { data: inserted, error: insertErr } = await supabase
      .from("closet_items")
      .insert({
        user_id: user.id,
        name,
        category,
        color,
        brand,
        image_url: item.image_url,
        notes: item.merchant ? `Imported from email — ${item.merchant}` : "Imported from email",
      })
      .select()
      .single();

    if (insertErr || !inserted) {
      toast.error("Couldn't add this item to your closet.");
      setSavingId(null);
      return;
    }

    const { error: updateErr } = await supabase
      .from("detected_purchases")
      .update({ status: "added", closet_item_id: inserted.id })
      .eq("id", item.id);

    if (updateErr) {
      console.error("Failed to mark detected purchase as added:", updateErr);
    }

    toast.success(`${name} added to your closet`);
    setPending((prev) => prev.filter((p) => p.id !== item.id));
    setSavingId(null);
  };

  const handleDismiss = async (item: DetectedPurchase) => {
    setSavingId(item.id);
    const { error } = await supabase.from("detected_purchases").update({ status: "dismissed" }).eq("id", item.id);
    if (error) {
      toast.error("Couldn't dismiss this item.");
    } else {
      setPending((prev) => prev.filter((p) => p.id !== item.id));
    }
    setSavingId(null);
  };

  if (authLoading || checkingConnection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-sans">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/closet")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Closet
          </button>
          <span className="font-serif text-lg text-foreground">Import from email</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-16 py-12 max-w-3xl">
        {exchanging ? (
          <div className="text-center py-20">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-secondary font-sans">Connecting your email...</p>
          </div>
        ) : !connection ? (
          <div className="bg-card border border-border rounded-3xl shadow-soft p-8 text-center space-y-4">
            <Mail className="w-8 h-8 mx-auto text-primary" />
            <h1 className="font-serif text-2xl font-medium text-foreground">Skip the manual entry</h1>
            <p className="text-sm text-secondary font-sans max-w-md mx-auto">
              Connect Gmail and we'll scan for recent clothing order confirmations, then show you what we
              found so you can pick what goes into your closet. We only read receipts, nothing else, and you
              approve every item before it's added.
            </p>
            <Button
              onClick={handleConnect}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-sans text-sm gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              Connect Gmail
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 bg-card border border-border rounded-2xl shadow-soft p-4">
              <div>
                <p className="text-xs text-muted-foreground font-sans mb-1">Connected</p>
                <p className="font-sans text-sm text-foreground">{connection.email_address}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleScan}
                disabled={scanning}
                className="rounded-full font-sans text-sm gap-2"
              >
                {scanning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {scanning ? "Scanning..." : "Scan for new purchases"}
              </Button>
            </div>

            {loadingPending ? (
              <p className="text-secondary font-sans text-sm">Loading...</p>
            ) : pending.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-secondary font-sans mb-1">Nothing to review right now.</p>
                <p className="text-sm text-muted-foreground/60 font-sans">
                  Run a scan, or check back after your next order confirmation lands.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-sans">
                  {pending.length} item{pending.length === 1 ? "" : "s"} to review
                </p>
                {pending.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-2xl shadow-soft p-5 space-y-3">
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                          value={(getField(item, "item_name") as string) || ""}
                          onChange={(e) => setField(item.id, "item_name", e.target.value)}
                          placeholder="Item name"
                          className="font-sans"
                        />
                        <Select
                          value={(getField(item, "category") as string) || ""}
                          onValueChange={(v) => setField(item.id, "category", v)}
                        >
                          <SelectTrigger className="font-sans">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                          value={(getField(item, "brand") as string) || ""}
                          onChange={(e) => setField(item.id, "brand", e.target.value)}
                          placeholder="Brand"
                          className="font-sans"
                        />
                        <Input
                          value={(getField(item, "color") as string) || ""}
                          onChange={(e) => setField(item.id, "color", e.target.value)}
                          placeholder="Color"
                          className="font-sans"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-sans">
                        {item.merchant ? `${item.merchant} · ` : ""}
                        {item.price ? `${item.currency || "USD"} ${item.price} · ` : ""}
                        {item.purchase_date || ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCloset(item)}
                        disabled={savingId === item.id}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-sans text-sm gap-2"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Add to closet
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(item)}
                        disabled={savingId === item.id}
                        className="rounded-full font-sans text-sm gap-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ConnectEmail;
