"use client";

import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";
import { ShieldCheck, ShieldAlert } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat-age-gate",
});

const STORAGE_KEY = "thiankim-age-verified";

export default function AgeGate() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const verified =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    setOpen(verified !== "true");
    setMounted(true);
  }, []);

  const handleApprove = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setShowWarning(false);
    setOpen(false);
  };

  const handleReject = () => {
    setShowWarning(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open}>
      <DialogContent className="border-[#9B2C3B]/20 bg-white px-8 py-10 sm:px-10">
        <DialogTitle className="sr-only">Xác nhận độ tuổi</DialogTitle>
        <div
          className={cn(
            "flex flex-col gap-6 text-center",
            montserrat.variable,
          )}
        >
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#9B2C3B]/10 text-[#9B2C3B]">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.6} />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2C3B]">
              Thiên Kim Wine
            </p>
            <h2 className="mt-3 font-semibold text-2xl text-[#1C1C1C]">
              Quý khách đã đủ 18 tuổi?
            </h2>
            <p className="mt-2 font-normal text-sm text-[#1C1C1C]/80">
              Trang web cùng các loại rượu vang cao cấp và chỉ phù hợp với
              khách hàng từ 18 tuổi trở lên. Vui lòng xác nhận trước khi
              tiếp tục khám phá.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ECAA4D]/30 bg-[#9B2C3B]/5 px-4 py-3 text-xs text-[#1C1C1C]/70">
            Chiếu theo điều 31 Nghị định-CP, việc cung cấp thông tin rượu bia cho
            người dưới 18 tuổi là không hợp lệ.
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="border-[#1C1C1C]/15 text-[#1C1C1C]"
              onClick={handleReject}
            >
              Chưa đủ 18 tuổi
            </Button>
            <Button
              className="font-semibold uppercase tracking-wide bg-[#ECAA4D] text-[#1C1C1C] hover:bg-[#9B2C3B] hover:text-white focus-visible:ring-[#ECAA4D]"
              onClick={handleApprove}
            >
              Đủ 18 tuổi
            </Button>
          </div>

          {showWarning && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#9B2C3B]/10 px-4 py-3 text-xs text-[#9B2C3B]">
              <ShieldAlert className="h-4 w-4" strokeWidth={1.6} />
              <span>
                Rất tiếc, Thiên Kim Wine chỉ phục vụ khách hàng từ 18 tuổi trở
                lên.
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}