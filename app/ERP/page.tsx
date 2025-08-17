'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyComponent() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    }
  }, [router]);

  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
