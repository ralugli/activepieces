import { Property, createAction } from '@activepieces/pieces-framework';
import { amazonS3CombinedAuth, AccessKeyAuthProps, OidcAuthProps } from '../auth';
import { resolveS3Client } from '../common';

export const deleteFile = createAction({
  auth: amazonS3CombinedAuth,
  name: 'deleteFile',
  displayName: 'Delete File',
  description: 'Deletes an existing file.',
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

    const s3 = await resolveS3Client({ authProps, server: context.server });

    const response = await s3.deleteObject({
      Bucket: bucket,
      Key: key,
    });

    return response
  },
});
