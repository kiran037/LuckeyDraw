"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import TicketList from "@/components/AdminUI/Tickets/TicketList";
import CreateTicketModal from "@/components/AdminUI/Tickets/CreateTicketModal";
import { useRouter } from "next/navigation";

interface TicketMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface User {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  avatar: string | null;
}

interface Draw {
  id: string;
  title: string;
  status: string;
  endTime: string;
}

interface Payment {
  id: string;
  status: string;
  method: string;
  amount: number;
}

interface TicketItem {
  id: string;
  ticketCode: string;
  userId: string;
  drawId: string;
  paymentId: string | null;
  pricePaid: number;
  status: string;
  source: string;
  isWinner: boolean;
  coverImage: string | null;
  createdByAdminId: string | null;
  createdAt: string;
  user: User;
  draw: Draw;
  payment: Payment | null;
}

interface TicketData {
  tickets: TicketItem[];
  meta: TicketMeta;
}

export default function TicketsPageClient({ initialData }: { initialData: TicketData }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Tickets</h1>
          <p className="text-sm text-zinc-500">
            View and manage all raffle tickets.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Manual Ticket
        </Button>
      </div>

      <TicketList tickets={initialData.tickets} meta={initialData.meta} />

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}