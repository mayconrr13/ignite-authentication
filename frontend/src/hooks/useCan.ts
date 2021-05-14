import { validadeUserPermissions } from "../utils/validadeUserPermissions";
import { useAuth } from "./useAuth";


interface UseCanParams {
  permissions: string[];
  roles: string[];
}

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return false
  }

  const userHasValidPermissions = validadeUserPermissions({
    user,
    permissions,
    roles
  })

  return userHasValidPermissions
}