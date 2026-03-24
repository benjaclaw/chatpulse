"use client";

import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
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

function roleBadgeVariant(role: string) {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

export default function AdminUsersPage() {
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Søk etter navn eller e-post..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

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
                    <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
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
