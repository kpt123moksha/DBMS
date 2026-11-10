import {createContext,useContext,useEffect,useState} from "react";
import api from "../services/api";
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{if(localStorage.getItem("campuscare_token"))api.get("/auth/me").then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem("campuscare_token")).finally(()=>setLoading(false));else setLoading(false);},[]);
 const login=async(email,password)=>{const {data}=await api.post("/auth/login",{email,password});localStorage.setItem("campuscare_token",data.token);setUser(data.user);return data.user;};
 const register=async(payload)=>api.post("/auth/register",payload);
 const logout=()=>{localStorage.removeItem("campuscare_token");setUser(null);};
 return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
