"use client";

import { ServerDetailView } from "@/components/mcp/server-detail-view";

interface PageProps {
  params: { id: string };
}

export default function AdminServerDetailPage({ params }: PageProps) {
  return <ServerDetailView serverId={params.id} basePath="/admin/mcp/servers" />;
}
