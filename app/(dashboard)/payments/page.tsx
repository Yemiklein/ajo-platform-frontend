"use client";

import TopBar from "@/components/shared/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Payments" />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-gray-400" size={28} />
              </div>
              <p className="text-gray-500 font-medium">Payments</p>
              <p className="text-gray-400 text-sm mt-1">
                To make a payment, go to your group detail page and click the
                Pay button for the current cycle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}