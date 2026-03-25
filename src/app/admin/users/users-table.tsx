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
import { ROLE_BADGE_VARIANT } from "@/lib/types";
import type { AdminUser } from "@/lib/types";
import { createT } from "@/lib/i18n";

const t = createT("nb");

export function UsersTable({ users }: { users: AdminUser[] }): React.ReactNode {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('admin.users.search')}
        className="max-w-sm"
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.name')}</TableHead>
              <TableHead>{t('admin.users.email')}</TableHead>
              <TableHead>{t('admin.users.role')}</TableHead>
              <TableHead>{t('admin.users.workspace')}</TableHead>
              <TableHead>{t('admin.users.created')}</TableHead>
              <TableHead>{t('admin.users.superAdmin')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t('admin.users.noUsers')}
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
    </>
  );
}
