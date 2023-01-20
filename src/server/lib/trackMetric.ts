import { AWSError, CloudWatch } from 'aws-sdk';
import { Metrics } from '@/server/models/Metrics';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { awsConfig } from '@/server/lib/awsConfig';

const { stage: Stage } = getConfiguration();
// metric dimensions is a k-v pair
interface MetricDimensions {
  [name: string]: string;
}

const cloudwatch = new CloudWatch(awsConfig);

const defaultDimensions = {
  Stage,
  // ApiMode is the service name, using both ApiMode and Stage will keep
  // gateway in line with other identity metrics
  ApiMode: 'identity-gateway',
};

export const trackMetric = (
  metricName: Metrics,
  dimensions?: MetricDimensions,
): void => {
  if (process.env.RUNNING_IN_CYPRESS === 'true') {
    // return void in cypress
    return;
  }

  // merge defaultDimensions with dimensions from parameter in case some were changed,
  const mergedDimensions = {
    ...defaultDimensions,
    ...dimensions,
  };

  cloudwatch
    .putMetricData({
      Namespace: 'Gateway',
      MetricData: [
        {
          MetricName: metricName,
          Dimensions: Object.entries(mergedDimensions).map(([Name, Value]) => ({
            Name,
            Value,
          })),
          Value: 1,
          Unit: 'Count',
        },
      ],
    })
    .promise()
    .catch((error: AWSError) => {
      if (error.code.includes('ExpiredToken') && Stage === 'DEV') {
        logger.warn(
          'AWS Credentials Expired. Have you added `Identity` Janus credentials?',
        );
      } else {
        logger.warn('Track Metric Error', error);
      }
    });
};
