import { destroyCookie } from "nookies";
import { useEffect } from "react";
import Can from "../components/Can";
import { signOut, useAuth } from "../hooks/useAuth"
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user , signOut} = useAuth()

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
    roles: []
  })

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
      .catch(() => signOut())
  }, []);

  return (
    <>
      <h1>
      Dashboard: {user?.email} 
      </h1>

      <button onClick={signOut} >Sign Out</button>

      {/* with hooks only */}
      { userCanSeeMetrics && <p>Metrics with hook</p> }

      {/* With components */}
      <Can permissions={['metrics.list']}>
        <p>Metrics with components</p>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async(ctx) => {
  //refresh token pelo lado do servidor
  const apiClient = setupAPIClient(ctx)

  return {
    props: {}
  }
})