"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ListReptile() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-[#e8e0d0] text-lg">Redirecting...</p>
    </div>
  );
}

/*
  Old form submission logic archived.
  Listing functionality moved to admin dashboard only.
*/