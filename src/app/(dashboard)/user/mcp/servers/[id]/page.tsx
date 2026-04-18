"use client";

import { ServerDetailView } from "@/components/mcp/server-detail-view";

interface PageProps {
  params: { id: string };
}

export default function UserServerDetailPage({ params }: PageProps) {
  return <ServerDetailView serverId={params.id} basePath="/user/mcp/servers" />;
}
