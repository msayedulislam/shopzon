import { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

interface InvoiceGeneratorProps {
  order: InvoiceData;
}

export function InvoiceGenerator({ order }: InvoiceGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text-based invoice for download
    const invoiceText = `
INVOICE
========================================

Order Number: ${order.orderNumber}
Date: ${format(new Date(order.orderDate), 'MMM d, yyyy HH:mm')}

Customer Information:
---------------------
Name: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}

Items:
------
${order.items.map(item => 
  `${item.name} x${item.quantity} - ৳${item.total.toLocaleString()}`
).join('\n')}

----------------------------------------
Subtotal:         ৳${order.subtotal.toLocaleString()}
Delivery:         ৳${order.deliveryCharge.toLocaleString()}
Discount:         -৳${order.discount.toLocaleString()}
----------------------------------------
TOTAL:            ৳${order.total.toLocaleString()}

Payment Method: ${order.paymentMethod.toUpperCase()}
Payment Status: ${order.paymentStatus}

========================================
Thank you for shopping with us!
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{order.orderNumber}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="bg-white dark:bg-card p-6 rounded-lg border print:border-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-primary">JHURI</h1>
              <p className="text-sm text-muted-foreground">Your Shopping Destination</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="text-sm text-muted-foreground">
                #{order.orderNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.orderDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            <p className="text-sm text-muted-foreground">{order.customerAddress}</p>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{item.name}</td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3">৳{item.price.toLocaleString()}</td>
                  <td className="text-right py-3">৳{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery:</span>
                <span>৳{order.deliveryCharge.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 pt-4 border-t flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Payment Method: </span>
              <span className="font-medium">{order.paymentMethod.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className="font-medium capitalize">{order.paymentStatus}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for shopping with Jhuri!</p>
            <p>For support, contact us at support@jhuri.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
