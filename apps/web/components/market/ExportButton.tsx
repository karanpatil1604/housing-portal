"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getExportUrl } from "@/lib/api/java-api";
import { Download, CheckCircle2 } from "lucide-react";

export function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setDone(false);
    try {
      const url = getExportUrl({ format: "csv" });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "housing_market_export.csv";
      a.click();
      URL.revokeObjectURL(objectUrl);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {
      alert("Export failed. Ensure the Java API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      loading={loading}
      variant={done ? "secondary" : "primary"}
      icon={done ? <CheckCircle2 size={14} /> : <Download size={14} />}
    >
      {done ? "Downloaded!" : "Export CSV"}
    </Button>
  );
}