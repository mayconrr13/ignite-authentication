import { destroyCookie } from "nookies";
import { useEffect } from "react";
import { signOut, useAuth } from "../hooks/useAuth"
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useAuth()

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
      .catch(() => signOut())
  }, []);

  return (
    <h1>
     Dashboard: {user?.email} 
    </h1>
  )
}

export const getServerSiderProps = withSSRAuth(async(ctx) => {
  //refresh token pelo lado do servidor
  const apiClient = setupAPIClient(ctx)

  return {
    props: {}
  }
})