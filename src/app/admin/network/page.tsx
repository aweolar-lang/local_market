"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Network, User, ChevronRight, Activity, Wallet, ShieldAlert } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  referred_by: string | null;
  wallet_balance: number;
  mpesa_payment_status: string;
  is_affiliate: boolean;
  children: Profile[];
}

export default function AdminNetworkTree() {
  const router = useRouter();
  const { profile: secureProfile, user: authUser } = useUser();
  const [treeData, setTreeData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security check: Only admins allowed
    if (!secureProfile || !authUser) return;
    if (secureProfile.is_admin !== true) {
      router.push("/dashboard");
      return;
    }

    fetchAndBuildTree();
  }, [secureProfile, authUser, router]);

  const fetchAndBuildTree = async () => {
    // Fetch everyone from the database
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, referred_by, wallet_balance, mpesa_payment_status, is_affiliate");

    if (error || !data) {
      console.error("Error fetching network:", error);
      setLoading(false);
      return;
    }

    // 2. The Magic: Turn a flat list into a connected family tree
    const profileMap = new Map<string, Profile>();
    
    // First pass: put everyone in a map with an empty children array
    data.forEach((p) => {
      profileMap.set(p.id, { ...p, children: [] });
    });

    const roots: Profile[] = [];

    // Second pass: connect the children to their parents
    data.forEach((p) => {
      if (p.referred_by && profileMap.has(p.referred_by)) {
        // If they have a parent, put them in their parent's 'children' array
        profileMap.get(p.referred_by)!.children.push(profileMap.get(p.id)!);
      } else {
        // If they don't have a parent (or parent is missing), they are a Root node
        roots.push(profileMap.get(p.id)!);
      }
    });

    setTreeData(roots);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Network className="h-10 w-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Network Tree Map</h1>
            <p className="text-gray-400">Live visualization of your 3-Tier affiliate ecosystem.</p>
          </div>
        </div>

        {/* The Tree Container */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 overflow-x-auto shadow-2xl">
          {treeData.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No network data found.</p>
          ) : (
            <div className="space-y-4">
              {treeData.map((node) => (
                <TreeNode key={node.id} node={node} level={0} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const TreeNode = ({ node, level }: { node: Profile; level: number }) => {
  
  const getLevelColor = (lvl: number) => {
    if (lvl === 0) return "text-white bg-gray-800 border-gray-700"; // Root / Admin
    if (lvl === 1) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"; // Tier 1
    if (lvl === 2) return "text-blue-400 bg-blue-400/10 border-blue-400/20"; // Tier 2
    if (lvl >= 3) return "text-purple-400 bg-purple-400/10 border-purple-400/20"; // Tier 3+
    return "text-gray-400 bg-gray-800 border-gray-700";
  };

  return (
    <div className="flex flex-col">
      {/* The actual User Box */}
      <div className="flex items-center gap-3 py-2">
        {/* Indentation lines */}
        {Array.from({ length: level }).map((_, i) => (
          <div key={i} className="w-8 h-px bg-gray-800 shrink-0"></div>
        ))}

        <div className={`flex items-center gap-4 p-3 pr-6 rounded-xl border ${getLevelColor(level)} min-w-[300px]`}>
          <User className="h-5 w-5 opacity-70" />
          <div className="flex-1">
            <p className="font-bold text-sm">@{node.username || "System"}</p>
            <div className="flex gap-3 text-xs mt-1 opacity-70">
              <span className="flex items-center gap-1"><Wallet className="h-3 w-3"/> Ksh {node.wallet_balance}</span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3"/> 
                {node.mpesa_payment_status === 'success' ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>
          <div className="text-xs font-black uppercase tracking-wider opacity-50">
            {level === 0 ? "ROOT" : `L${level}`}
          </div>
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="border-l-2 border-gray-800/50 ml-[23px] my-1 flex flex-col gap-1">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};