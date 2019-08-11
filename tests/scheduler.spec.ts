import schedule from 'node-schedule';

import Scheduler from '../src/scheduler';

describe('OfflineScheduler', () => {
  it('Should not schedule any jobs when no functions provided', () => {
    const log = jest.fn();
    const scheduler = new Scheduler({
      log,
      functionProvider: () => {
        return {};
      },
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledTimes(0);
  });

  it('Should not schedule and jobs when function with no evets provided', () => {
    const log = jest.fn();
    const scheduler = new Scheduler({
      log,
      functionProvider: () => {
        return {
          'get-user': {
            handler: 'src/handlers/get-useer.handler',
            events: [],
            name: 'my-service-dev-get-user',
          },
        };
      },
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledTimes(0);
  });

  it('Should schedule job when function with schedule provided', () => {
    const log = jest.fn();
    const scheduleJob = jest.spyOn(schedule, 'scheduleJob');
    const scheduler = new Scheduler({
      log,
      functionProvider: () => {
        return {
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
        };
      },
    });

    scheduler.scheduleEvents();
    expect(log).toBeCalledWith('Scheduling [schedule-function] with [*/1 * * * *]');
    expect(scheduleJob).toBeCalledTimes(1);
  });
});
