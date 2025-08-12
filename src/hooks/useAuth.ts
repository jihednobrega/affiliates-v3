import { authContext } from "@/context/AuthContext";
import { useContext } from "react";

function useAuth() {
    return useContext(authContext);
}

export { useAuth };