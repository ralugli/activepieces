import { Property, createAction } from '@activepieces/pieces-framework';
import { amazonS3CombinedAuth, AccessKeyAuthProps, OidcAuthProps } from '../auth';
import { createS3, createS3WithAssumeRole } from '../common';

export const readFile = createAction({
  auth: amazonS3CombinedAuth,
  name: 'read-file',
  displayName: 'Read File',
  description: 'Read a file from S3 to use it in other steps',
  props: {
    key: Property.ShortText({
      displayName: 'File Path',
      description: 'The full path to the file within your S3 bucket (e.g. "documents/report.csv" or "myfile.txt"). This is also called the S3 "key".',
      required: true,
    }),
  },
  async run(context) {
    const authProps = context.auth.props as AccessKeyAuthProps | OidcAuthProps;
    const { bucket } = authProps;
    const { key } = context.propsValue;
    const s3 = 'roleArn' in authProps
      ? await createS3WithAssumeRole({ auth: authProps, server: context.server })
      : createS3(authProps);

    const file = await s3.getObject({
      Bucket: bucket,
      Key: key,
    });
    const base64 = await file.Body?.transformToString('base64');
    if (!base64) {
      throw new Error(`Could not read file ${key} from S3`);
    }
    return await context.files.write({
      fileName: key,
      data: Buffer.from(base64, 'base64'),
    });
  },
});
