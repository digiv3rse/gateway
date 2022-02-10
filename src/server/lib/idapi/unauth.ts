import {
  APIAddClientAccessToken,
  APIForwardSessionIdentifier,
  APIPostOptions,
  idapiFetch,
  IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { GenericErrors } from '@/shared/model/Errors';

const handleError = ({ status = 500 }: IDAPIError) => {
  throw new IdapiError({ message: GenericErrors.DEFAULT, status });
};

export const logout = async (sc_gu_u: string, ip: string): Promise<unknown> => {
  const options = APIAddClientAccessToken(
    APIForwardSessionIdentifier(APIPostOptions(), sc_gu_u),
    ip,
  );
  try {
    return await idapiFetch({
      path: '/unauth',
      options,
    });
  } catch (error) {
    logger.error(`IDAPI Error auth logout '/unauth'`, error);
    return handleError(error as IDAPIError);
  }
};
