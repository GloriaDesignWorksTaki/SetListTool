import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type CheckEmailResponse = {
  exists: boolean;
  error?: string;
  errorCode?:
    | "method_not_allowed"
    | "email_required"
    | "missing_supabase_url"
    | "missing_service_role_key"
    | "supabase_admin_error"
    | "unexpected_error";
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckEmailResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      exists: false,
      error: "Method not allowed",
      errorCode: "method_not_allowed",
    });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!email) {
    return res.status(400).json({
      exists: false,
      error: "email is required",
      errorCode: "email_required",
    });
  }

  if (!supabaseUrl) {
    return res.status(500).json({
      exists: false,
      error: "NEXT_PUBLIC_SUPABASE_URL is missing",
      errorCode: "missing_supabase_url",
    });
  }

  if (!serviceRoleKey) {
    return res.status(500).json({
      exists: false,
      error: "SUPABASE_SERVICE_ROLE_KEY is missing",
      errorCode: "missing_service_role_key",
    });
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const normalizedEmail = email.toLowerCase();
    const perPage = 200;
    let page = 1;

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        return res.status(500).json({
          exists: false,
          error: error.message,
          errorCode: "supabase_admin_error",
        });
      }

      const users = data?.users ?? [];
      const exists = users.some((user) => user.email?.toLowerCase() === normalizedEmail);
      if (exists) {
        return res.status(200).json({ exists: true });
      }

      if (users.length < perPage) {
        break;
      }
      page += 1;
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unexpected error";
    return res.status(500).json({
      exists: false,
      error: message,
      errorCode: "unexpected_error",
    });
  }
}
