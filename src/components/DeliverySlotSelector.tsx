import { useState } from 'react';
import { Clock, Calendar, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isToday, isTomorrow } from 'date-fns';

interface DeliverySlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  extra_charge: number;
  max_orders: number;
  current_orders: number;
  available_days: number[];
}

interface DeliverySlotSelectorProps {
  onSelect: (date: Date, slot: DeliverySlot | null) => void;
  selectedDate?: Date;
  selectedSlotId?: string;
}

export function DeliverySlotSelector({ 
  onSelect, 
  selectedDate, 
  selectedSlotId 
}: DeliverySlotSelectorProps) {
  const [activeDate, setActiveDate] = useState<Date>(selectedDate || addDays(new Date(), 1));

  const { data: slots = [] } = useQuery({
    queryKey: ['delivery-slots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_slots')
        .select('*')
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;
      return data as DeliverySlot[];
    },
  });

  // Generate next 5 delivery dates
  const deliveryDates = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i + 1));

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE');
  };

  const getAvailableSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    return slots.filter(slot => {
      const availableDays = slot.available_days || [0, 1, 2, 3, 4, 5, 6];
      return availableDays.includes(dayOfWeek) && slot.current_orders < slot.max_orders;
    });
  };

  const availableSlots = getAvailableSlots(activeDate);

  const handleSlotSelect = (slot: DeliverySlot) => {
    onSelect(activeDate, slot);
  };

  const handleStandardDelivery = () => {
    onSelect(activeDate, null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-primary" />
          Choose Delivery Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {deliveryDates.map((date) => (
            <Button
              key={date.toISOString()}
              variant={activeDate.toDateString() === date.toDateString() ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0 flex-col h-auto py-2 px-3"
              onClick={() => setActiveDate(date)}
            >
              <span className="text-xs">{formatDateLabel(date)}</span>
              <span className="font-bold">{format(date, 'd')}</span>
              <span className="text-xs">{format(date, 'MMM')}</span>
            </Button>
          ))}
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          {/* Standard Delivery */}
          <button
            onClick={handleStandardDelivery}
            className={`w-full p-3 rounded-lg border text-left transition-colors ${
              !selectedSlotId 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Standard Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Delivery between 9 AM - 9 PM
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Free</Badge>
                {!selectedSlotId && <Check className="h-5 w-5 text-primary" />}
              </div>
            </div>
          </button>

          {/* Premium Slots */}
          {availableSlots.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground pt-2">Premium Time Slots</p>
              {availableSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const availability = slot.max_orders - slot.current_orders;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{slot.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </p>
                        {availability <= 5 && (
                          <p className="text-xs text-orange-500">
                            Only {availability} slots left
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {slot.extra_charge > 0 ? (
                          <Badge>+৳{slot.extra_charge}</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
