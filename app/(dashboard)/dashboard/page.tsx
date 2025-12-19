import { createClient } from "@/lib/supabase/server";
import LinkManager from "@/components/dashboard/LinkManager";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user?.id)
    .order("position", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Links</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your links and track their performance
            </p>
          </div>
          {profile && (
            <Link
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Public Page</span>
            </Link>
          )}
        </div>
        <LinkManager initialLinks={links || []} />
      </div>
    </div>
  );
}
