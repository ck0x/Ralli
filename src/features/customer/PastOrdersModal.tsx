import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Clock, ArrowRight, Plus } from "lucide-react";
import { Order } from "@/types";

interface PastOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (order: Order) => void;
  orders: Order[];
  customerName: string;
}

export const PastOrdersModal: React.FC<PastOrdersModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  orders,
  customerName,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Welcome back, ${customerName}!`}
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-600">
          We found previous orders for you. You can quickly reorder one of these
          congfigurations, or start a fresh one.
        </p>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => onSelect(order)}
              className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left active:scale-[0.99]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">
                    {order.racketBrand} {order.racketModel}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.stringBrand}</span>
                    <span className="text-gray-400">•</span>
                    <span>{order.tension} lbs</span>
                    {order.preStretch && (
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">
                        Pre: {order.preStretch}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(
                      order.createdAt as unknown as string,
                    ).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full justify-center py-6 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Order
        </Button>
      </div>
    </Modal>
  );
};
