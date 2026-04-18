"use client";

import { ServerListView } from "@/components/mcp/server-list-view";

export default function AdminServerListPage() {
  return <ServerListView basePath="/admin/mcp/servers" />;
}
