"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { SearchInput } from "@/components/dashboard/search-input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAdminUsers } from "@/lib/mock-data";
import { ROLE_BADGE_VARIANT } from "@/lib/types";

export default function AdminUsersPage(): React.ReactNode {
  const [search, setSearch] = useState("");

  const filtered = mockAdminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brukere</h1>
        <p className="mt-1 text-muted-foreground">
          Alle registrerte brukere på plattformen.
        </p>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Søk etter navn eller e-post..."
        className="max-w-sm"
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Opprettet</TableHead>
              <TableHead>Super Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Ingen brukere funnet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.workspace_name}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("nb-NO")}
                  </TableCell>
                  <TableCell>
                    {user.is_super_admin && (
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
