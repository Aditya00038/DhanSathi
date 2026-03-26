"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getRecommendedSchemes, searchSchemes, type UserSchemeProfile } from "@/lib/gov-schemes";

const labels = {
  title: "Government Scheme Recommendations",
  subtitle: "Personalized schemes to reduce your expenses and increase savings.",
  searchPlaceholder: "Search schemes...",
  estimated: "Estimated Savings Benefit",
  reason: "Why this matches",
  empty: "No matching schemes found.",
  bookmark: "Save",
  saved: "Saved",
  apply: "View / Apply",
};

type GovernmentSchemesCardProps = {
  userId: string;
  profile: UserSchemeProfile | null;
};

export default function GovernmentSchemesCard({ userId, profile }: GovernmentSchemesCardProps) {
  const [query, setQuery] = useState("");
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!userId) return;
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (!snap.exists()) return;
        const data = snap.data() as { bookmarkedSchemeIds?: string[] };
        if (Array.isArray(data.bookmarkedSchemeIds)) {
          setSavedSchemeIds(data.bookmarkedSchemeIds);
        }
      } catch (error) {
        console.error("Failed to load scheme bookmarks:", error);
      }
    };

    loadBookmarks();
  }, [userId]);

  const recommended = useMemo(() => {
    if (!profile) return [];
    const base = getRecommendedSchemes(profile, 12);
    return searchSchemes(base, query);
  }, [profile, query]);

  const toggleBookmark = async (schemeId: string) => {
    const next = savedSchemeIds.includes(schemeId)
      ? savedSchemeIds.filter((id) => id !== schemeId)
      : [...savedSchemeIds, schemeId];

    setSavedSchemeIds(next);
    try {
      await setDoc(doc(db, "users", userId), { bookmarkedSchemeIds: next }, { merge: true });
    } catch (error) {
      console.error("Failed to save scheme bookmark:", error);
    }
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Government Scheme Recommendations</CardTitle>
          <CardDescription>
            Add profile fields (state, age, income, occupation, category) to see personalized scheme suggestions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="pl-9"
          />
        </div>

        {recommended.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="space-y-3">
            {recommended.map((scheme) => {
              const isSaved = savedSchemeIds.includes(scheme.id);
              return (
                <div key={scheme.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold leading-tight">{scheme.name}</h4>
                      <p className="text-sm text-muted-foreground">{scheme.description}</p>
                    </div>
                    <Button
                      variant={isSaved ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleBookmark(scheme.id)}
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                      {isSaved ? labels.saved : labels.bookmark}
                    </Button>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">{labels.estimated}: </span>
                    <span>₹{scheme.estimatedAnnualBenefitInr.toLocaleString("en-IN")}/year</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">{labels.reason}: </span>
                    <span>{scheme.reason}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {scheme.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a href={scheme.url} target="_blank" rel="noreferrer" className="inline-flex">
                      <Button size="sm" variant="ghost">
                        {labels.apply}
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}