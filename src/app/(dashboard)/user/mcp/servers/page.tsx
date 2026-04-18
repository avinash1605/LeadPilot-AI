"use client";

import { ServerListView } from "@/components/mcp/server-list-view";

export default function UserServerListPage() {
  return <ServerListView basePath="/user/mcp/servers" />;
}
