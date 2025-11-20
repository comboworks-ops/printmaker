"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SiteCardProps = {
  site: {
    _id: string;
    name: string;
    slug: string;
    description?: string | null;
    published: boolean;
    theme?: Record<string, unknown> | null;
    createdAt: number;
  };
};

const formatDate = (timestamp: number) => {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
};

export default function SiteCard({ site }: SiteCardProps) {
  const previewHref = useMemo(
    () => `/sites/${encodeURIComponent(site.slug)}`,
    [site.slug],
  );

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 gap-3">
        <div>
          <CardTitle className="text-base">{site.name}</CardTitle>
          <CardDescription>/{site.slug}</CardDescription>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            site.published
              ? "bg-emerald-50 text-emerald-600"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {site.published ? "Published" : "Draft"}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600 line-clamp-2">
          {site.description ?? "No description yet."}
        </p>
        <p className="text-xs text-muted-foreground">
          Created {formatDate(site.createdAt)}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={previewHref}>Preview</Link>
          </Button>
          <Button variant="ghost" size="sm" disabled title="Editing UI coming soon">
            Edit soon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

