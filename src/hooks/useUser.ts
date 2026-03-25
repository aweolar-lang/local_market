import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useUser() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authChannel: any;

    const loadDataAndSubscribe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      if (isMounted) setUser(session.user);

      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userProfile) {
        await supabase.auth.signOut();
        router.push("/auth/login");
        return;
      }

      if (isMounted) {
        setProfile(userProfile);
        setLoading(false);
      }

      authChannel = supabase
        .channel(`user-${session.user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
          async (payload) => {
            if (payload.eventType === 'DELETE') {
              await supabase.auth.signOut();
              router.push("/auth/login");
            } else if (payload.eventType === 'UPDATE' && isMounted) {
              setProfile(payload.new);
            }
          }
        )
        .subscribe();
    };

    loadDataAndSubscribe();

    return () => {
      isMounted = false;
      if (authChannel) supabase.removeChannel(authChannel);
    };
  }, [router]);

  return { profile, user, loading }; 
}