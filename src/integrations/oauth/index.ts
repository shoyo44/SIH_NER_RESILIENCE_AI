// OAuth helpers — delegates directly to Supabase Auth.
import { supabase } from "../supabase/client";

type OAuthProvider = "google" | "github" | "azure" | "bitbucket" | "gitlab";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const oauthClient = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri,
          queryParams: opts?.extraParams,
        },
      });
      if (error) return { error };
      return { data };
    },
  },
};
