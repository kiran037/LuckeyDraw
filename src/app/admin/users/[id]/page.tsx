export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/AdminUI/ui/Badge";
import AddWalletModal from "@/components/AdminUI/Users/AddWalletModal";


/* ================= TYPES ================= */

interface Ticket {
    id: bigint;
    ticketCode: string;
    pricePaid: number;
    status: string;
    isWinner: boolean;
    draw: {
        title: string;
    };
}

interface Payment {
    id: bigint;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    draw: {
        title: string;
    };
}

interface WalletTransaction {
    id: bigint;
    type: string;
    amount: number;
    balanceAfter: number;
    source: string;
    createdAt: string;
}

interface Winner {
    id: bigint;
    declaredAt: string;
    draw: {
        title: string;
    };
    drawproduct: {
        name: string;
    };
}

interface UserDashboard {
    id: bigint;
    name: string;
    email: string | null;
    mobile: string;
    role: string;
    isActive: boolean;
    wallet: number;
    adharcard: string;
    pancard: string;
    address: string;
    createdAt: string;

    tickets: Ticket[];
    payment: Payment[];
    walletTransactions: WalletTransaction[];
    winners: Winner[];
}

/* ================= DATA FETCH ================= */

async function getUser(id: string): Promise<UserDashboard | null> {
    const headerList = await headers();
    const cookieStore = await cookies();

    const host = headerList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/admin/users/${id}`, {
        cache: "no-store",
        headers: { Cookie: cookieStore.toString() },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.user as UserDashboard;
}

/* ================= PAGE ================= */

export default async function UserViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">User not found</h2>
                    <p className="text-sm text-zinc-500">The user you're looking for doesn't exist</p>
                    <Link href="/admin/users" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Go back to users
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* HEADER */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-2xl font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/users"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Users
                        </Link>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Wallet Balance"
                        value={`₹${user.wallet.toLocaleString('en-IN')}`}
                        icon="💰"
                        color="blue"
                    />
                    <StatCard
                        label="Total Tickets"
                        value={user.tickets.length.toString()}
                        icon="🎫"
                        color="purple"
                    />
                    <StatCard
                        label="Total Wins"
                        value={user.winners.length.toString()}
                        icon="🏆"
                        color="yellow"
                    />
                    <StatCard
                        label="Total Payments"
                        value={user.payment.length.toString()}
                        icon="💳"
                        color="green"
                    />
                </div>

                {/* BASIC INFO */}
                <Card title="Basic Information" icon="👤">
                    <Grid cols={3}>
                        <InfoItem label="Full Name" value={user.name} />
                        <InfoItem label="Email Address" value={user.email || "Not provided"} />
                        <InfoItem label="Mobile Number" value={user.mobile} />
                        <InfoItem label="User Role" value={<Badge>{user.role}</Badge>} />
                        <InfoItem
                            label="Account Status"
                            value={
                                <Badge variant={user.isActive ? "success" : "neutral"}>
                                    {user.isActive ? "Active" : "Blocked"}
                                </Badge>
                            }
                        />
                        <InfoItem label="User ID" value={`#${user.id.toString()}`} />
                    </Grid>
                </Card>

                {/* DOCUMENTS */}
                <Card title="KYC Documents" icon="📄">
                    <Grid cols={3}>
                        <InfoItem label="Aadhar Card" value={user.adharcard || "Not provided"} />
                        <InfoItem label="PAN Card" value={user.pancard || "Not provided"} />
                        <InfoItem label="Address" value={user.address || "Not provided"} fullWidth />
                    </Grid>
                </Card>

                {/* TICKETS */}
                <Card title="Ticket History" icon="🎫" count={user.tickets.length}>
                    {user.tickets.length === 0 ? (
                        <Empty message="No tickets purchased yet" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        <TableHeader>Ticket Code</TableHeader>
                                        <TableHeader>Draw</TableHeader>
                                        <TableHeader>Price</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Result</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {user.tickets.map((t: Ticket) => (
                                        <tr key={t.id.toString()} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <TableCell>
                                                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                    {t.ticketCode}
                                                </span>
                                            </TableCell>
                                            <TableCell>{t.draw.title}</TableCell>
                                            <TableCell>₹{t.pricePaid.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'}>
                                                    {t.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {t.isWinner ? (
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">🏆 Winner</span>
                                                ) : (
                                                    <span className="text-zinc-400">—</span>
                                                )}
                                            </TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* PAYMENTS */}
                <Card title="Payment History" icon="💳" count={user.payment.length}>
                    {user.payment.length === 0 ? (
                        <Empty message="No payment transactions yet" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        <TableHeader>Amount</TableHeader>
                                        <TableHeader>Method</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Draw</TableHeader>
                                        <TableHeader>Date</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {user.payment.map((p: Payment) => (
                                        <tr key={p.id.toString()} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <TableCell>
                                                <span className="font-semibold text-zinc-900 dark:text-white">
                                                    ₹{p.amount.toLocaleString('en-IN')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge>{p.method}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'SUCCESS' ? 'success' : p.status === 'PENDING' ? 'neutral' : 'neutral'}>
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{p.draw.title}</TableCell>
                                            <TableCell>{new Date(p.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* WALLET */}
                <Card title="Wallet Transactions" icon="💰" count={user.walletTransactions.length}>
                    {user.walletTransactions.length === 0 ? (
                        <div className="overflow-x-auto">
                            <div className="mb-4">
                                <AddWalletModal userId={user.id.toString()} />
                            </div>
                            <Empty message="No wallet transactions yet" />
                        </div>
                    ) : (

                        <div className="overflow-x-auto">
                            <div className="mb-4">
                                <AddWalletModal userId={user.id.toString()} />
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        <TableHeader>Type</TableHeader>
                                        <TableHeader>Amount</TableHeader>
                                        <TableHeader>Balance After</TableHeader>
                                        <TableHeader>Source</TableHeader>
                                        <TableHeader>Date</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {user.walletTransactions.map((w: WalletTransaction) => (
                                        <tr key={w.id.toString()} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <TableCell>
                                                <Badge variant={w.type === 'CREDIT' ? 'success' : 'neutral'}>
                                                    {w.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={w.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {w.type === 'CREDIT' ? '+' : '-'}₹{w.amount.toLocaleString('en-IN')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">₹{w.balanceAfter.toLocaleString('en-IN')}</span>
                                            </TableCell>
                                            <TableCell>{w.source}</TableCell>
                                            <TableCell>{new Date(w.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* WINNERS */}
                <Card title="Winning History" icon="🏆" count={user.winners.length}>
                    {user.winners.length === 0 ? (
                        <Empty message="No wins yet" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        <TableHeader>Draw</TableHeader>
                                        <TableHeader>Prize</TableHeader>
                                        <TableHeader>Won On</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {user.winners.map((w: Winner) => (
                                        <tr key={w.id.toString()} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <TableCell>
                                                <span className="font-semibold">{w.draw.title}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                                    🏆 {w.drawproduct.name}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(w.declaredAt).toLocaleDateString('en-IN')}</TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

/* ================= UI HELPERS ================= */

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        yellow: 'from-yellow-500 to-yellow-600',
        green: 'from-green-500 to-green-600',
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-2xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Card({ title, icon, children, count }: { title: string; icon?: string; children: React.ReactNode; count?: number }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        {icon && <span>{icon}</span>}
                        {title}
                    </h2>
                    {count !== undefined && (
                        <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                            {count} {count === 1 ? 'item' : 'items'}
                        </span>
                    )}
                    
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
    const colsClass = cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-6`}>
            {children}
        </div>
    );
}

function InfoItem({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
    return (
        <div className={fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {value}
            </p>
        </div>
    );
}

function TableHeader({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            {children}
        </th>
    );
}

function TableCell({ children }: { children: React.ReactNode }) {
    return (
        <td className="px-4 py-4 text-sm text-zinc-700 dark:text-zinc-300">
            {children}
        </td>
    );
}

function Empty({ message }: { message: string }) {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500">{message}</p>
        </div>
    );
}