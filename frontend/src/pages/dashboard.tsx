import { useEffect } from "react";
import { signOut, useAuth } from "../hooks/useAuth"
import { api } from "../services/api";

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
