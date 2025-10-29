import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string, avatarUrl?: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch profile when user is authenticated
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || "",
          }
        }
      });

      if (error) throw error;

      toast.success("Conta criada! Verifica o teu email para confirmação.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Erro ao criar conta");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login efetuado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou password incorretos");
      } else {
        toast.error(error.message || "Erro ao fazer login");
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Note: User will be redirected to Google, so code after this won't execute immediately
      // Success feedback will be shown after redirect via the auth state listener
    } catch (error: any) {
      console.error("Google sign in error:", error);

      // Handle specific error cases with Portuguese messages
      if (error.message?.includes("popup_closed_by_user") ||
          error.message?.includes("cancelled") ||
          error.message?.includes("canceled")) {
        toast.info("Login cancelado");
      } else if (error.message?.includes("already registered") ||
                 error.message?.includes("already exists") ||
                 error.message?.includes("Email already in use")) {
        toast.error("Email já registado com outro método de login");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Por favor confirma o teu email antes de fazer login");
      } else if (error.message?.includes("OAuth") ||
                 error.message?.includes("Provider")) {
        toast.error("Erro na autenticação com Google. Tenta novamente.");
      } else {
        toast.error(error.message || "Erro ao fazer login com Google");
      }

      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logout efetuado com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  const updateProfile = async (fullName: string, avatarUrl?: string) => {
    if (!user) throw new Error("Utilizador não autenticado");

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update auth metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });

      if (metadataError) throw metadataError;

      // Refresh profile data
      await refreshProfile();

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user) throw new Error("Utilizador não autenticado");

    try {
      // First, verify the password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

      if (verifyError) {
        toast.error("Password incorreta");
        throw verifyError;
      }

      // Delete the user account (Supabase will cascade delete profile, meals, goals)
      const { error: deleteError } = await supabase.rpc('delete_user');

      if (deleteError) {
        // If RPC doesn't exist, we need to sign out and inform the user
        console.error("Delete account error:", deleteError);
        toast.error("Por favor contacta o suporte para eliminar a conta");
        throw deleteError;
      }

      toast.success("Conta eliminada com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      if (error.message !== "Password incorreta") {
        toast.error(error.message || "Erro ao eliminar conta");
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast.success("Email de recuperação enviado! Verifica a tua caixa de email.");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Erro ao enviar email de recuperação");
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password alterada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error(error.message || "Erro ao alterar password");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        deleteAccount,
        resetPassword,
        updatePassword,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
