import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { isAuthenticated, signIn } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <form>
      <input 
        type="text" 
        placeholder="E-mail" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Senha" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Log in</button>
    </form>
  )
}
