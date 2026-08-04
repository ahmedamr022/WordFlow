"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShellHeader } from "@/components/layout/app-shell-header";

export function DashboardHeader() {
  const [profile, setProfile] = useState<{
    nickname?: string;
    full_name?: string;
    english_level?: string;
    avatar_url?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("nickname, full_name, english_level, avatar_url")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
        } else {
          setProfile({
            nickname: user.user_metadata?.full_name || user.email?.split("@")[0] || "warm_dusk1679",
            english_level: "B1",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          });
        }
      }
    };

    fetchUserProfile();
  }, []);

  const username = profile?.nickname || profile?.full_name || "warm_dusk1679";
  const level = profile?.english_level || "B1";

  return (
    <AppShellHeader
      username={username}
      level={level}
      avatarUrl={profile?.avatar_url}
    />
  );
}

export default DashboardHeader;