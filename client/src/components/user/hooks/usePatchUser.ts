import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

export function usePatchUser(): (newData: User | null) => void {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  const { mutate: patchUser } = useMutation(
    (newUserData: User | null) => patchUserOnServer(newUserData, user),
    {
      onSuccess: (userData: User | null) => {
        updateUser(userData);
        toast({
          title: 'Updated user',
          status: 'success',
        });
      },
    },
  );

  return patchUser;
}
