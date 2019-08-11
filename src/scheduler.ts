import schedule from 'node-schedule';
import flatten from 'lodash.flatten';

import { convertExpressionToCron, slsInvokeFunction } from './utils';

type FunctionProvider = () => {
  [functionName: string]: Serverless.Function;
};

type SchedulerConfig = {
  log?: (message: string) => void;
  functionProvider: FunctionProvider;
};

type FunctionConfiguration = {
  input: object;
  functionName: string;
  cron: string;
};

class OfflineScheduler {
  private log: (message: string) => void;
  private functionProvider: FunctionProvider;

  public constructor(config: SchedulerConfig) {
    const { log = console.log, functionProvider } = config;
    this.log = log;
    this.functionProvider = functionProvider;
  }

  public scheduleEventsStandalone = () => {
    this.log('Starting serverless-offline-schedule in standalone process. Press CTRL+C to stop.');
    return Promise.resolve(this.scheduleEvents()).then(this.listenForTermination);
  };

  public scheduleEvents = () => {
    const configurations = this.getFunctionConfigurations();

    configurations.forEach(functionConfiguration => {
      const { functionName, cron, input } = functionConfiguration;
      this.log(`Scheduling [${functionName}] cron: [${cron}] input: ${JSON.stringify(input)}`);

      schedule.scheduleJob(cron, () => {
        const func = slsInvokeFunction(functionName, input);
        if (func === undefined) {
          this.log(`Unable to find source for function [${functionName}]`);
          return;
        }
        this.log(`Succesfully invoked scheduled function: [${functionName}]`);
      });
    });
  };

  private getFunctionConfigurations = (): FunctionConfiguration[] => {
    const functions = this.functionProvider();

    const scheduleConfigurations = Object.keys(functions).map(functionName => {
      const functionConfig = functions[functionName];
      const { events } = functionConfig;
      const scheduleEvents = events.filter(event => event.hasOwnProperty('schedule'));

      return scheduleEvents.map(event => {
        return {
          functionName,
          cron: convertExpressionToCron(event['schedule'].rate),
          input: event['schedule'].input || {},
        };
      });
    });

    return flatten(scheduleConfigurations);
  };

  private listenForTermination = () => {
    // SIGINT: usually sent when user presses CTRL+C
    const waitForSigInt = new Promise(resolve => {
      process.on('SIGINT', () => resolve('SIGINT'));
    });

    // SIGTERM: default termination signal in many cases
    const waitForSigTerm = new Promise(resolve => {
      process.on('SIGTERM', () => resolve('SIGTERM'));
    });

    return Promise.race([waitForSigInt, waitForSigTerm]).then(command => {
      this.log(`Got ${command} signal. Stopping serverless-offline-scheduleer...`);
      process.exit(0);
    });
  };
}

export default OfflineScheduler;
