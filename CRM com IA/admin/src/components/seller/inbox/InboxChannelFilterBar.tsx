import { Button } from '@/components/ui/button';
import {
  INBOX_MESSAGE_CHANNEL_FILTERS,
  type InboxMessageChannelFilter,
} from '@/lib/metaInboxChannels';
import { cn } from '@/lib/utils';

type Props = {
  value: InboxMessageChannelFilter;
  onChange: (value: InboxMessageChannelFilter) => void;
  className?: string;
};

export function InboxChannelFilterBar({ value, onChange, className }: Props) {
  return (
    <div className={cn('flex flex-wrap gap-1 px-2 pb-2', className)}>
      {INBOX_MESSAGE_CHANNEL_FILTERS.map((ch) => (
        <Button
          key={ch.id}
          type="button"
          size="sm"
          variant={value === ch.id ? 'secondary' : 'ghost'}
          className="h-7 text-xs rounded-full"
          onClick={() => onChange(ch.id)}
        >
          {ch.label}
        </Button>
      ))}
    </div>
  );
}
