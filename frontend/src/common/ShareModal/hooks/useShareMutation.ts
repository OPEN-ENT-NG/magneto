import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { PutShareResponse, ShareRight, odeServices } from "edifice-ts-client";

const useShareMutation = ({
  application,
  options,
}: {
  application: string;
  options?: UseMutationOptions<
    PutShareResponse,
    Error,
    {
      resourceId: string;
      rights: ShareRight[];
    }
  >;
}): UseMutationResult<
  PutShareResponse,
  Error,
  {
    resourceId: string;
    rights: ShareRight[];
  }
> => {
  return useMutation({
    mutationFn: async ({
      resourceId,
      rights,
    }: {
      resourceId: string;
      rights: ShareRight[];
    }) => await odeServices.share().saveRights(application, resourceId, rights),
    ...options,
  });
};

export default useShareMutation;
