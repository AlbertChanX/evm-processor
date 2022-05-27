import { performance } from 'perf_hooks';
import {
  Counter,
  Gauge,
  Histogram,
  Pushgateway,
  register as globalRegistry,
} from 'prom-client';
import { Metric } from './metrics';

const monitoring = () => {
  type MarkedTimestamp = {
    [mark: string]: number;
  };

  let marks: MarkedTimestamp = {};

  const getNameFromMetric = (metric: Metric, suffix: string) => {
    // return `${process.env.CHAIN}_${metric.serviceName}_${metric.functionName}_${metric.metricName}`.toLocaleLowerCase();
    return (
      metric.functionName + (suffix ? '_' + suffix : '')
    ).toLocaleLowerCase();
  };

  const getOrCreateHistogram = (metric: Metric): Histogram<string> => {
    const name = getNameFromMetric(metric, 'timer');

    const promMetric = globalRegistry.getSingleMetric(name);
    if (promMetric) {
      return promMetric as Histogram<string>;
    }

    return new Histogram({
      name,
      help: `Elapsed time for the ${metric.functionName} function`,
      labelNames: ['chain'],
      registers: [globalRegistry],
    });
  };

  const getOrCreateCounter = (metric: Metric): Counter<string> => {
    const name = getNameFromMetric(metric, 'counter');

    const promMetric = globalRegistry.getSingleMetric(name);
    if (promMetric) {
      return promMetric as Counter<string>;
    }

    return new Counter({
      name,
      help: `Counter for the ${metric.functionName} function`,
      labelNames: ['chain'],
      registers: [globalRegistry],
    });
  };

  const getOrCreateGauge = (metric: Metric): Gauge<string> => {
    const name = getNameFromMetric(metric, 'gauge');

    const promMetric = globalRegistry.getSingleMetric(name);
    if (promMetric) {
      return promMetric as Gauge<string>;
    }

    return new Gauge({
      name,
      help: `Gauge for ${metric.functionName}`,
      labelNames: ['chain'],
      registers: [globalRegistry],
    });
  };

  return {
    markStart: (metric: Metric) => {
      marks[`start-${metric.functionName}`] = performance.now();
    },

    markEnd: (metric: Metric) => {
      marks[`end-${metric.functionName}`] = performance.now();
    },

    measure: (metric: Metric, startMetric?: Metric, endMetric?: Metric) => {
      const histogram = getOrCreateHistogram(metric);
      const timer = Math.abs(
        (marks[`end-${endMetric?.functionName || metric.functionName}`] ?? 0) -
          (marks[`start-${startMetric?.functionName || metric.functionName}`] ??
            0),
      );

      histogram.observe({ chain: process.env.CHAIN }, timer / 1000); // observe takes time in seconds
    },

    gauge: (value: number, metric: Metric) => {
      const gauge = getOrCreateGauge(metric);

      gauge.set({ chain: process.env.CHAIN }, value);
    },

    pushMetrics: async () => {
      const gateway = new Pushgateway(
        process.env.PUSHGATEWAY_URL!,
        {},
        globalRegistry,
      );

      return gateway.pushAdd({ jobName: 'pushgateway' });
    },
  };
};

export default monitoring();
