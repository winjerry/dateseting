export type EventType = 'standard' | 'large';

export const EVENT_PRICES_USD: Record<EventType, number> = {
  standard: 4900,
  large: 9900,
};

export const EVENT_CAPACITIES: Record<EventType, number> = {
  standard: 100,
  large: 200,
};

