import OfflineScheduler from '../src/scheduler';

const offlineScheduler = new OfflineScheduler({
  functionProvider: () => ({
    'schedule-function': {
      handler: 'src/functions/schedule-function.handler',
      events: [
        {
          schedule: {
            name: '1-minute',
            rate: 'rate(1 minute)',
            input: { scheduler: '1-minute' },
          },
        },
      ],
      name: 'my-service-dev-schedule-function',
    },
  }),
});

offlineScheduler.scheduleEventsStandalone();
