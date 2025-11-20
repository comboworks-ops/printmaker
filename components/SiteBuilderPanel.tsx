"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import SiteCard from "./SiteCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PolarCheckoutButton } from "./polar/PolarCheckoutButton";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

export default function SiteBuilderPanel() {
  const { isSignedIn } = useUser();
  const sites =
    useQuery(
      isSignedIn ? api.sites.listSites : undefined,
      isSignedIn ? {} : undefined,
    ) ?? [];
  const createSite = useMutation(api.sites.createSite);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readySlug = useMemo(() => slug || slugify(name), [slug, name]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !readySlug) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!isSignedIn) {
        throw new Error("You must be signed in to create sites.");
      }
      await createSite({
        name: name.trim(),
        slug: readySlug,
        description: description.trim() || undefined,
      });
      setName("");
      setSlug("");
      setDescription("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create site right now",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-start justify-between space-y-0">
          <div>
            <CardTitle>Site builder preview</CardTitle>
            <CardDescription>
              Create landing pages powered by Convex data.
            </CardDescription>
          </div>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Convex data
          </span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site name</Label>
              <Input
                id="site-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Landing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-slug">Slug</Label>
              <Input
                id="site-slug"
                value={slug}
                onChange={(event) => setSlug(slugify(event.target.value))}
                placeholder="acme-landing"
              />
              <p className="text-xs text-muted-foreground">
                Preview URL: /sites/{readySlug || "your-site"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">Description</Label>
              <Textarea
                id="site-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Short summary shown on your dashboard."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {error ?? "Fill in the fields above and create your first site."}
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create site"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Need to unlock publishing?
          </p>
          <div className="flex gap-2">
            <PolarCheckoutButton />
            <Button variant="ghost" asChild>
              <a
                href="https://polar.sh/login"
                target="_blank"
                rel="noreferrer"
              >
                Polar dashboard
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing sites ({sites?.length ?? 0})</CardTitle>
          <CardDescription>
            Preview links render from <span className="font-mono">/sites/[slug]</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!sites || sites.length === 0) ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-muted-foreground">
              No sites yet. Use the form above to create one.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {sites.map((site) => (
                <SiteCard key={site._id} site={site} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

