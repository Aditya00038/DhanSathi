"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import GovernmentSchemesCard from "@/components/dashboard/GovernmentSchemesCard";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { OccupationType, SocialCategoryType, UserSchemeProfile } from "@/lib/gov-schemes";

type UserProfile = {
  state?: string;
  age?: number;
  annualIncome?: number;
  occupation?: OccupationType;
  category?: SocialCategoryType;
};

export default function SchemesPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserSchemeProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setProfile(null);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          setProfile(null);
          return;
        }

        const p = snap.data() as UserProfile;
        if (
          typeof p.state === "string" && p.state.trim() &&
          typeof p.age === "number" &&
          typeof p.occupation === "string" &&
          typeof p.category === "string"
        ) {
          setProfile({
            state: p.state,
            age: p.age,
            annualIncome: typeof p.annualIncome === "number" ? p.annualIncome : undefined,
            occupation: p.occupation,
            category: p.category,
          });
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to load profile for schemes page:", error);
        setProfile(null);
      }
    };

    loadProfile();
  }, [user?.uid]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-8 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Government Schemes</h1>
            <p className="text-muted-foreground text-sm mt-1">Personalized scheme recommendations in one dedicated place.</p>
          </div>

          {user?.uid && <GovernmentSchemesCard userId={user.uid} profile={profile} />}
        </main>
      </div>
    </AuthGuard>
  );
}
