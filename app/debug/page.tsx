"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DebugPage() {
  const [profile, setProfile] = useState<any>(null);
  const [adminCheck, setAdminCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch profile
    fetch("/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);

        // Fetch admin check
        return fetch("/api/admin/check");
      })
      .then((res) => res.json())
      .then((data) => {
        setAdminCheck(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Debug fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            Loading debug info...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Auth0 Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="font-semibold">Is Admin: </span>
            {adminCheck?.isAdmin ? (
              <Badge className="bg-green-600">Yes</Badge>
            ) : (
              <Badge variant="destructive">No</Badge>
            )}
          </div>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(adminCheck, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Expected Admin Email: </span>
              <code className="bg-gray-100 px-2 py-1 rounded">
                chriskwon0@gmail.com
              </code>
            </div>
            <div>
              <span className="font-semibold">Your Email: </span>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {profile?.email || "N/A"}
              </code>
            </div>
            <div>
              <span className="font-semibold">Match: </span>
              {profile?.email === "chriskwon0@gmail.com" ? (
                <Badge className="bg-green-600">✓ Emails match</Badge>
              ) : (
                <Badge variant="destructive">✗ Emails don't match</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check if your email in Auth0 profile matches ADMIN_EMAIL</li>
            <li>Verify ADMIN_EMAIL is set in .env.local</li>
            <li>Restart the dev server after changing .env.local</li>
            <li>Clear browser cache and cookies</li>
            <li>Check browser console for errors</li>
            <li>Check server console for admin check logs</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
