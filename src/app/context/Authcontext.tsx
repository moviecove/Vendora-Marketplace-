import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Get user + role
  const loadUser = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = sessionData.session?.user;

    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 🔥 Fetch role from profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    setUser({
      ...authUser,
      role: profile?.role || "buyer",
    });

    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          return;
        }

        // 🔥 Fetch role again on login
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUser({
          ...session.user,
          role: profile?.role || "buyer",
        });
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
