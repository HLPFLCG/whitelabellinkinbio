"use client";

import Image from "next/image";
import { Profile, Link, SocialLink } from "@/lib/types/database";
import { ExternalLink } from "lucide-react";

interface Props {
  profile: Profile;
  links: Link[];
  socialLinks: SocialLink[];
}

export default function ProfilePage({ profile, links, socialLinks }: Props) {
  const handleLinkClick = async (linkId: string, url: string) => {
    // Track click
    await fetch("/api/links/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    });

    // Open link
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile.avatar_url && (
            <div className="mb-4 flex justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile.display_name || profile.username}
          </h1>
          {profile.bio && (
            <p className="text-gray-600 max-w-md mx-auto">{profile.bio}</p>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center space-x-4 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {social.platform}
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No links yet</p>
            </div>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full bg-white hover:bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all p-5 text-left group border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-lg">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors ml-4 flex-shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by LinkHub</p>
        </div>
      </div>
    </div>
  );
}
